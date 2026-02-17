'use client'

import { useState, useCallback } from 'react'
import { useAppKit } from '@reown/appkit/react'
import { arbitrumSepolia } from '@reown/appkit/networks'
import { useWalletClient } from 'wagmi'
import { createAnonClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Login() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const supabase = createAnonClient()
  const router = useRouter()

  useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 1️⃣ Connect wallet if needed
      if (!isConnected) {
        await open()
        return
      }

      // 2️⃣ Wait until walletClient & address are ready
      if (!walletClient || !address) throw new Error('Wallet not ready')

      // 3️⃣ Build message
      const domain = window.location.host
      const uri = window.location.origin
      const nonce = crypto.randomUUID()
      const message = `${domain} wants you to sign in with your Ethereum account:
${address}

URI: ${uri}
Version: 1
Chain ID: ${arbitrumSepolia.id}
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`

      // 4️⃣ Sign exactly once
      const signature = await walletClient.signMessage({ account: address, message })

      // 5️⃣ Send signature to Supabase
      const { data, error: signInError } = await supabase.auth.signInWithWeb3({
        chain: 'ethereum',
        message,
        signature,
      })
      if (signInError) throw signInError

      // 6️⃣ Redirect to dashboard if successful
      if (data?.session) {
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, walletClient, open, router, supabase])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <button
        onClick={handleSignIn}
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        Sign In with Wallet
      </button>

      {isConnected && address && <p>Connected as {address}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
