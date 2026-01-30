import { detectWallets } from "../providers"

export async function discoverProvider(rdns: string) {
  const wallets = await detectWallets()

  const found = wallets.find(
    (w) => w.info.rdns === rdns
  )

  if (!found) {
    throw new Error("Wallet provider not found")
  }

  return found
}
