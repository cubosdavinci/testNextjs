'use client'

import { useEffect, useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { useWalletClient } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import { createAnonClient } from '@/lib/supabase/client'
import { appKit } from '@/app/providers'

export default function Login() {
  const { isConnected, address } = useAppKitAccount()
  const { data: walletClient } = useWalletClient()

  const provider = walletClient?.transport // EIP-1193 provider
  const supabase = createAnonClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSignedIn, setHasSignedIn] = useState(false)

  /**
   * 1️⃣ Auto-open AppKit if wallet is NOT connected
   */
  useEffect(() => {
    if (!isConnected) {
      appKit.open()
    }
  }, [isConnected])

  /**
   * 2️⃣ Auto sign-in once wallet is connected & ready
   */
  useEffect(() => {
    if (!isConnected || !address || !provider || hasSignedIn) return

    const signInAsync = async () => {
      try {
        setLoading(true)
        setError(null)

        const domain = window.location.host
const uri = window.location.origin
const nonce = crypto.randomUUID()

const message = `${domain} wants you to sign in with your Ethereum account:
${address}

Sign in to MyCoolApp

URI: ${uri}
Version: 1
Chain ID: ${arbitrumSepolia.id}
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`

        const signature = (await provider.request({
          method: 'personal_sign',
          params: [message, address],
        })) as `0x${string}`

        const { data, error: signInError } =
          await supabase.auth.signInWithWeb3({
            chain: 'ethereum',
            message,
            signature,
          })

        if (signInError) throw signInError

        setHasSignedIn(true)
        console.log('Signed in!', data.session)
        // TODO: redirect
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Sign-in failed')
      } finally {
        setLoading(false)
      }
    }

    signInAsync()
  }, [isConnected, address, provider, hasSignedIn])

  /**
   * 3️⃣ Manual sign-in (optional fallback)
   */
  const handleManualSignIn = async () => {
    if (!provider || !address) {
      setError('Wallet not connected')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const nonce = crypto.randomUUID()

      const message = `
domain: ${window.location.host}
address: ${address.toLowerCase()}
uri: ${window.location.origin}
version: 1
chainId: ${arbitrumSepolia.id}
nonce: ${nonce}
issuedAt: ${new Date().toISOString()}
      `.trim()

      const signature = (await provider.request({
        method: 'personal_sign',
        params: [message, address],
      })) as `0x${string}`

      const { data, error: signInError } =
        await supabase.auth.signInWithWeb3({
          chain: 'ethereum',
          message,
          signature,
        })

      if (signInError) throw signInError

      setHasSignedIn(true)
      console.log('Signed in!', data.session)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {isConnected && (
        <div>
          <p>Connected as {address}</p>
          <button onClick={handleManualSignIn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In with Wallet'}
          </button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
