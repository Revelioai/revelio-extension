import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import { Manifest } from 'webextension-polyfill';
import { version } from './environments/environment';
import { Environments } from './types/environment';

if (version === undefined) throw new Error('version is undefined');

type Parameters = {
  name: string;
  icons: {
    '16': string;
    '32': string;
    '48': string;
    '128': string;
  };
};

function getParameters(env: Environments | undefined): Parameters {
  if (env === 'development') {
    return {
      name: 'Nefture Dev',
      icons: {
        '16': 'assets/logos/logo-dev.png',
        '32': 'assets/logos/logo-dev.png',
        '48': 'assets/logos/logo-dev.png',
        '128': 'assets/logos/logo-dev.png',
      },
    };
  }

  throw new Error('logos not setup yet');

  if (env === 'staging') {
    return {
      name: 'Nefture Staging',
      icons: {
        '16': 'assets/logos/logo-staging16.png',
        '32': 'assets/logos/logo-staging32.png',
        '48': 'assets/logos/logo-staging48.png',
        '128': 'assets/logos/logo-staging128.png',
      },
    };
  }
  return {
    name: 'Nefture',
    icons: {
      '16': 'assets/logos/logo-prod16.png',
      '32': 'assets/logos/logo-prod32.png',
      '48': 'assets/logos/logo-prod48.png',
      '128': 'assets/logos/logo-prod128.png',
    },
  };
}

const environment = process.env.NODE_ENV as Environments | undefined;

const { name, icons } = getParameters(environment);

export const manifest: Manifest.WebExtensionManifest = {
  manifest_version: 3,
  name,
  version: version,
  description: 'TODO', // TODO
  icons,
  background: {
    service_worker: 'background.bundle.js',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      js: ['content.bundle.js'],
      css: [],
      all_frames: true,
      run_at: 'document_start',
    },
  ],
  action: {
    default_popup: 'popup.html',
  },
  permissions: ['storage', 'tabs'],
  web_accessible_resources: [
    {
      resources: ['attach.bundle.js'],
      matches: ['<all_urls>'],
    },
  ],
};
