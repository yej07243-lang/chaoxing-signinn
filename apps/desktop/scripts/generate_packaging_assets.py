from __future__ import annotations

import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS_DIR = ROOT / "assets"
ICONS_DIR = ASSETS_DIR / "icons"
DMG_DIR = ASSETS_DIR / "dmg"
ICONSET_DIR = ICONS_DIR / "app.iconset"


def ensure_dirs() -> None:
    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    DMG_DIR.mkdir(parents=True, exist_ok=True)
    ICONSET_DIR.mkdir(parents=True, exist_ok=True)


def make_gradient(width: int, height: int, top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    image = Image.new("RGBA", (width, height))
    pixels = image.load()
    for y in range(height):
        mix = y / max(height - 1, 1)
        color = tuple(int(top[i] * (1 - mix) + bottom[i] * mix) for i in range(3))
        for x in range(width):
            pixels[x, y] = (*color, 255)
    return image


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def draw_icon(size: int) -> Image.Image:
    base = make_gradient(size, size, (20, 25, 31), (8, 12, 18))
    mask = rounded_mask(size, int(size * 0.23))
    icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    icon.paste(base, (0, 0), mask)

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse(
        (int(size * 0.1), int(size * 0.08), int(size * 0.9), int(size * 0.72)),
        fill=(39, 216, 201, 70),
    )
    glow_draw.ellipse(
        (int(size * 0.28), int(size * 0.22), int(size * 0.94), int(size * 0.88)),
        fill=(91, 144, 255, 90),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=size * 0.06))
    icon.alpha_composite(glow)

    draw = ImageDraw.Draw(icon)

    # Main rounded panel
    draw.rounded_rectangle(
        (int(size * 0.2), int(size * 0.18), int(size * 0.8), int(size * 0.82)),
        radius=int(size * 0.13),
        fill=(245, 248, 251, 255),
    )

    # Left status rail
    draw.rounded_rectangle(
        (int(size * 0.27), int(size * 0.28), int(size * 0.36), int(size * 0.72)),
        radius=int(size * 0.045),
        fill=(18, 22, 28, 255),
    )

    # Primary accent card
    draw.rounded_rectangle(
        (int(size * 0.41), int(size * 0.3), int(size * 0.68), int(size * 0.45)),
        radius=int(size * 0.05),
        fill=(20, 184, 166, 255),
    )

    # Secondary pills
    pill_color = (209, 250, 229, 255)
    draw.rounded_rectangle(
        (int(size * 0.41), int(size * 0.5), int(size * 0.73), int(size * 0.58)),
        radius=int(size * 0.04),
        fill=pill_color,
    )
    draw.rounded_rectangle(
        (int(size * 0.41), int(size * 0.62), int(size * 0.62), int(size * 0.7)),
        radius=int(size * 0.04),
        fill=(229, 231, 235, 255),
    )

    # Check mark badge
    cx = size * 0.68
    cy = size * 0.69
    r = size * 0.11
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(249, 115, 22, 255))
    stroke = max(3, int(size * 0.018))
    draw.line(
        [
            (cx - size * 0.04, cy),
            (cx - size * 0.01, cy + size * 0.03),
            (cx + size * 0.05, cy - size * 0.045),
        ],
        fill=(255, 255, 255, 255),
        width=stroke,
        joint="curve",
    )

    border = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    border_draw = ImageDraw.Draw(border)
    border_draw.rounded_rectangle(
        (1, 1, size - 2, size - 2),
        radius=int(size * 0.23),
        outline=(255, 255, 255, 24),
        width=max(1, int(size * 0.008)),
    )
    icon.alpha_composite(border)
    return icon


def save_pngs(master: Image.Image) -> None:
    master.save(ICONS_DIR / "app.png")
    sizes = [16, 32, 64, 128, 256, 512, 1024]
    for size in sizes:
        master.resize((size, size), Image.Resampling.LANCZOS).save(ICONS_DIR / f"app-{size}.png")


def build_iconset(master: Image.Image) -> None:
    mapping = {
        "icon_16x16.png": 16,
        "icon_16x16@2x.png": 32,
        "icon_32x32.png": 32,
        "icon_32x32@2x.png": 64,
        "icon_128x128.png": 128,
        "icon_128x128@2x.png": 256,
        "icon_256x256.png": 256,
        "icon_256x256@2x.png": 512,
        "icon_512x512.png": 512,
        "icon_512x512@2x.png": 1024,
    }
    for filename, size in mapping.items():
        master.resize((size, size), Image.Resampling.LANCZOS).save(ICONSET_DIR / filename)

    subprocess.run(
        ["iconutil", "-c", "icns", str(ICONSET_DIR), "-o", str(ICONS_DIR / "app.icns")],
        check=True,
    )


def build_ico(master: Image.Image) -> None:
    sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    master.save(ICONS_DIR / "app.ico", sizes=sizes)


def draw_grid(draw: ImageDraw.ImageDraw, width: int, height: int, step: int, color: tuple[int, int, int, int]) -> None:
    for x in range(0, width, step):
        draw.line((x, 0, x, height), fill=color, width=1)
    for y in range(0, height, step):
        draw.line((0, y, width, y), fill=color, width=1)


def draw_dmg_background(width: int, height: int, scale: int = 1) -> Image.Image:
    image = Image.new("RGBA", (width, height), (11, 15, 21, 255))
    gradient = make_gradient(width, height, (11, 15, 21), (17, 24, 39))
    image.alpha_composite(gradient)

    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse(
        (-int(width * 0.1), int(height * 0.18), int(width * 0.46), int(height * 1.02)),
        fill=(20, 184, 166, 90),
    )
    glow_draw.ellipse(
        (int(width * 0.45), -int(height * 0.12), int(width * 1.08), int(height * 0.68)),
        fill=(59, 130, 246, 95),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=38 * scale))
    image.alpha_composite(glow)

    draw = ImageDraw.Draw(image)
    draw_grid(draw, width, height, max(36, 36 * scale), (255, 255, 255, 12))

    panel = (
        int(width * 0.055),
        int(height * 0.095),
        int(width * 0.6),
        int(height * 0.82),
    )
    draw.rounded_rectangle(panel, radius=28 * scale, fill=(248, 250, 252, 235))

    # Fake title + lines for product feel
    left = panel[0] + 28 * scale
    top = panel[1] + 34 * scale
    draw.rounded_rectangle(
        (left, top, left + 78 * scale, top + 18 * scale),
        radius=9 * scale,
        fill=(20, 184, 166, 255),
    )
    draw.rounded_rectangle(
        (left, top + 36 * scale, left + 180 * scale, top + 52 * scale),
        radius=8 * scale,
        fill=(15, 23, 42, 240),
    )
    for idx, w in enumerate((150, 165, 120)):
        y = top + 86 * scale + idx * 26 * scale
        draw.rounded_rectangle(
            (left, y, left + w * scale, y + 12 * scale),
            radius=6 * scale,
            fill=(148, 163, 184, 180),
        )

    card_x = panel[0] + 28 * scale
    card_y = panel[1] + 188 * scale
    for col in range(2):
        for row in range(2):
            x0 = card_x + col * 128 * scale
            y0 = card_y + row * 92 * scale
            x1 = x0 + 108 * scale
            y1 = y0 + 72 * scale
            fill = (224, 242, 254, 255) if (row + col) % 2 == 0 else (224, 231, 255, 255)
            draw.rounded_rectangle((x0, y0, x1, y1), radius=18 * scale, fill=fill)
            draw.rounded_rectangle(
                (x0 + 16 * scale, y0 + 18 * scale, x0 + 62 * scale, y0 + 30 * scale),
                radius=6 * scale,
                fill=(15, 23, 42, 220),
            )
            draw.rounded_rectangle(
                (x0 + 16 * scale, y0 + 42 * scale, x0 + 86 * scale, y0 + 52 * scale),
                radius=5 * scale,
                fill=(100, 116, 139, 160),
            )

    # Arrow guidance
    arrow_y = int(height * 0.69)
    app_x = int(width * 0.41)
    dest_x = int(width * 0.76)
    draw.rounded_rectangle(
        (app_x + 46 * scale, arrow_y - 4 * scale, dest_x - 56 * scale, arrow_y + 4 * scale),
        radius=4 * scale,
        fill=(255, 255, 255, 145),
    )
    draw.polygon(
        [
            (dest_x - 56 * scale, arrow_y - 16 * scale),
            (dest_x - 24 * scale, arrow_y),
            (dest_x - 56 * scale, arrow_y + 16 * scale),
        ],
        fill=(255, 255, 255, 180),
    )

    # Drop target outline
    draw.rounded_rectangle(
        (int(width * 0.63), int(height * 0.18), int(width * 0.93), int(height * 0.82)),
        radius=28 * scale,
        outline=(255, 255, 255, 68),
        width=2 * scale,
    )

    return image


def save_dmg_backgrounds() -> None:
    base = draw_dmg_background(658, 498, 1)
    base.save(DMG_DIR / "background.png")
    retina = draw_dmg_background(1316, 996, 2)
    retina.save(DMG_DIR / "background@2x.png")


def main() -> None:
    ensure_dirs()
    master = draw_icon(1024)
    save_pngs(master)
    build_iconset(master)
    build_ico(master)
    save_dmg_backgrounds()
    print(f"Generated icons in {ICONS_DIR}")
    print(f"Generated DMG backgrounds in {DMG_DIR}")


if __name__ == "__main__":
    main()
