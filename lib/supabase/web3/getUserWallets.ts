import { createClient } from "@/lib/supabase/client";

export type UserPaymentMethod = {
  id: string;
  wallet_provider: string;
  chain_id: number;
  token_address: string;
  wallet_address: string;
  is_default: boolean;
  is_active: boolean;
};

export async function getUserWallets() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("web3_user_payment_methods")
    .select(
      "id, wallet_provider, chain_id, token_address, wallet_address, is_default, is_active"
    )
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  return data as UserPaymentMethod[];
}
