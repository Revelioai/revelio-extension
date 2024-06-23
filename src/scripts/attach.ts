/* eslint-disable @typescript-eslint/ban-ts-comment */
// import detectEthereumProvider from '@metamask/detect-provider';

import { Abi, Account, AllowArray, Call, InvocationsDetails, RpcProvider } from 'starknet';
import { InternalMessage, InternalMessageType, TriggerType } from '../types/internal';

// import { JsonRpcRequest, JsonRpcCallback, ProviderRequest } from '../../types/jsonrpc';

function triggerExtension(
  triggerType: TriggerType,
  calls: AllowArray<Call>,
  abis?: Abi[],
  transactionsDetail?: InvocationsDetails
) {
  const message: InternalMessage = {
    type: InternalMessageType.TransactionEvent,
    event: { triggerType, calls, abis, transactionsDetail },
  };

  const event = new CustomEvent('FromPage', { detail: message });

  window.dispatchEvent(event);
}

function wrapAccountExecute(account: Account | undefined) {
  if (!account?.execute) return;

  const originalExecute = account.execute;

  // TODO remove any
  const execute: typeof account.execute = async (calls, abis, transactionsDetail) => {
    triggerExtension('execute', calls, abis, transactionsDetail);

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
