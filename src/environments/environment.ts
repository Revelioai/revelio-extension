if (process.env.NODE_ENV === undefined) {
  throw new Error('NODE_ENV is not defined.');
}

const _version =
  typeof chrome !== 'undefined' && chrome.runtime !== undefined
    ? chrome.runtime.getManifest().version
    : process.env.npm_package_version;

export const version = _version;

export const nodeEnv = process.env.NODE_ENV;
