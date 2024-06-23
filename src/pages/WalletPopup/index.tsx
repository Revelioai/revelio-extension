import * as React from 'react';
import { createRoot } from 'react-dom/client';

function WalletPopup() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const encodedData = urlSearchParams.get('data') || '';

  let data;

  if (encodedData) {
    const stringData = decodeURIComponent(encodedData);
    data = JSON.parse(stringData);
  }

  // const analyzeResult = useAsync(fetchAnalyze, [chainId, to, url, from, value, data]);

  const triggerType = data.triggerType;
  const calls = data.calls;
  const transactionsDetail = data.transactionsDetail;
  const abis = data.abis;

  return (
    <div>
      <h1>My transaction</h1>
      <p>Description of the transaction</p>
      <br />
      <h3>TRIGGER TYPE</h3>
      <p>{triggerType !== undefined ? JSON.stringify(triggerType, undefined, 4) : 'None'}</p>
      <br />
      <h3>CALLS</h3>
      <p>{calls !== undefined ? JSON.stringify(calls, undefined, 4) : 'None'}</p>
      <br />
      <h3>TRANSACTION DETAIL</h3>
      <p>{transactionsDetail !== undefined ? JSON.stringify(transactionsDetail, undefined, 4) : 'None'}</p>
      <br />
      <h3>ABIs</h3>
      <p>{abis !== undefined ? JSON.stringify(abis, undefined, 4) : 'None'}</p>
    </div>
  );
}

const container = window.document.querySelector('#app-container');

const root = createRoot(container as Element);
root.render(<WalletPopup />);
