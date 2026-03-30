"use client";

/**
 * ================================
 * React + Solana + AppKit page
 * ================================
 * - Next.js App Router (client component)
 * - Uses Reown AppKit for wallet connection
 * - Signs a SIWS-style message for auth
 */

import { useState } from "react";

/**
 * -----------------------------
 * Solana Web3 primitives
 * -----------------------------
 * Used for:
 * - PublicKey / transactions
 * - (Commented example) on-chain interaction
 */
/*import {
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";*/

/**
 * -----------------------------
 * AppKit (wallet + provider)
 * -----------------------------
 * AppKit abstracts wallet adapters (Phantom, Solflare, etc.)
 */
import {
  useAppKitAccount,     // wallet address + connection state
  useAppKitProvider,    // low-level provider (signing, txs)
  AppKitButton,         // prebuilt connect button
  useAppKit,
} from "@reown/appkit/react";

import {
  useAppKitConnection, // Solana RPC connection
  type Provider,       // typed Solana provider
} from "@reown/appkit-adapter-solana/react";

/**
 * -----------------------------
 * App-specific auth + UI
 * -----------------------------
 */
import { useSession } from "@/components/auth/useSession";
import { Spinner } from "@/components/auth/spinner";
import ErrorAlert from "@/components/banners/ErrorAlert";

export default function SolanaPage() {
  /**
   * =============================
   * Auth / session state
   * =============================
   * - sessionLoading: auth still initializing
   * - user: logged-in user (after wallet auth)
   * - signInWithWeb3Account: backend verification
   */
  const { session, user, sessionLoading, signInWithWeb3Account } = useSession();

  /**
   * =============================
   * AppKit wallet state
   * =============================
   */

  // Wallet public address + connection flag
  const { address, isConnected } = useAppKitAccount();

  // Solana RPC connection (same role as new Connection(...))
  const { connection } = useAppKitConnection();

  // Wallet provider (signMessage, signAndSendTransaction, etc.)
  const { walletProvider } =
    useAppKitProvider<Provider>("solana");

  // Optional: manually open wallet modal
  /* const { open } = useAppKit(); */

  /**
   * =============================
   * Local UI state
   * =============================
   */
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * =============================
   * SIGN-IN FLOW (SIWS-style)
   * =============================
   * - User signs a message
   * - Signature sent to backend
   * - Backend verifies ownership
   */
  const handleSignMessage = async () => {
    // Guard: wallet must be connected
    if (!isConnected || !address) {
      setError("Wallet not connected yet");
      return;
    }

    console.log("Signing the message");

    try {
      setLoading(true);

      // Standard "Sign-In With Solana" style fields
      const domain = window.location.host;
      const uri = window.location.origin;
      const nonce = crypto.randomUUID();

      const message = `${domain} wants you to sign in with your Solana account:
${address}

URI: ${uri}
Version: 1
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

      // Convert message to bytes (required by wallet APIs)
      const messageBytes = new TextEncoder().encode(message);

      /**
       * Wallet signing
       * - walletProvider abstracts Phantom / Solflare / etc.
       */
      console.log("Wallet Provider Name:", walletProvider.name);

      const signature = await walletProvider.signMessage(messageBytes);

      console.log("Signature:", signature);

      /**
       * Backend verification
       * - Typically checks signature matches address
       * - Creates / resumes user session
       */
      const { error: verifyError } = await signInWithWeb3Account({
        chain: "solana",
        message,
        signature,
      });

      if (verifyError) {
        console.error("Supabase error:", verifyError);
        setError(
          `Wallet verification failed: ${JSON.stringify(
            verifyError,
            null,
            2
          )}`
        );
      } else {
        setError(null);
      }
    } catch (err: any) {
      setError(err?.message || "Wallet verification failed");
    } finally {
      setLoading(false);
    }
  };

  /**
   * =============================
   * ON-CHAIN EXAMPLE (COMMENTED)
   * =============================
   * Demonstrates:
   * - Creating an account
   * - Sending a transaction
   * - Reading on-chain state
   *
   * (Currently disabled)
   */
  /*
  async function onIncrementCounter() {
    if (!walletProvider || !connection) {
      setError("Wallet not connected or provider missing");
      return;
    }

    try {
      setLoading(true);

      const PROGRAM_ID = new PublicKey("...");
      const counterKeypair = Keypair.generate();

      const balance = await connection.getBalance(walletProvider.publicKey!);
      if (balance < LAMPORTS_PER_SOL / 100)
        throw new Error("Not enough SOL");

      // Create account instruction
      const allocIx = SystemProgram.createAccount({ ... });

      // Program instruction
      const incrementIx = new TransactionInstruction({ ... });

      const tx = new Transaction().add(allocIx, incrementIx);

      await walletProvider.signAndSendTransaction(tx, [counterKeypair]);

    } catch (err) {
      setError("Transaction failed");
    } finally {
      setLoading(false);
    }
  }
  */

  /**
   * =============================
   * RENDER STATES
   * =============================
   */

  // Loading screen
  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error screen
  if (error) {
    return <ErrorAlert message={error} />;
  }

  /**
   * =============================
   * MAIN UI
   * =============================
   */
  return (
    <div className="p-6 space-y-4">
      {/* Wallet info */}
      <p>
        <span className="text-red-500">Wallet address: </span>
        {address ?? "not connected"}
      </p>

      <p>
        <span className="text-red-500">Wallet connected: </span>
        {isConnected ? "Yes" : "No"}
      </p>

      {/* Wallet connect modal */}
      <AppKitButton
        label="Connect Wallet"
        loadingLabel="Opening wallet..."
        size="md"
      />

      {/* Wallet-based auth */}
      {!user && (
        <button
          onClick={handleSignMessage}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Sign In With Wallet
        </button>
      )}

      {/* Optional user debug info */}
      {user && (
        <details className="border rounded p-2 bg-gray-50">
          <summary className="cursor-pointer font-semibold text-red-500">
            User Info
          </summary>
          <pre className="overflow-x-auto mt-2">
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}