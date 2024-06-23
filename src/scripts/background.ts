import { startExtension } from '../helpers/startExtension';
import { InternalMessage, InternalMessageType } from '../types/internal';

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  const message: InternalMessage = request;

  if (message.type === InternalMessageType.TransactionEvent && message.event !== undefined) {
    startExtension(message.event);
  }

  sendResponse({ status: 'ok' });
});
