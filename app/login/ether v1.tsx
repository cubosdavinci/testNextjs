'use client'

import { createClient } from '@/lib/supabase/client'
import { BrowserProvider } from 'ethers'
import { EthereumWeb3Credentials } from '@supabase/supabase-js'

export default function EthereumLoginButton() {
  const supabase = createClient()

  const signInWithEthereum = async () => {
    if (!window.ethereum) {
      alert('MetaMask not installed')
      return
    }

    // 1️⃣ Ask MetaMask for permission to access accounts
    await window.ethereum.request({
      method: 'eth_requestAccounts',
    })



    // 2️⃣ Start Web3 sign-in with Supabase
    const { data, error } = await supabase.auth.signInWithWeb3({
      chain: 'ethereum',
    })

    if (error || !data) {
      console.error('signInWithWeb3 error:', error)
      return
    }

    // 3️⃣ Sign the message Supabase generated
    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    const signature = await signer.signMessage(data.message)

    // 4️⃣ Verify the signature with Supabase
    const { error: verifyError } = await supabase.auth.verifyWeb3({
      chain: 'ethereum',
      message: data.message,
      signature,
    })

    if (verifyError) {
      console.error('verifyWeb3 error:', verifyError)
    }
  }

  return (
    <button type="button" onClick={signInWithEthereum}>
      Sign in with MetaMask
    </button>
  )
}
