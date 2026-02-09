'use server'

import { createAnonClient } from '@/lib/supabase/client'

type SignInPayload = {
  address: string
  message: string
  signature: string
}

export async function signInWeb3(payload: SignInPayload) {
  const supabase = createAnonClient()

  const { address, message, signature } = payload

  supabase.auth.signInWithWeb3
  const { data, error } = await supabase.auth.signInWithWeb3({
    chain: 'ethereum',
    message,
    signature,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
