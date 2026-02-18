import { createBrowserClient, } from "@supabase/ssr";
import { type Web3Credentials } from "@supabase/supabase-js";

export function createAnonClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export type { Web3Credentials };
