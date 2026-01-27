'use client'

import { createClient } from '@/lib/supabase/client'

export default function EthereumLoginButton() {
  const supabase = createClient()

  const signInWithEthereum = async () => {
    if (!window.ethereum) {
      alert('MetaMask not installed')
      return
    }

    // 1) Optionally ask MetaMask to enable accounts first
    //    This can improve UX by triggering the wallet prompt early.
    //    Supabase may also request accounts internally when needed.
    await window.ethereum.request({
      method: 'eth_requestAccounts',
    })

    // 2) Single call to Supabase Web3 sign-in
    const { data, error } = await supabase.auth.signInWithWeb3({
      chain: 'ethereum',
      // Optional: a human-readable statement to include in the SIWE message.
      // Helps users understand what they're signing.
      statement: 'Sign in to MyApp',
    })

    if (error) {
      console.error('signInWithWeb3 error:', error)
      return
    }

    // At this point, if successful, Supabase has created a session for the user.
    // You can use data.session / data.user as needed.
    console.log('Signed in!', data.session, data.user)
  }

  return (
    <button type="button" onClick={signInWithEthereum}>
      Sign in with MetaMask
    </button>
  )
}
