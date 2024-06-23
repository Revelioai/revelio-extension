import { Abi, AllowArray, Call, InvocationsDetails } from 'starknet';

export type TriggerType = 'execute';

export type TransactionEvent = {
  // TODO create event
  triggerType: TriggerType;
  calls: AllowArray<Call>;
  abis?: Abi[];
  transactionsDetail?: InvocationsDetails;
};

export enum InternalMessageType {
  TransactionEvent,
}

export type InternalMessage = {
  type: InternalMessageType.TransactionEvent;
  event?: TransactionEvent;
};
