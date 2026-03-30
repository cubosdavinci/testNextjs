// app/WalletConnectTronAdapter.ts
'use client'

import {
  WalletConnectWallet,
  WalletConnectChainID,
} from '@tronweb3/walletconnect-tron'
import TronWebNamespace from 'tronweb'

const TronWeb = (TronWebNamespace as any).default

// -------------------- Types --------------------

export interface TronAccount {
  address: string
  chain: 'tron'
  network: 'mainnet' | 'shasta' | 'nile'
}

export interface TronTransaction {
  to: string
  value?: number // SUN
  data?: string
  feeLimit?: number
}

export interface WalletConnectTronAdapterOptions {
  tokens?: Record<string, string>
}

// -------------------- Adapter --------------------

export class WalletConnectTronAdapter {
  readonly name = 'Tron Wallet'
  readonly id = 'walletconnect-tron'
  readonly icon = '/tron-logo.svg'

  private wallet: WalletConnectWallet
  private network: WalletConnectChainID
  private accounts: TronAccount[] = []
  private tokenContracts: Record<string, string>
  private tronWeb?: typeof TronWeb

  constructor(options?: WalletConnectTronAdapterOptions) {
    const envNetwork = process.env.NEXT_PUBLIC_TRON_NETWORK ?? 'Mainnet'
    const projectId = process.env.NEXT_PUBLIC_PROJECT_ID ?? ''

    this.network =
      envNetwork === 'Mainnet'
        ? WalletConnectChainID.Mainnet
        : envNetwork === 'Shasta'
        ? WalletConnectChainID.Shasta
        : WalletConnectChainID.Nile

    this.tokenContracts = options?.tokens ?? {}

    // ✅ SSR-safe static metadata
    this.wallet = new WalletConnectWallet({
      network: this.network,
      options: {
        projectId,
        metadata: {
          name: 'My App',
          description: 'Connect with Tron Wallet',
          url: 'https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev',
          icons: ['https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev/favicon.png'],
        },
      },
    })
  }

  // -------------------- Internals --------------------

  private getNetworkName(): TronAccount['network'] {
    switch (this.network) {
      case WalletConnectChainID.Mainnet:
        return 'mainnet'
      case WalletConnectChainID.Shasta:
        return 'shasta'
      default:
        return 'nile'
    }
  }

  private getTronWeb(): typeof TronWeb {
    if (!this.tronWeb) {
      const fullHost =
        this.network === WalletConnectChainID.Mainnet
          ? 'https://api.trongrid.io'
          : this.network === WalletConnectChainID.Shasta
          ? 'https://api.shasta.trongrid.io'
          : 'https://api.nileex.io'

      this.tronWeb = new TronWeb({ fullHost })
    }
    return this.tronWeb
  }

  // -------------------- Public API --------------------

  async connect(): Promise<TronAccount[]> {
    const address  = (await this.wallet.connect()).address

    const account: TronAccount = {
      address,
      chain: 'tron',
      network: this.getNetworkName(),
    }

    this.accounts = [account]
    return this.accounts
  }

  async disconnect(): Promise<void> {
    await this.wallet.disconnect()
    this.accounts = []
  }

  getAccounts(): TronAccount[] {
    return this.accounts
  }

  async signMessage(message: string): Promise<string> {
    return this.wallet.signMessage(message)
  }

  async signTransaction(tx: TronTransaction): Promise<any> {
    return this.wallet.signTransaction(tx)
  }

  async sendTransaction(tx: TronTransaction): Promise<string> {
    const signed = await this.signTransaction(tx)
    const tronWeb = this.getTronWeb()
    const result = await tronWeb.trx.sendRawTransaction(signed)

    if (typeof result === 'string') return result
    if (result?.txid) return result.txid

    throw new Error('Failed to broadcast TRX transaction')
  }

  async sendTRC20(
    token: string,
    to: string,
    amount: number
  ): Promise<string> {
    const contractAddress = this.tokenContracts[token]
    if (!contractAddress) {
      throw new Error(`Token ${token} not registered`)
    }

    const tronWeb = this.getTronWeb()
    const contract = await tronWeb.contract().at(contractAddress)

    const tx = await contract.methods.transfer(to, amount).send()

    if (typeof tx === 'string') return tx
    if (tx?.txid) return tx.txid

    throw new Error('Failed to send TRC-20 transaction')
  }
}