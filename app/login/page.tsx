'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppKit } from '@reown/appkit/react'
import { useWalletClient, useAccount } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import { createAnonClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { modal } from '@/context-react'

export default function Login() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const provider = walletClient?.transport

  // Example USDT on Arbitrum Sepolia
const tokenAddress = '0xYourTokenAddressHere'
const networkId = 'eip155:421613' // CAIP-2 network ID for Arbitrum Sepolia

async function addToken() {
  try {
    modal.
    await modal.Evm.addToken({ networkId: 'eip155:421613', address: '0xYourUSDTAddress' })
    await appKit.Evm.addToken({
      networkId,
      address: tokenAddress,
    })
    console.log('Token added to AppKit successfully!')
  } catch (err) {
    console.error('Failed to add token:', err)
  }
}




  const supabase = createAnonClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 1️⃣ Connect wallet if needed
      if (!isConnected) {
        addToken()
        await open()
      }

      // 2️⃣ Wait until provider & address are ready
      let attempts = 0
      while (!provider || !address) {
        await new Promise((res) => setTimeout(res, 200))
        attempts++
        if (attempts > 15) throw new Error('Wallet not ready')
      }

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

      // 4️⃣ Request signature
      const signature = (await provider.request({
        method: 'personal_sign',
        params: [message, address],
      })) as `0x${string}`

      // 5️⃣ Call Supabase
      const { data, error: signInError } = await supabase.auth.signInWithWeb3({
        chain: 'ethereum',
        message,
        signature,
      })

      if (signInError) throw signInError

      console.log('Signed in!', data.session)
      if (data?.session) {
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, provider, open, router, supabase])

  // Auto-sign in if wallet connected and no error
  useEffect(() => {
    if (isConnected && address && provider && !loading && !error) {
      handleSignIn()
    }
  }, [isConnected, address, provider, loading, error, handleSignIn])

  // Jumpy dots loader
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex space-x-1">
          <span className="dot animate-bounce inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
          <span className="dot animate-bounce inline-block w-3 h-3 bg-blue-500 rounded-full animation-delay-200"></span>
          <span className="dot animate-bounce inline-block w-3 h-3 bg-blue-500 rounded-full animation-delay-400"></span>
        </div>
      </div>
    )
  }

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
