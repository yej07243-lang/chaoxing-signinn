const path = require('path');
const fs = require('fs');

const iconBasePath = path.resolve(__dirname, 'assets/icons/app');
const dmgBackgroundPath = path.resolve(__dirname, 'assets/dmg/background.png');
const entitlementsPath = path.resolve(__dirname, 'assets/macos/entitlements.plist');

const fileExists = (target) => fs.existsSync(target);
const hasIcon = (ext) => fileExists(`${iconBasePath}.${ext}`);

const macSigningIdentity = process.env.APPLE_SIGN_IDENTITY;
const appleId = process.env.APPLE_ID;
const appleIdPassword = process.env.APPLE_ID_PASSWORD;
const appleTeamId = process.env.APPLE_TEAM_ID;

const windowsCertificateFile = process.env.WINDOWS_CERTIFICATE_FILE;
const windowsCertificatePassword = process.env.WINDOWS_CERTIFICATE_PASSWORD;

const packagerConfig = {
  asar: true,
  prune: false,
  ignore: [
    /^\/node_modules($|\/)/,
    /^\/src($|\/)/,
    /^\/ui\/src($|\/)/,
    /^\/ui\/node_modules($|\/)/,
    /^\/out($|\/)/
  ],
  icon: hasIcon(process.platform === 'darwin' ? 'icns' : 'ico') ? iconBasePath : undefined,
  appBundleId: 'com.chaoxing.sign.desktop',
  appCategoryType: 'public.app-category.productivity',
  executableName: 'ChaoxingSignDesktop',
  name: 'ChaoxingSignDesktop'
};

if (macSigningIdentity && fileExists(entitlementsPath)) {
  packagerConfig.osxSign = {
    identity: macSigningIdentity,
    hardenedRuntime: true,
    entitlements: entitlementsPath,
    entitlementsInherit: entitlementsPath
  };
}

if (appleId && appleIdPassword && appleTeamId) {
  packagerConfig.osxNotarize = {
    appleId,
    appleIdPassword,
    teamId: appleTeamId
  };
}

module.exports = {
  packagerConfig,
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'ChaoxingSignDesktop',
        setupExe: 'ChaoxingSignDesktopSetup.exe',
        setupIcon: hasIcon('ico') ? `${iconBasePath}.ico` : undefined,
        certificateFile: windowsCertificateFile || undefined,
        certificatePassword: windowsCertificatePassword || undefined
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        format: 'ULFO',
        title: 'Chaoxing Sign Desktop',
        icon: hasIcon('icns') ? `${iconBasePath}.icns` : undefined,
        iconSize: 100,
        background: fileExists(dmgBackgroundPath) ? dmgBackgroundPath : undefined,
        contents: (opts) => [
          { x: 180, y: 338, type: 'file', path: path.resolve(process.cwd(), opts.appPath) },
          { x: 478, y: 338, type: 'link', path: '/Applications' }
        ],
        additionalDMGOptions: {
          window: {
            size: {
              width: 658,
              height: 498
            }
          },
          'icon-size': 100,
          ...(macSigningIdentity
            ? {
                'code-sign': {
                  'signing-identity': macSigningIdentity,
                  identifier: 'com.chaoxing.sign.desktop'
                }
              }
            : {})
        }
      }
    }
  ]
};
