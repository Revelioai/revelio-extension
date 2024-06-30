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
      name: 'Revelio Dev',
      icons: {
        '16': 'assets/logos/logo-dev.png',
        '32': 'assets/logos/logo-dev.png',
        '48': 'assets/logos/logo-dev.png',
        '128': 'assets/logos/logo-dev.png',
      },
    };
  }

  if (env === 'staging') {
    return {
      name: 'Revelio Staging',
      icons: {
        '16': 'assets/logos/logo-staging.png',
        '32': 'assets/logos/logo-staging.png',
        '48': 'assets/logos/logo-staging.png',
        '128': 'assets/logos/logo-staging.png',
      },
    };
  }
  return {
    name: 'Revelio',
    icons: {
      '16': 'assets/logos/logo-prod.png',
      '32': 'assets/logos/logo-prod.png',
      '48': 'assets/logos/logo-prod.png',
      '128': 'assets/logos/logo-prod.png',
    },
  };
}

const environment = process.env.NODE_ENV as Environments | undefined;

const { name, icons } = getParameters(environment);

export const manifest: Manifest.WebExtensionManifest = {
  manifest_version: 3,
  name,
  version: version,
  description: 'Starknet transactions will never be a mistery again',
  icons,
  background: {
    service_worker: 'background.bundle.js',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*', '<all_urls>'],
      js: ['attach.content.bundle.js'],
      css: [],
      all_frames: true,
      run_at: 'document_start',
    },
    {
      matches: ['https://starkscan.co/tx/*', 'https://voyager.online/tx/*'],
      js: ['explorer.content.bundle.js'],
      css: ['assets/css/explorer.css'],
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
    {
      resources: ['explorer.bundle.js'],
      matches: ['<all_urls>'],
    },
  ],
};
