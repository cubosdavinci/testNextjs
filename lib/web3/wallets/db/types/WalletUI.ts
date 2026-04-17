// lib/web3/wallets/db/types/WalletUI.ts

import 'client-only'
import type { NewWalletInputType } from "./NewWalletInput.Schema";

export class WalletUI implements NewWalletInputType {
  readonly user_id!: string;
  readonly wallet_provider!: string;
  readonly wallet_address!: string;
  readonly chain_id!: number;
  readonly token_address!: string;
  readonly token_sym!: string;

  constructor(data: NewWalletInputType) {
    Object.assign(this, data);
    Object.freeze(this);
  }

  toJSON(): NewWalletInputType {
    const {
      user_id,
      wallet_provider,
      wallet_address,
      chain_id,
      token_address,
      token_sym,
    } = this;

    return {
      user_id,
      wallet_provider,
      wallet_address,
      chain_id,
      token_address,
      token_sym,
    };
  }

  toJSONString(): string {
    return JSON.stringify(this.toJSON());
  }
}
