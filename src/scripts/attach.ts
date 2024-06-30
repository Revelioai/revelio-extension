/* eslint-disable @typescript-eslint/ban-ts-comment */
// import detectEthereumProvider from '@metamask/detect-provider';

import { Abi, Account, AllowArray, Call, InvocationsDetails, RpcProvider } from 'starknet';
import { InternalMessage, InternalMessageType, TriggerType } from '../types/internal';

// import { JsonRpcRequest, JsonRpcCallback, ProviderRequest } from '../../types/jsonrpc';

function triggerExtension(
  triggerType: TriggerType,
  calls: AllowArray<Call>,
  walletAddress: string,
  nonce: string,
  abis?: Abi[]
) {
  const message: InternalMessage = {
    type: InternalMessageType.TransactionEvent,
    event: { triggerType, calls, walletAddress, abis, nonce },
  };

  const event = new CustomEvent('FromPage', { detail: message });

  window.dispatchEvent(event);
}

function wrapAccountExecute(account: Account | undefined) {
  if (!account?.execute) return;

  const originalExecute = account.execute;

  // TODO remove any
  const execute: typeof account.execute = async (calls, abis, transactionsDetail, ...args) => {
    console.log('calls', calls, 'abis', abis, 'transactionsDetail', transactionsDetail, 'args', args);

    const nonce = await account.getNonce();

    triggerExtension('execute', calls, account.address, nonce, abis);

    try {
      return await originalExecute(calls, abis, transactionsDetail);
    } catch (error) {
      console.error('Transaction failed or was canceled', error);
      throw error;
    }
  };

  account.execute = execute;

  console.log('successfully wrapped execute');
}

async function attach() {
  const starknetAccount = (window as any).starknet.account as Account;

  if (starknetAccount) {
    wrapAccountExecute(starknetAccount);
  } else {
    console.log('@ No wallet found');
  }
}

console.log('@@ Extension is Loading');
window.addEventListener('load', attach);
