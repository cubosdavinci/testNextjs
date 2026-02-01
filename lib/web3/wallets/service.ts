"use client"
import { WalletRepository } from "./db/repository"
import { SUPPORTED_BNETWORKS } from "."
import { detectWallets } from "./providers"
import { verifyWalletOwnership } from  "./connect"
import { NewWalletInput } from "./db/types/NewWalletInput"


export class WalletService {
  private repo = new WalletRepository()

  async getPersistedWallets() {
    return this.repo.getUserWallets()
  }

  async discoverProviders() {
    return detectWallets()
  }

  async connectAndSaveWallet(params: {
    provider: any
    wallet_provider: string
    chain_id: number
    token_address: string
    token_sym: string
  }) {
    const address = await verifyWalletOwnership(params.provider)

    const newWallet = new NewWalletInput(
      "",
      params.wallet_provider,
      address.toLocaleLowerCase(),
      params.chain_id, 
      params.token_address,
      params.token_sym,
    )
    return this.repo.addWallet(newWallet.toJSON())
  }

  getSupportedNetworks() {
    return SUPPORTED_BNETWORKS
  }
}
