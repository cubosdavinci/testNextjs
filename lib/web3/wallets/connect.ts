// lib/web3/wallets/connect.ts
import { ethers } from "ethers"
import { WalletError, WalletErrorCode, normalizeProviderError } from "wallet/errors"
import { ensureNetwork } from "./helpers/ensureNetwork"
import { ensureERC20Token } from "./helpers/ensureERC20Token"
import { findNetwork } from "./helpers/findNetwork"
import type { Eip1193Provider } from "./providers"
import { SUPPORTED_BNETWORKS } from "./types/SupportedBNetworks"


/**
 * Connects wallet and returns verified address
 */
export async function connectWallet(
  provider: any
): Promise<{
  address: string
  chainId: number
}> {
  
  if (!provider) {
    throw new WalletError(
      WalletErrorCode.PROVIDER_NOT_FOUND,
      "No wallet provider detected"
    )
  }

  try {
    // Request account access
    const accounts: string[] = await provider.request({
      method: "eth_requestAccounts"
    })

    if (!accounts?.length) {
      throw new WalletError(
        WalletErrorCode.CONNECTION_REJECTED,
        "No wallet accounts returned"
      )
    }

    const chainIdHex = await provider.request({
      method: "eth_chainId"
    })

    const chainId = parseInt(chainIdHex, 16)

    return {
      address: normalizeAddress(accounts[0]),
      chainId
    }
  } catch (err: any) {
    throw normalizeProviderError(err)
  }
}


export function validateNetwork(chainId: number) {
  const supported = SUPPORTED_BNETWORKS.find(
    (n) => n.chainId === chainId
  )

  if (!supported) {
    throw new WalletError(
      WalletErrorCode.UNSUPPORTED_BNETWORK,
      `Chain ${chainId} is not supported`
    )
  }

  return supported
}
/**
 * Full wallet onboarding flow using a discovered provider
 */
export async function onboardWallet(params: {
  provider: Eip1193Provider
  expectedChainId: number
  token: {
    address: string
    symbol: string
    decimals: number
    icon?: string
  }
}) {
  const { provider, expectedChainId, token } = params

  if (!provider) {
    throw new WalletError(
      WalletErrorCode.PROVIDER_NOT_FOUND,
      "No wallet provider detected"
    )
  }

  try {
    // 1️⃣ Connect wallet
    const accounts: string[] = (await provider.request({
      method: "eth_requestAccounts"
    })) as string[]

    if (!accounts?.length) {
      throw new WalletError(
        WalletErrorCode.CONNECTION_REJECTED,
        "No wallet accounts returned"
      )
    }

    const address = normalizeAddress(accounts[0])

    // 2️⃣ Verify ownership via signature
    const nonce = crypto.randomUUID()
    const message = buildMessage(nonce)

    const signature = (await provider.request({
      method: "personal_sign",
      params: [message, address]
    })) as string

    const recovered = ethers.verifyMessage(message, signature)
    if (normalizeAddress(recovered) !== address) {
      throw new WalletError(
        WalletErrorCode.SIGNATURE_INVALID,
        "Signature verification failed"
      )
    }

    // 3️⃣ Network validation
    const network = findNetwork(expectedChainId)

    // 4️⃣ Switch or add network if needed
    await ensureNetwork(provider, network.options)

    // 5️⃣ Add ERC20 token if needed
    await ensureERC20Token(provider, token)

    return {
      address,
      chainId: expectedChainId,
      network
    }
  } catch (err) {
    throw normalizeProviderError(err)
  }
}

function buildMessage(nonce: string) {
  return `
Welcome to MyApp

Sign this message to verify wallet ownership.
No blockchain transaction will occur.

Nonce:
${nonce}
`.trim()
}

export function normalizeAddress(address: string): string {
  return ethers.getAddress(address).toLowerCase()
}
