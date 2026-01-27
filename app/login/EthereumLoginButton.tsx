'use client'

import { createClient } from '@/lib/supabase/client'

export default function EthereumLoginButton() {
  const supabase = createClient()

  const signInWithEthereum = async () => {
    if (!window.ethereum) {
      alert('MetaMask not installed')
      return
    }

    // Optional: prompt for access to accounts first (good UX)
    await window.ethereum.request({
      method: 'eth_requestAccounts',
    })

    // Single call: Supabase handles the rest of the Web3 flow
    const { data, error } = await supabase.auth.signInWithWeb3({
      chain: 'ethereum',
      // Optional, but recommended: a user‑friendly statement
      statement: 'Sign in to MyApp',
    })

    if (error) {
      console.error('signInWithWeb3 error:', error)
      return
    }

    // If successful, data.session / data.user are available
    console.log('signed in', data.session, data.user)
  }

  return (
    <button
      type="button"
      onClick={signInWithEthereum}
      className="flex w-full items-center justify-center gap-2 rounded border bg-white py-2 font-semibold hover:bg-gray-50"
    >
      {/* You can swap in a MetaMask icon or any logo you like */}
      <span>Sign in with MetaMask</span>
    </button>
  )
}
