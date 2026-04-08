import { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SECRET!;


export async function supabaseAdmin() {
  return createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey
  );
}
