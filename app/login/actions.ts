'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { consoleLog } from '@/lib/utils'


export async function web3LoginWithTurnstile(walletProvider: any, turnstileToken: string) {
  // 1️⃣ Verify Turnstile server-side
  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.CF_TURNSTILE_SECRET!,
      response: turnstileToken,
    }),
  });

  const verification = await verifyRes.json();

  if (!verification.success) {
    throw new Error("Captcha verification failed");
  }

  // 2️⃣ Call Supabase Web3 login
  const supabase = await createClient(); // server client
  const { data, error } = await supabase.auth.signInWithWeb3({
    chain: "ethereum",
    statement: "Sign in to MyApp (web3 secure access)",
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function login(formData: FormData) {
  console.log("Server Action: login (app/login/actions.ts)")

  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    consoleLog("Error", error)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}

export async function signup(formData: FormData) {
  console.log("Server Action: signup (app/login/actions.ts)")

  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}

export async function signInWithGoogle() {
  console.log("Server Action: signInWithGoogle (app/login/actions.ts)")

  const supabase = await createClient();
  const {data, error} = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
    },
  });
  console.log("data: ", data)
  console.log("error: ", error)
if (error) {
    redirect('/error');
  }

  if (data.url) {
    redirect(data.url);
  }
}