// app/testing-create-order/types/eip712Types.ts

export const EscrowOrderEIP712_Types = {
  OrderPayload: [
    { name: 'orderId', type: 'uint128' },
    { name: 'buyer', type: 'address' },
    { name: 'seller', type: 'address' },
    { name: 'paymentToken', type: 'address' },
    { name: 'total', type: 'uint256' },
    { name: 'taxes', type: 'uint256' },
    { name: 'platformFee', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
};


// canonical escrow authorization type
export type EscrowOrderEIP712 = {
  orderId: bigint;          // uint128
  buyer: string;            // address
  seller: string;           // address
  paymentToken: string;     // ERC20 or address(0)
  total: bigint;            // uint256
  taxes: bigint;            // uint256
  platformFee: bigint;      // uint256
  deadline: bigint;         // uint256
};