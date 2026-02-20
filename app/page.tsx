"use client";

import { useState } from "react";
import {
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

import {
  useAppKitAccount,
  useAppKitProvider,
  AppKitButton,
  useAppKit,
} from "@reown/appkit/react";
import { useAppKitConnection, type Provider } from "@reown/appkit-adapter-solana/react";
import { useSession } from "@/components/auth/useSession";
import { Spinner } from "@/components/auth/spinner";
import ErrorAlert from "@/components/banners/ErrorAlert";

export default function SolanaPage() {
  const { session, user, sessionLoading, signInWithWeb3Account } = useSession();

  // -----------------------------
  // AppKit hooks
  // -----------------------------
  const { address, isConnected } = useAppKitAccount();
  const { connection, } = useAppKitConnection(); 
  const { walletProvider, } = useAppKitProvider<Provider>("solana");
  /*const { open } = useAppKit();*/

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Sign-in flow
  // -----------------------------
  const handleSignMessage = async () => {
    if (!isConnected || !address) {
      setError("Wallet not connected yet");
      return;
    }
console.log("Signing the message")
    try {
      setLoading(true);
      const domain = window.location.host;
      const uri = window.location.origin;
      const nonce = crypto.randomUUID();
      const message = `${domain} wants you to sign in with your Solana account:
${address}

URI: ${uri}
Version: 1
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

const messageBytes = new TextEncoder().encode(message)

      // AppKit signing
      console.log("Wallet Provider Name: ", walletProvider.name)
      console.log("Wallet Provider Chain: ", walletProvider.chain.toString)
      console.log("Wallet Provider Chains: ", walletProvider.chains.toString)
      const signature = await walletProvider.signMessage(messageBytes);
      console.log("Signature: ", signature)

      // Optional: verify wallet with backend / Supabase
      const { error: verifyError } = await signInWithWeb3Account({
        chain: "solana",
        message,
        signature,
      });

      /*if (verifyError) setError(`Wallet verification failed: ${verifyError.message}`);*/

      if (verifyError) {
        console.error("Supabase error:", verifyError)
        setError(`Wallet verification failed: ${JSON.stringify(verifyError, null, 2)}`)
      }
      else setError(null);
    } catch (err: any) {
      setError(err?.message || "Wallet verification failed");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Example: increment counter on Solana
  // -----------------------------
  /*
  async function onIncrementCounter() {
    if (!walletProvider || !connection) {
      setError("Wallet not connected or provider missing");
      return;
    }

    try {
      setLoading(true);

      const PROGRAM_ID = new PublicKey("Cb5aXEgXptKqHHWLifvXu5BeAuVLjojQ5ypq6CfQj1hy");
      const counterKeypair = Keypair.generate();
      const counter = counterKeypair.publicKey;

      // Check wallet balance
      const balance = await connection.getBalance(walletProvider.publicKey!);
      if (balance < LAMPORTS_PER_SOL / 100) throw new Error("Not enough SOL in wallet");

      const COUNTER_ACCOUNT_SIZE = 8;
      const allocIx: TransactionInstruction = SystemProgram.createAccount({
        fromPubkey: walletProvider.publicKey!,
        newAccountPubkey: counter,
        lamports: await connection.getMinimumBalanceForRentExemption(COUNTER_ACCOUNT_SIZE),
        space: COUNTER_ACCOUNT_SIZE,
        programId: PROGRAM_ID,
      });

      const incrementIx: TransactionInstruction = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [{ pubkey: counter, isSigner: false, isWritable: true }],
        data: Buffer.from([0x0]),
      });

      const tx = new Transaction().add(allocIx).add(incrementIx);
      tx.feePayer = walletProvider.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;

      // Sign & send
      await walletProvider.signAndSendTransaction(tx, [counterKeypair]);

      // Fetch counter account
      const counterAccountInfo = await connection.getAccountInfo(counter, { commitment: "confirmed" });
      if (!counterAccountInfo) throw new Error("Expected counter account to exist");

      const counterAccount = { count: counterAccountInfo.data[0] }; // simple deserialize
      console.log("Counter value:", counterAccount.count);
    } catch (err: any) {
      setError(err?.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  }*/

  // -----------------------------
  // Render
  // -----------------------------
  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="p-6 space-y-4">
      <p>
        <span className="text-red-500">Wallet address: </span>
        {address ?? "not connected"}
      </p>
      <p>
        <span className="text-red-500">Wallet connected: </span>
        {isConnected ? "Yes" : "No"}
      </p>

      {/* Connect Wallet Button */}
      <AppKitButton label="Connect Wallet" loadingLabel="Opening wallet..." size="md" />

      {/* Sign-in */}
      {!user && (
        <button onClick={handleSignMessage} className="px-4 py-2 bg-green-600 text-white rounded">
          Sign In With Wallet
        </button>
      )}

      {/* Increment counter
      <button
        onClick={onIncrementCounter}
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={!isConnected}
      >
        Increment Counter
      </button> */}

      {/* Optional user info */}
      {user && (
        <details className="border rounded p-2 bg-gray-50">
          <summary className="cursor-pointer font-semibold text-red-500">User Info</summary>
          <pre className="overflow-x-auto mt-2">{JSON.stringify(user, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}