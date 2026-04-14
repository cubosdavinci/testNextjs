// lib/supabase/clients/supabaseServer.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase'; // your generated types

export async function supabaseServer() {
  const cookieStore = await cookies(); // Next.js 15+ makes this async

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // ← Use anon key, NOT service role
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called in a Server Component or during SSR
            // where cookies cannot be set. Ignore the error in that case.
          }
        },
      },
    }
  );
}