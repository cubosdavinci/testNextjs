import { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";

type DBSchema = "public" | "gotit";

// overloads
export function supabaseAdmin(): ReturnType<typeof createClient<Database, "public">>;
export function supabaseAdmin(schema: "public"): ReturnType<typeof createClient<Database, "public">>;
export function supabaseAdmin(schema: "gotit"): ReturnType<typeof createClient<Database, "gotit">>;

// implementation
export function supabaseAdmin(schema: DBSchema = "public") {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET!,
    {
      db: {
        schema,
      },
    }
  );
}