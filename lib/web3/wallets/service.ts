import { WalletRepository } from "./db/repository"
import { SUPPORTED_BNETWORKS } from "."
import { detectWallets } from "./providers"
import { verifyWalletOwnership } from  "./connect"


export class WalletService {
  private repo = new WalletRepository()

  async getWallets() {
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
  }) {
    const address = await verifyWalletOwnership(params.provider)

    return this.repo.addWallet({
      wallet_provider: params.wallet_provider,
      wallet_address: address.toLowerCase(),
      chain_id: params.chain_id,
      token_address: params.token_address.toLowerCase()
    })
  }

  getSupportedNetworks() {
    return SUPPORTED_BNETWORKS
  }
}
