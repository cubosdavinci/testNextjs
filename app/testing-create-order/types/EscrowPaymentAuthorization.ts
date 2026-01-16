// canonical escrow authorization type
export type EscrowPaymentAuthorization = {
  orderId: bigint;          // uint128
  buyer: string;            // address
  seller: string;           // address
  paymentToken: string;     // ERC20 or address(0)
  total: bigint;            // uint256
  taxes: bigint;            // uint256
  platformFee: bigint;      // uint256
  chainId: bigint;          // uint256
  escrowContract: string;   // address
  deadline: bigint;         // uint256
};