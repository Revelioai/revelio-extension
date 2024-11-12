import { apiBaseUrl } from '../environments/api';
import { Explanation } from '../types/simulation';

type Explorer = 'voyager' | 'starkscan' | 'scrollscan';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function insertChildAtIndex(parentNode: Node, newNode: Node, index: number): void {
  // If the index is greater than or equal to the number of children, append the new node at the end
  if (index >= parentNode.childNodes.length) {
    parentNode.appendChild(newNode);
  } else {
    // Insert the new node before the existing child at the specified index
    parentNode.insertBefore(newNode, parentNode.childNodes[index]);
  }
}

function createLoadingBox(explorer: Explorer): Node {
  const loadingBox = document.createElement('div');
  loadingBox.classList.add(explorer);
  loadingBox.classList.add('loading-animation');
  return loadingBox;
}

function createRevelioBox(title: string, explanation: string, explorer: Explorer): Node {
  const revelioBox = document.createElement('div');
  revelioBox.id = 'revelio-container';
  revelioBox.classList.add(explorer);

  if (explorer === 'voyager') {
    const isDarkMode = window.getComputedStyle(document.body).backgroundColor === 'rgb(18, 18, 18)';

    if (isDarkMode) revelioBox.classList.add('dark');
  }

  const logo = document.createElement('img');

  logo.src = 'https://i.ibb.co/FYwGpKX/Icon-Showcase.png';

  revelioBox.appendChild(logo);

  const header = document.createElement('h2');
  header.textContent = 'Transaction Explanation';

  revelioBox.appendChild(header);

  const explanationContainer = document.createElement('div');
  explanationContainer.classList.add('explanation');

  const titleNode = document.createElement('h3');
  titleNode.textContent = title;

  explanationContainer.appendChild(titleNode);

  const description = document.createElement('p');
  description.textContent = explanation;

  explanationContainer.appendChild(description);

  revelioBox.appendChild(explanationContainer);

  return revelioBox;
}

function extractTransactionHash(url: string): string {
  // Modified regex to match transaction hashes that may have omitted leading zeros
  const regex = /\/tx\/(0x[a-fA-F0-9]{1,64})/;
  const match = url.match(regex);
  if (match === null) throw new Error(`Couldn't extract the txHash from ${url}`);

  // Normalize the hash to 64 characters by adding leading zeros if necessary
  const txHash = match[1];
  const normalizedTxHash = '0x' + txHash.slice(2, txHash.length).padStart(66 + 2 - txHash.length, '0');

  return normalizedTxHash;
}

async function fetchExplanation(txHash: string) {
  const response = await fetch(`${apiBaseUrl}/explainTransactionByHash`, {
    method: 'POST',
    body: JSON.stringify({
      txHash,
    }),
  }).then((res) => res.json() as Promise<Explanation>);
  return response;
}

async function fetchExplanationByText(transactionText: string) {
  const response = await fetch(`${apiBaseUrl}/explainTransaction`, {
    method: 'POST',
    body: JSON.stringify({
      transactionText,
    }),
  }).then((res) => res.json() as Promise<Explanation>);
  return response;
}

function getExplorer(url: string): Explorer {
  if (url.startsWith('https://voyager.online')) {
    return 'voyager';
  } else if (url.startsWith('https://starkscan.co')) {
    return 'starkscan';
  } else if (url.startsWith('https://scrollscan.com')) {
    return 'scrollscan';
  }
  throw new Error("Couldn't find explorer");
}

const explorerSelector: { [key in Explorer]: string } = {
  starkscan: '#__next > div > main > div > div',
  voyager: 'div#root-child > div > div:nth-child(3) > div > div',
  scrollscan: 'div.card.p-5.mb-3', //TODO
};

function extractVisibleText(doc: Element): string {
  // Helper function to recursively extract visible text from nodes
  function getTextContent(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      // Return text content if it's a text node
      return node.textContent?.trim() || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;

      // Skip hidden elements
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return '';
      }

      // Recursively get text content of child nodes
      return Array.from(node.childNodes).map(getTextContent).join(' ');
    }
    return '';
  }

  // Start from the body of the parsed document
  return getTextContent(doc).replace(/\s+/g, ' ').trim(); // Normalize whitespace
}

async function extractScrollTxDescriptionAsString(): Promise<string> {
  const container = document.querySelector('div.card.p-5.mb-3');
  if (container === null) throw new Error("Couldn't find the right scroll container for Revelio...");
  const c = container.cloneNode(true) as Element;
  // fetch transfers
  const transfers = c.querySelectorAll('div.to-address-col span[data-highlight-target^="0x"]');
  const filteredTransfers = Array.from(transfers).filter((span) => span.textContent!.trim().startsWith('0x'));

  const nameMapping: Record<string, string> = {};
  for (const t of filteredTransfers) {
    const address = t.getAttribute('data-highlight-target')!;
    if (nameMapping[address]) {
      t.textContent = nameMapping[address];
      continue;
    }
    try {
      const res = await fetch(`https://scrollscan.com/token/${address}`);
      console.log(address);
      const text = await res.text();
      const title = text
        .match(/<title>(.*?)<\/title>/is)![1]
        .trim()
        .split('Token Tracker |')[0]
        .trim();
      if (title != '()') {
        nameMapping[address] = title;
        t.textContent = title;
      }
    } catch (e) {
      console.error(e);
    }
  }

  const txDescriptionString = extractVisibleText(c); //c.outerHTML;
  console.log(JSON.stringify(txDescriptionString));
  return txDescriptionString;
}

async function display() {
  const explorer = getExplorer(document.URL);

  let explanationPromise: Promise<Explanation>;

  if (explorer == 'scrollscan') {
    const transactionText = await extractScrollTxDescriptionAsString();
    explanationPromise = fetchExplanationByText(transactionText);
  } else {
    const txHash = extractTransactionHash(document.URL);
    explanationPromise = fetchExplanation(txHash);
  }

  await delay(1000);

  const container = document.querySelector(explorerSelector[explorer]);
  if (container === null) throw new Error("Couldn't find the right container for Revelio...");

  const loadingBox = createLoadingBox(explorer);
  insertChildAtIndex(container, loadingBox, 1);

  const explanation = await explanationPromise;
  console.log(explanation);

  const revelioBox = createRevelioBox(explanation.title, explanation.explanation, explorer);

  container.removeChild(loadingBox);
  insertChildAtIndex(container, revelioBox, 1);
}

console.log('@@ Revelio is Loading');

window.addEventListener('load', async function () {
  console.log('All resources finished loading!');

  // Logic for when the full page is ready
  display();

  // Observe changes in the DOM
  // observeDOMChanges();
});

// function observeDOMChanges() {
//   const targetNode = document.body;
//   const config = { childList: true, subtree: true };

//   const callback = function (mutationsList: MutationRecord[], observer: MutationObserver) {
//     for (let mutation of mutationsList) {
//       if (mutation.type === 'childList') {
//         // Custom logic for dynamically added content
//         console.log('A child node has been added or removed.');

//         display();
//       }
//     }
//   };

//   const observer = new MutationObserver(callback);
//   observer.observe(targetNode, config);
// }
