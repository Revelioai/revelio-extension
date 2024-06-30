import { Abi, AllowArray, Call, InvocationsDetails } from 'starknet';

export type TriggerType = 'execute';

export type TransactionEvent = {
  walletAddress: string;
  triggerType: TriggerType;
  calls: AllowArray<Call>;
  nonce: string;
  abis?: Abi[];
};

export enum InternalMessageType {
  TransactionEvent,
}

export type InternalMessage = {
  type: InternalMessageType.TransactionEvent;
  event?: TransactionEvent;
};
