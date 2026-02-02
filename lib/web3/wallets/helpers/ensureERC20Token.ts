export async function ensureERC20Token(
  provider: any,
  token: {
    address: string
    symbol: string
    decimals: number
    icon?: string
  }
) {
  try {
    await provider.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: token.icon
        }
      }
    })
  } catch {
    // user rejected → non-fatal
  }
}
