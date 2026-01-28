import { createAnonClient } from "@/lib/supabase/client"
import ConnectUserWallets from "./ConnectUserWallets"
import type { UserWalletDbRow } from "@/lib/wallet/types/UserWalletDbRow"

export default async function WalletsDashboardPage() {
  const supabase = createAnonClient()

  const { data: wallets, error } = await supabase
    .from("web3_user_wallets_v")
    .select("*")
    .eq("is_active", true)

  if (error) {
    throw new Error(error.message)
  }

  return <ConnectUserWallets wallets={(wallets ?? []) as UserWalletDbRow[]} />
}
