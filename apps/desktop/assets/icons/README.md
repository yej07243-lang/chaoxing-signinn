# Icons

Packaging icons are generated from the desktop asset script:

```bash
cd /Users/a1050/chaoxing-signinn
corepack pnpm@10.11.0 --filter chaoxing-sign-desktop assets
```

Generated files:

- `app.ico` for Windows installers and app icon
- `app.icns` for macOS app and DMG icon
- `app.png` as the high-resolution master image
- `app.iconset/*` intermediate PNG files used to build the `.icns`

If you want to replace the branding, update:

- `/Users/a1050/chaoxing-signinn/apps/desktop/scripts/generate_packaging_assets.py`
