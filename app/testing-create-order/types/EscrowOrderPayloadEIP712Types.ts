// app/testing-create-order/types/eip712Types.ts

export const EscrowOrderPayloadTypesEIP712 = {
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

export type EscrowOrderPayloadEIP712 = {
  orderId: bigint;
  buyer: string;
  seller: string;
  paymentToken: string;
  total: bigint;
  taxes: bigint;
  platformFee: bigint;
  deadline: bigint;
};

export type EscrowOrderPayload = {
  orderId: string;
  buyer: string;
  seller: string;
  paymentToken: string;
  total: string;
  taxes: string;
  platformFee: string;
  deadline: string;
};
export type EscrowOrderEIP712Serializable = {
  orderId: string;
  buyer: string;
  seller: string;
  paymentToken: string;
  total: string;
  taxes: string;
  platformFee: string;
  deadline: string;
};