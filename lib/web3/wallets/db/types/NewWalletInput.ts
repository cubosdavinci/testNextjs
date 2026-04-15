import { NewWalletInputSchema, NewWalletInputType } from "./NewWalletInput.Schema";

export class NewWalletInput implements NewWalletInputType {
  readonly user_id!: string;
  readonly wallet_provider!: string;
  readonly wallet_address!: string;
  readonly chain_id!: number;
  readonly token_address!: string;
  readonly token_sym!: string;

  constructor(data: NewWalletInputType) {
    // Validate input using Zod Schema
    const validated = NewWalletInputSchema.parse(data);

    // Assign validated values
    Object.assign(this, validated);
  }

  static fromValidated(data: NewWalletInputType): NewWalletInput {
    // A faster way to create an instance without running Zod again
    const instance = Object.create(NewWalletInput.prototype);
    return Object.assign(instance, data);
  }


  // The logic is clean, readable, and perfectly modular.
  toJSON(): NewWalletInputType {
    const { user_id, wallet_provider, wallet_address, chain_id, token_address, token_sym } = this;
    return { user_id, wallet_provider, wallet_address, chain_id, token_address, token_sym };
  }

  toJSONString(): string {
    return JSON.stringify(this.toJSON());
  }

}
