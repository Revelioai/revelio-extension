import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Explanation } from '../../types/simulation';
import { TransactionEvent } from '../../types/internal';
import { apiBaseUrl } from '../../environments/api';
import magic from '../../assets/img/magic.png';
import logoWide from '../../assets/img/logos/revelio-wide.png';
import '../../assets/css/walletpopup.css';

function WalletPopup() {
  const [explanation, setExplanation] = React.useState<Explanation>();

  const urlSearchParams = new URLSearchParams(window.location.search);
  const encodedData = urlSearchParams.get('data') || '';

  if (!encodedData) throw new Error('No encodedData detected');

  const stringData = decodeURIComponent(encodedData);
  const data = JSON.parse(stringData) as TransactionEvent;

  // const analyzeResult = useAsync(fetchAnalyze, [chainId, to, url, from, value, data]);

  const triggerType = data.triggerType;
  const calls = data.calls;
  const nonce = data.nonce;
  const abis = data.abis;
  const walletAddress = data.walletAddress;

  async function fetchExplanation() {
    const _body = {
      triggerType,
      calls,
      nonce,
      walletAddress,
    };

    console.log('_body');
    console.dir(_body, { depth: null });

    const expl = await fetch(`${apiBaseUrl}/explainTransaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(_body),
    }).then((res) => res.json() as Promise<Explanation>);

    setExplanation(() => expl);
  }

  React.useEffect(() => {
    fetchExplanation();
  }, []);

  return (
    <main>
      {explanation === undefined ? (
        <div className='loader'></div>
      ) : (
        <>
          <div id='images-section'>
            {explanation.images.map((_img) => (
              <img src={_img} width='48px' />
            ))}
          </div>
          <div id='action-section'>
            <div className='subtitle'>
              <span>ACTION</span>
            </div>
            <h1>{explanation.title}</h1>
            <h3>{explanation.purpose}</h3>
          </div>

          <div id='explanation-section'>
            <div id='explanation-title' className='subtitle with-icon'>
              <span>EXPLANATION</span>
              <img src={magic} width='24px' />
            </div>

            <div id='explanation-container'>
              <p>{explanation.explanation}</p>
              <p className='micro'>Powered by RevelioAI and GPT</p>
            </div>
          </div>
          <div id='footer'>
            <img src={logoWide} />
          </div>
        </>
      )}
    </main>
  );
}

const container = window.document.querySelector('#app-container');

const root = createRoot(container as Element);
root.render(<WalletPopup />);
