import { ethers } from "ethers"
import { WalletError, WalletErrorCode, normalizeProviderError } from "./errors"
import { SUPPORTED_NETWORKS } from "../SupportedNetworks"


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

export async function verifyWalletOwnership(
  provider: any
): Promise<string> {
  const { address } = await connectWallet(provider)

  const nonce = generateNonce()

  const message = buildMessage(nonce)

  let signature: string

  try {
    signature = await provider.request({
      method: "personal_sign",
      params: [message, address]
    })
  } catch {
    throw new WalletError(
      WalletErrorCode.SIGNATURE_REJECTED,
      "User rejected signature request"
    )
  }

  const recovered = ethers.verifyMessage(message, signature)

  if (normalizeAddress(recovered) !== normalizeAddress(address)) {
    throw new WalletError(
      WalletErrorCode.SIGNATURE_INVALID,
      "Signature verification failed"
    )
  }

  return normalizeAddress(address)
}

export function validateNetwork(chainId: number) {
  const supported = SUPPORTED_NETWORKS.find(
    (n) => n.chainId === chainId
  )

  if (!supported) {
    throw new WalletError(
      WalletErrorCode.UNSUPPORTED_NETWORK,
      `Chain ${chainId} is not supported`
    )
  }

  return supported
}

function generateNonce(): string {
  return crypto.randomUUID()
}

function buildMessage(nonce: string) {
  return `
Welcome to MyApp

Sign this message to verify wallet ownership.
This will not trigger a blockchain transaction.

Nonce:
${nonce}
`.trim()
}

export function normalizeAddress(address: string): string {
  return ethers.getAddress(address).toLowerCase()
}

