'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { consoleLog } from '@/lib/utils'

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