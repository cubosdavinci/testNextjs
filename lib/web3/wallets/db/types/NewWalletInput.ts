import { z } from "zod";
import { NewWalletInputSchema } from "./NewWalletInput.Schema";
import { INewWalletInput } from "./INewWalletInput";


export class NewWalletInput implements INewWalletInput {
  user_id: string;
  wallet_provider: string;
  wallet_address: string;
  chain_id: number;
  token_address: string;
  token_sym: string;

  constructor(
    user_id: string,
    wallet_provider: string,
    wallet_address: string,
    chain_id: number,
    token_address: string,
    token_sym: string
  ) {
    // Validate input using Zod
    const validated = NewWalletInputSchema.parse({
      user_id,
      wallet_provider,
      wallet_address,
      chain_id,
      token_address,
      token_sym
    });

    // Assign validated values
    this.user_id = validated.user_id;
    this.wallet_provider = validated.wallet_provider;
    this.wallet_address = validated.wallet_address;
    this.chain_id = validated.chain_id;
    this.token_address = validated.token_address;
    this.token_sym = validated.token_sym;
  }

  // Example method
  toJSON(): INewWalletInput {
    return {
      user_id: this.user_id,
      wallet_provider: this.wallet_provider,
      wallet_address: this.wallet_address,
      chain_id: this.chain_id,
      token_address: this.token_address,
      token_sym: this.token_sym
    };
  }
}
