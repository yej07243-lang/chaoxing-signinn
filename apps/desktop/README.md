# Desktop App

Electron desktop shell with a dedicated React + Vite renderer. This app does not load the web frontend remotely. It packages the local renderer build and talks to `apps/server` through the configured API base URL.

## File tree

```txt
apps/desktop/
├── assets/
│   ├── dmg/
│   │   ├── background.png
│   │   └── background@2x.png
│   ├── icons/
│   │   ├── app.ico
│   │   ├── app.icns
│   │   ├── app.iconset/
│   │   ├── app.png
│   │   └── README.md
│   └── macos/
│       └── entitlements.plist
├── electron/
│   ├── main/
│   │   └── index.js
│   └── preload/
│       └── index.js
├── scripts/
│   └── generate_packaging_assets.py
├── ui/
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── styles.css
│       ├── vite-env.d.ts
│       ├── lib/
│       │   └── electron.ts
│       ├── components/
│       │   ├── Section.tsx
│       │   ├── ShellLayout.tsx
│       │   ├── StatCard.tsx
│       │   └── ToastViewport.tsx
│       └── pages/
│           ├── DashboardPage.tsx
│           ├── LoginPage.tsx
│           ├── LogsPage.tsx
│           ├── SettingsPage.tsx
│           └── TasksPage.tsx
├── forge.config.js
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Development

From the repo root:

```bash
cd /Users/a1050/chaoxing-signinn
corepack pnpm@10.11.0 install
corepack pnpm@10.11.0 --filter chaoxing-sign-desktop start
```

## Packaging assets

Regenerate icons and DMG artwork:

```bash
cd /Users/a1050/chaoxing-signinn
corepack pnpm@10.11.0 --filter chaoxing-sign-desktop assets
```

## Packaging commands

macOS package directory:

```bash
cd /Users/a1050/chaoxing-signinn
corepack pnpm@10.11.0 --filter chaoxing-sign-desktop package
```

macOS distributables (`.dmg` + `.zip`):

```bash
cd /Users/a1050/chaoxing-signinn
corepack pnpm@10.11.0 --filter chaoxing-sign-desktop make:mac
```

Windows distributables (`.exe`, `.nupkg`, `RELEASES`) on a Windows runner:

```bash
cd /Users/a1050/chaoxing-signinn
corepack pnpm@10.11.0 --filter chaoxing-sign-desktop make:win
```

## Signing

Signing is wired through environment variables so packaging config stays source-controlled.

### macOS signing

Set these before running the mac packaging commands:

```bash
export APPLE_SIGN_IDENTITY="Developer ID Application: Your Name (TEAMID)"
export APPLE_ID="your-apple-id@example.com"
export APPLE_ID_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="TEAMID"
```

CI secrets for GitHub Actions:

- `APPLE_CERTIFICATE_P12_BASE64`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGN_IDENTITY`
- `APPLE_ID`
- `APPLE_ID_PASSWORD`
- `APPLE_TEAM_ID`

### Windows signing

Set these before running the Windows packaging command:

```bash
export WINDOWS_CERTIFICATE_FILE="/absolute/path/to/certificate.pfx"
export WINDOWS_CERTIFICATE_PASSWORD="your-password"
```

CI secrets for GitHub Actions:

- `WINDOWS_CERTIFICATE_PFX_BASE64`
- `WINDOWS_CERTIFICATE_PASSWORD`

## Release flow

Ad hoc packaging without publishing:

```bash
GitHub Actions -> Desktop Packaging
```

Signed release publishing:

1. Add the signing secrets listed above in the repository settings
2. Push a tag like `v1.0.1`, or run `Desktop Release` manually and provide the tag
3. The workflow builds macOS and Windows installers, then attaches them to a GitHub Release

The release workflow file is:

- `/Users/a1050/chaoxing-signinn/.github/workflows/desktop-release.yml`

## Notes

- DMG backgrounds live in `/Users/a1050/chaoxing-signinn/apps/desktop/assets/dmg`
- macOS entitlements live in `/Users/a1050/chaoxing-signinn/apps/desktop/assets/macos/entitlements.plist`
- Native DMG dependencies `fs-xattr` and `macos-alias` are marked as built dependencies in the workspace config so a fresh install can package without manual rebuilds
