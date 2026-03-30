'use client'

import { WalletConnectWallet, WalletConnectChainID } from '@tronweb3/walletconnect-tron'

/** Minimal interface for TronWeb instance */
interface MinimalTronWeb {
  trx: {
    sendRawTransaction(tx: any): Promise<{ txid?: string }>
  }
  contract(): {
    at(address: string): Promise<any>
  }
}

/** Connected account info */
export interface AppKitTronAccount {
  address: string
  chainNamespace: 'tron'
  chainId: 'mainnet' | 'shasta' | 'nile'
  isConnected: boolean
}

/** TRX transaction */
export interface AppKitTronTransaction {
  to: string
  value?: number // in SUN (1 TRX = 1_000_000 SUN)
  data?: string
  feeLimit?: number
}

/** Adapter options */
export interface AppKitTronAdapterOptions {
  tronWeb?: MinimalTronWeb
  tokens?: Record<string, string> // TRC-20 token contracts by symbol
}

/**
 * AppKitTronAdapter — wraps WalletConnectWallet for AppKit integration
 * Loads config from .env:
 *   NEXT_PUBLIC_TRON_PROJECT_ID
 *   NEXT_PUBLIC_TRON_NETWORK ("Mainnet" | "Shasta" | "Nile")
 */
export class AppKitTronAdapter {
  name = 'Tron Wallet'
  id = 'tron-wallet'
  icon = '/tron-logo.svg'

  private tronWallet: WalletConnectWallet
  private network: WalletConnectChainID
  private accounts: AppKitTronAccount[] = []
  private tronWeb?: MinimalTronWeb
  private tokenContracts: Record<string, string> = {}

  constructor(options?: AppKitTronAdapterOptions) {
    const envNetwork = process.env.NEXT_PUBLIC_TRON_NETWORK ?? 'Mainnet'
    const envProjectId = process.env.NEXT_PUBLIC_TRON_PROJECT_ID ?? ''

    // Map string to WalletConnectChainID
    this.network =
      envNetwork === 'Mainnet'
        ? WalletConnectChainID.Mainnet
        : envNetwork === 'Shasta'
        ? WalletConnectChainID.Shasta
        : WalletConnectChainID.Nile

    this.tokenContracts = options?.tokens ?? {}

    this.tronWallet = new WalletConnectWallet({
      network: this.network,
      options: {
        projectId: envProjectId,
        metadata: {
          name: 'Your App',
          description: 'Connect with Tron Wallet',
          url: 'https://your-app-url.com',
          icons: ['https://your-app-url.com/icon.png'],
        },
      },
    })

    if (options?.tronWeb) {
      this.tronWeb = options.tronWeb
    }
  }

  /** Lazy TronWeb instance */
private getTronWeb(): MinimalTronWeb {
  if (!this.tronWeb) {
    // Import TronWeb at runtime
    // @ts-ignore
    const TronWebNamespace = require('tronweb')
    // @ts-ignore
    const TronWebClass = TronWebNamespace.default ?? TronWebNamespace

    const fullHost =
      this.network === WalletConnectChainID.Mainnet
        ? 'https://api.trongrid.io'
        : this.network === WalletConnectChainID.Shasta
        ? 'https://api.shasta.trongrid.io'
        : 'https://api.nileex.io'

    // @ts-ignore
    this.tronWeb = new TronWebClass({ fullHost }) as MinimalTronWeb
  }

  return this.tronWeb! // <-- assert non-null
}

  /** Connect wallet */
  async connect(): Promise<AppKitTronAccount[]> {
    const result = await this.tronWallet.connect()
    const account: AppKitTronAccount = {
      address: result.address,
      chainNamespace: 'tron',
      chainId:
        this.network === WalletConnectChainID.Mainnet
          ? 'mainnet'
          : this.network === WalletConnectChainID.Shasta
          ? 'shasta'
          : 'nile',
      isConnected: true,
    }
    this.accounts = [account]
    return this.accounts
  }

  /** Disconnect wallet */
  async disconnect(): Promise<void> {
    await this.tronWallet.disconnect()
    this.accounts = []
  }

  /** Get connected accounts */
  async getAccounts(): Promise<AppKitTronAccount[]> {
    return this.accounts
  }

  /** Sign a message */
  async tron_signMessage(message: string): Promise<string> {
    return await this.tronWallet.signMessage(message)
  }

  /** Sign a transaction */
  async tron_signTransaction(tx: AppKitTronTransaction): Promise<string> {
    return await this.tronWallet.signTransaction(tx)
  }

  /** Send native TRX transaction */
async sendTransaction(tx: AppKitTronTransaction): Promise<string> {
  const signedTx = await this.tron_signTransaction(tx)
  const tronWeb = this.getTronWeb()
  const txResult = await tronWeb.trx.sendRawTransaction(signedTx)

  if (typeof txResult === 'string') return txResult
  if (txResult && typeof txResult.txid === 'string') return txResult.txid

  throw new Error('Failed to get transaction ID from TronWeb')
}

/** Send TRC-20 token transaction */
async sendTRC20Transaction(token: string, to: string, amount: number): Promise<string> {
  const contractAddress = this.tokenContracts[token]
  if (!contractAddress) throw new Error(`Token ${token} is not registered in this adapter`)

  const tronWeb = this.getTronWeb()
  const contract = await tronWeb.contract().at(contractAddress)

  // Build TRC-20 transfer
  const tx = await contract.methods.transfer(to, amount).build()
  const signedTx = await this.tron_signTransaction(tx)
  const txResult = await tronWeb.trx.sendRawTransaction(signedTx)

  if (typeof txResult === 'string') return txResult
  if (txResult && typeof txResult.txid === 'string') return txResult.txid

  throw new Error('Failed to get TRC-20 transaction ID from TronWeb')
}
}