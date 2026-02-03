"use client"
// lib/web3/wallets/db/repository.ts
import { createAnonClient } from "@/lib/supabase/client"
import type { UserWalletDbRow } from "./types/UserWalletDbRow"
import { mapUserWalletRow, mapUserWalletRows } from "./mapping"
import { INewWalletInput } from "./types/INewWalletInput"
import { getWalletErrorMessage } from "../errors"

export class WalletRepository {
  private supabase = createAnonClient()

     // Method inside the class
  async getSignedInUser(): Promise<string> {
    // Get the current user
    const { data: { user }, error } = await this.supabase.auth.getUser();

    if (error) {
      // rethrow any error
      throw error;
    }

    // If no user is signed in, return '(empty)'
    if (!user || !user.id) {
      return '(empty)';
    }

    return user.id; // return the logged-in user's UUID
  }


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
        .select()
        .single()

    console.log("Inserted Row", inserted)
    if (insertError) {
      const message = getWalletErrorMessage("ADD_WALLET", insertError.code) ?? `The wallet couldn''t be added.`; 
      console.log(message)
      throw new Error(message)
    }

    
  // 2️⃣ fetch full row from the view USING THE ID
    const { data, error } = await this.supabase
        .from("web3_user_wallets_v")
        .select()
        .eq("id", inserted.id)
        .eq("user_id", inserted.user_id)   // 🔥 critical

    if (error) throw error

    console.log("Returned View", data)

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
