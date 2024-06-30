import { TransactionEvent } from '../types/internal';

const WALLET_NOTIFICATION_WIDTH = 360;

const EXTENSION_WIDTH = 400;
const EXTENSION_HEIGHT = 600;

async function getPosition() {
  const latestWindow = await chrome.windows.getLastFocused();

  if (
    latestWindow.left !== undefined &&
    latestWindow.top !== undefined &&
    latestWindow.width !== undefined &&
    latestWindow.height !== undefined
  ) {
    const top = latestWindow.top;
    const left = latestWindow.left + latestWindow.width - WALLET_NOTIFICATION_WIDTH - EXTENSION_WIDTH;
    return { top, left };
  }

  return { top: 100, left: 100 };
}

export const startExtension = async (event: TransactionEvent) => {
  console.log('event', event);

  const { triggerType, calls, abis, nonce, walletAddress } = event;

  if (triggerType === 'execute') {
    const { top, left } = await getPosition();

    const data = JSON.stringify({ triggerType, calls, nonce, abis, walletAddress } satisfies TransactionEvent);
    const encodedData = encodeURIComponent(data);

    const popupUrl = `walletpopup.html?data=${encodedData}`;

    await chrome.windows.getCurrent();

    await chrome.windows.create({
      url: popupUrl,
      type: 'popup',
      top,
      left,
      width: EXTENSION_WIDTH,
      height: EXTENSION_HEIGHT,
      focused: true, // Wallets code usually position themselves according to latest focused window
    });
  }
};
