// Solidity unsigned integer max values
// Safe for TS targets < ES2020 (no BigInt literals used)

export const UINT8_MAX   = (BigInt(1) << BigInt(8))   - BigInt(1)
export const UINT16_MAX  = (BigInt(1) << BigInt(16))  - BigInt(1)
export const UINT32_MAX  = (BigInt(1) << BigInt(32))  - BigInt(1)
export const UINT64_MAX  = (BigInt(1) << BigInt(64))  - BigInt(1)
export const UINT128_MAX = (BigInt(1) << BigInt(128)) - BigInt(1)
export const UINT256_MAX = (BigInt(1) << BigInt(256)) - BigInt(1)

// Optional helper map for dynamic use
export const UINT_MAX = {
  8: UINT8_MAX,
  16: UINT16_MAX,
  32: UINT32_MAX,
  64: UINT64_MAX,
  128: UINT128_MAX,
  256: UINT256_MAX,
} as const

export const fitsUint = (value: bigint, bits: keyof typeof UINT_MAX) =>
  value >= BigInt(0) && value <= UINT_MAX[bits]
