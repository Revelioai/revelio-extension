/*
    This is a content script
    * Content script is accessible to `chorme.runtime` for example.
    * Injected Script runs in the 'page' level and not in the 'content script' level
        * Page can't access the chrome.runtime or other extension API
*/

// Attach on Page scope
async function injectScript(url: string) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(url);
  script.async = false;
  script.type = 'module';

  const node = document.head || document.documentElement;
  node.prepend(script);
}

console.log('injecting explorer');

/* Inject explorer script */
injectScript('explorer.bundle.js');
