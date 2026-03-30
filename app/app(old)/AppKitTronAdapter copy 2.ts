'use client'

import type { PublicStateControllerState, EventsControllerState } from '@reown/appkit'
//import type WalletConnectClient from '@tronweb3/walletconnect-tron/types'
//import type { SignClientTypes } from '@walletconnect/types'
import { WalletConnectWallet, WalletConnectChainID } from '@tronweb3/walletconnect-tron'
import TronWebNamespace from 'tronweb'
const TronWeb = (TronWebNamespace as any).default

export interface AppKitTronAccount {
  address: string
  chainNamespace: 'tron'
  chainId: 'mainnet' | 'shasta' | 'nile'
  isConnected: boolean
}

export interface AppKitTronTransaction {
  to: string
  value?: number
  data?: string
  feeLimit?: number
}

export interface AppKitTronAdapterOptions {
  tronWeb?: typeof TronWeb
  tokens?: Record<string, string> // TRC-20 token contracts by symbol
}

/**
 * AppKitTronAdapter mirrors WalletConnectWallet for AppKit but adds TRC-20 support.
 */
export class AppKitTronAdapter {
  name = 'Tron Wallet'
  id = 'tron-wallet'
  icon = '/tron-logo.svg'

  private tronWallet: WalletConnectWallet
  private network: WalletConnectChainID
  private accounts: AppKitTronAccount[] = []
  private tronWeb?: typeof TronWeb
  private tokenContracts: Record<string, string> = {}

  /** Events mapping */
  private eventListeners: Record<string, Function[]> = {}

  constructor(options?: AppKitTronAdapterOptions) {
    const envNetwork = process.env.NEXT_PUBLIC_TRON_NETWORK ?? 'Mainnet'
    const envProjectId = process.env.NEXT_PUBLIC_TRON_PROJECT_ID ?? ''

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

    if (options?.tronWeb) this.tronWeb = options.tronWeb
  }

  /** Lazy TronWeb instance */
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
  async signMessage(message: string): Promise<string> {
    return await this.tronWallet.signMessage(message)
  }

  /** Sign a transaction */
  async signTransaction(tx: AppKitTronTransaction): Promise<any> {
    return await this.tronWallet.signTransaction(tx)
  }

  /** Send native TRX transaction */
  async sendTransaction(tx: AppKitTronTransaction): Promise<string> {
    const signedTx = await this.signTransaction(tx)
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
    const tx = await contract.methods.transfer(to, amount).build()
    const signedTx = await this.signTransaction(tx)
    const txResult = await tronWeb.trx.sendRawTransaction(signedTx)

    if (typeof txResult === 'string') return txResult
    if (txResult && typeof txResult.txid === 'string') return txResult.txid
    throw new Error('Failed to get TRC-20 transaction ID from TronWeb')
  }

  /** Event listeners */
  on(event: string, listener: Function) {
    if (!this.eventListeners[event]) this.eventListeners[event] = []
    this.eventListeners[event].push(listener)
  }

  off(event: string, listener: Function) {
    if (!this.eventListeners[event]) return
    this.eventListeners[event] = this.eventListeners[event].filter(l => l !== listener)
  }

  emit(event: string, ...args: any[]) {
    const listeners = this.eventListeners[event] ?? []
    for (const l of listeners) l(...args)
  }

  /** AppKit modal/event subscriptions */
  subscribeModalState(callback: (state: PublicStateControllerState) => void): () => void {
    // No-op for now; you can hook into WalletConnect modal events if needed
    return () => {}
  }

  subscribeEvents(callback: (event: EventsControllerState) => void): () => void {
    // No-op for now
    return () => {}
  }

  /** Close AppKit modal */
  async closeModal(): Promise<void> {
    return this.tronWallet.closeModal()
  }

  /** Set theme mode */
  setThemeMode(mode: 'light' | 'dark'): void {
    return this.tronWallet.setThemeMode(mode)
  }
}