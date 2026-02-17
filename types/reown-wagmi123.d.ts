// reown-wagmi.d.ts
// Augment the WagmiAdapter constructor types to accept Wagmi's flexible storage

import type { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { CreateStorageReturnType, Storage } from 'wagmi';  // or '@wagmi/core'

declare module '@reown/appkit-adapter-wagmi' {
  interface WagmiAdapterOptions {
    storage?: CreateStorageReturnType | Storage | undefined;
    // If the above doesn't match perfectly, you can widen it more:
    // storage?: any;
  }

  // Alternative: directly override the constructor signature if needed
  // interface WagmiAdapter {
  //   new (options: { storage?: CreateStorageReturnType | Storage; ... }): WagmiAdapter;
  // }
}