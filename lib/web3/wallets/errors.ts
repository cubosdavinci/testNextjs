export enum WalletErrorCode {
  PROVIDER_NOT_FOUND = "PROVIDER_NOT_FOUND",
  CONNECTION_REJECTED = "CONNECTION_REJECTED",
  SIGNATURE_REJECTED = "SIGNATURE_REJECTED",
  SIGNATURE_INVALID = "SIGNATURE_INVALID",
  UNSUPPORTED_NETWORK = "UNSUPPORTED_NETWORK",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
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
