"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAnonClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createAnonClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading dashboard…</p>
      </div>
    );
  }

return (
  <main className="p-8">
    <h1 className="text-2xl font-bold">Dashboard</h1>

    <p className="mt-4 text-muted-foreground">
      Welcome back, {user?.email}
    </p>

    <details className="mt-6 rounded border border-border bg-muted">
  <summary className="cursor-pointer select-none px-4 py-2 font-medium">
    Raw User JSON
  </summary>

  <pre className="overflow-auto px-4 pb-4 pt-2 text-sm">
    {JSON.stringify(user, null, 2)}
  </pre>
</details>
    <table className="mt-6 w-full border border-border text-sm">
  <thead>
    <tr className="bg-muted">
      <th className="border px-3 py-2 text-left">Field</th>
      <th className="border px-3 py-2 text-left">Value</th>
    </tr>
  </thead>
  <tbody>
    <tr><td className="border px-3 py-2">id</td><td className="border px-3 py-2">{user?.id}</td></tr>
    <tr><td className="border px-3 py-2">aud</td><td className="border px-3 py-2">{user?.aud}</td></tr>
    <tr><td className="border px-3 py-2">role</td><td className="border px-3 py-2">{user?.role}</td></tr>
    <tr><td className="border px-3 py-2">email</td><td className="border px-3 py-2">{user?.email || "—"}</td></tr>
    <tr><td className="border px-3 py-2">phone</td><td className="border px-3 py-2">{user?.phone || "—"}</td></tr>
    <tr><td className="border px-3 py-2">last_sign_in_at</td><td className="border px-3 py-2">{user?.last_sign_in_at}</td></tr>

    <tr className="bg-muted/50">
      <td className="border px-3 py-2 font-semibold" colSpan={2}>App Metadata</td>
    </tr>
    <tr><td className="border px-3 py-2">app_metadata.provider</td><td className="border px-3 py-2">{user?.app_metadata?.provider}</td></tr>
    <tr><td className="border px-3 py-2">app_metadata.providers</td><td className="border px-3 py-2">{user?.app_metadata?.providers?.join(", ")}</td></tr>

    <tr className="bg-muted/50">
      <td className="border px-3 py-2 font-semibold" colSpan={2}>Web3 Claims</td>
    </tr>
    <tr><td className="border px-3 py-2">address</td><td className="border px-3 py-2">{user?.user_metadata?.custom_claims?.address}</td></tr>
    <tr><td className="border px-3 py-2">chain</td><td className="border px-3 py-2">{user?.user_metadata?.custom_claims?.chain}</td></tr>
    <tr><td className="border px-3 py-2">network</td><td className="border px-3 py-2">{user?.user_metadata?.custom_claims?.network}</td></tr>
    <tr><td className="border px-3 py-2">domain</td><td className="border px-3 py-2">{user?.user_metadata?.custom_claims?.domain}</td></tr>

    <tr className="bg-muted/50">
      <td className="border px-3 py-2 font-semibold" colSpan={2}>System</td>
    </tr>
    <tr><td className="border px-3 py-2">created_at</td><td className="border px-3 py-2">{user?.created_at}</td></tr>
    <tr><td className="border px-3 py-2">updated_at</td><td className="border px-3 py-2">{user?.updated_at}</td></tr>
    <tr><td className="border px-3 py-2">is_anonymous</td><td className="border px-3 py-2">{String(user?.is_anonymous)}</td></tr>
  </tbody>
</table>
  </main>
);
}
