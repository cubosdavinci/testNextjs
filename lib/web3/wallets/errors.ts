export enum WalletErrorCode {
  PROVIDER_NOT_FOUND = "Provider not found",
  CONNECTION_REJECTED = "Connection rejected",
  SIGNATURE_REJECTED = "Signature rejected",
  SIGNATURE_INVALID = "Signature Invalid",
  UNSUPPORTED_BNETWORK = "Unsupported Blockchain Network",
  UNKNOWN_ERROR = "Unknow Error",
}

export class WalletError extends Error {
  code: WalletErrorCode

  constructor(code: WalletErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = "WalletError"
  }
}

/**
 * Normalize wallet provider errors into WalletError
 */
export function normalizeProviderError(
  err: unknown
): WalletError {
  // If already a WalletError
  if (err instanceof WalletError) return err

  // If it's an Error instance
  if (err instanceof Error) {
    return new WalletError(
      WalletErrorCode.UNKNOWN_ERROR,
      err.message
    )
  }

  // If it's a string
  if (typeof err === "string") {
    return new WalletError(
      WalletErrorCode.UNKNOWN_ERROR,
      err
    )
  }

  // fallback
  return new WalletError(
    WalletErrorCode.UNKNOWN_ERROR,
    "Unknown wallet provider error"
  )
}

export const WalletErrorRegistry = {
  // ADD WALLET FLOW
  ADD_WALLET_42501: "Wallet wasn't inserted (invalid wallet data)",
  ADD_WALLET_23505: "You already registered this wallet",

  // SIGN IN FLOW
  SIGN_IN_401: "Signature verification failed",

  // Fallback
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
} as const

export function getWalletErrorMessage(
  flow: string,
  rawCode?: string | number
): string {
  if (!rawCode) return WalletErrorRegistry.UNKNOWN_ERROR

  const key = `${flow}_${rawCode}` as keyof typeof WalletErrorRegistry

  return (
    WalletErrorRegistry[key] ??
    WalletErrorRegistry.UNKNOWN_ERROR
  )
}
