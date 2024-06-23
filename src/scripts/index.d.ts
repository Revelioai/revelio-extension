// import { ExternalProvider } from '@ethersproject/providers';
type StarknetProvider = any;

declare global {
  interface Window {
    starknet?: StarknetProvider;
  }
}

export {};
