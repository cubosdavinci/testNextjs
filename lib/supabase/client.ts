import { createBrowserClient, } from "@supabase/ssr";
import { Web3Credentials } from "@supabase/supabase-js";

export function createAnonClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
