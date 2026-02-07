"use client";

import { useConnection } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createAnonClient } from "@/lib/supabase/client";

export default function LoginButton() {
  const supabase = createAnonClient();
  const { isConnected, address } = useConnection();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleWeb3Login = async () => {
    if (!isConnected) {
      setError('Please connect your MetaMask wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: 'ethereum',
        statement: 'Sign in to MyApp (web3 secure access)', // shown in wallet prompt
        // Optional extras (if needed):
        // address: address, // usually auto-detected, but can specify
        // nonce: 'custom-nonce-if-you-manage-it', // rare
      });

      if (error) throw error;

      console.log('Signed in successfully:', data.session, data.user);
      router.push('/dashboard'); // or wherever after login
    } catch (err: any) {
      console.error('Web3 login failed:', err);
      setError(err.message || 'Failed to sign in with wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button
        onClick={handleWeb3Login}
        disabled={loading || !isConnected}
      >
        {loading ? 'Signing...' : 'Login with MetaMask'}
      </button>
    </div>
  );
}