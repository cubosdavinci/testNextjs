// EIP-712 Domain
export const domain = {
  name: process.env.AMOY_ESCROW_CONTRACT_NAME!,
  version: process.env.AMOY_ESCROW_CONTRACT_VERSION!,
  chainId: process.env.AMOY_ESCROW_CONTRACT_CHAIN_ID!,
  verifyingContract: process.env.AMOY_SCROW_CONTRACT_ADDRESS!,
};