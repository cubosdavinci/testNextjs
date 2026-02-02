import { SUPPORTED_BNETWORKS } from ".."
import { WalletError, WalletErrorCode } from "wallet/errors"

export function findNetwork(chainId: number) {
  const net = SUPPORTED_BNETWORKS.find(
    n => parseInt(n.options.chainId, 16) === chainId
  )

  if (!net) {
    throw new WalletError(
      WalletErrorCode.UNSUPPORTED_BNETWORK,
      `Chain ${chainId} not supported`
    )
  }

  return net
}
