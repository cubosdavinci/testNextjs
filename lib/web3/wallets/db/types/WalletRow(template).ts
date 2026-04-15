import { WalletRowSchema, WalletRowType } from "./WalletRow.Schema";

export class WalletRow implements WalletRowType {
  readonly user_id: string;
  readonly wallet_provider: string;
  readonly wallet_address: string;
  readonly chain_id: number;
  readonly token_address: string;
  readonly token_sym: string;

  constructor(data: WalletRowType) {
    // Validate input using Zod Schema
    const validated = WalletRowSchema.parse(data);

    // Assign validated values
    this.user_id = validated.user_id;
    this.wallet_provider = validated.wallet_provider;
    this.wallet_address = validated.wallet_address;
    this.chain_id = validated.chain_id;
    this.token_address = validated.token_address;
    this.token_sym = validated.token_sym;
  }

  static fromValidated(data: WalletRowType): WalletRow {
    // A faster way to create an instance without running Zod again
    const instance = Object.create(WalletRow.prototype);
    return Object.assign(instance, data);
  }


  // The logic is clean, readable, and perfectly modular.
  toJSON(): WalletRowType {
    const { user_id, wallet_provider, wallet_address, chain_id, token_address, token_sym } = this;
    return { user_id, wallet_provider, wallet_address, chain_id, token_address, token_sym };
  }

  toJSONString(): string {
    return JSON.stringify(this.toJSON());
  }

}
