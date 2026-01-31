"use client"
// lib/web3/wallets/db/repository.ts
import { createAnonClient } from "@/lib/supabase/client"
import type { UserWalletDbRow } from "./types/UserWalletDbRow"
import { mapUserWalletRow, mapUserWalletRows } from "./mapping"
import { INewWalletInput } from "./types/INewWalletInput"

export class WalletRepository {
  private supabase = createAnonClient()

  async getUserWallets(): Promise<UserWalletDbRow[] | undefined> {
    const { data, error } = await this.supabase
      .from("web3_user_wallets_v")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) throw error
    
    return mapUserWalletRows(data)
  }

  async addWallet(input: INewWalletInput):Promise<UserWalletDbRow | undefined> {

    console.log("New Wallet Input: ", input)
    const {data: inserted, error: insertError} = await this.supabase
        .from("web3_user_wallets")
        .insert(input)
        .select("id")
        .single()
    console.log("Inserted Row", inserted)
    if (insertError) throw insertError

    
  // 2️⃣ fetch full row from the view USING THE ID
    const { data, error } = await this.supabase
        .from("web3_user_wallets_v")
        .select("*")
        .eq("id", inserted.id)   // 🔥 critical
        .single()

    if (error) throw error

    return mapUserWalletRow(data)
  }

  async setDefault(walletId: string) {
    const { error } = await this.supabase
      .from("web3_user_wallets")
      .update({ is_default: true })
      .eq("id", walletId)

    if (error) throw error
  }

  async deactivate(walletId: string) {
    const { error } = await this.supabase
      .from("web3_user_wallets")
      .update({ is_active: false })
      .eq("id", walletId)

    if (error) throw error
  }
}
