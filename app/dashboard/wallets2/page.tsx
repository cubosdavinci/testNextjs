import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import UserWallets from "@/components/web3/UserWallets";

export default async function WalletsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
/*
  if (!user) {
    redirect("/login");
  }*/

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payment Methods</h1>
        <p className="text-sm text-gray-500">
          Connect wallets and choose which networks and tokens you want to use
          for payments.
        </p>
      </div>

      <UserWallets />
    </div>
  );
}
