//home/cubosdavinci/yogi3/app/page.tsx
"use client";

import bs58 from 'bs58';

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import {
  PublicKey,
  VersionedTransaction,
  TransactionMessage,
  SystemProgram,
  Commitment,
} from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import ErrorAlert from "@/components/banners/ErrorAlert";

// ────────────────────────────────────────────────
// Constants & Types
// ────────────────────────────────────────────────

const USDC_MINT_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const DEFAULT_COMMITMENT: Commitment = "confirmed";

type TxResult = {
  type: "SOL" | "USDC";
  signature: string;
  amount: number;
  recipient: string;
  network: string;
  nonce: string;
};

// ────────────────────────────────────────────────

export default function SolanaPage() {
  const { publicKey, connected, sendTransaction, wallet } = useWallet();
  const { connection } = useConnection();

  const [recipient, setRecipient] = useState("");
  const [amountSOL, setAmountSOL] = useState<number | "">(1);
  const [amountUSDC, setAmountUSDC] = useState<number | "">(1);
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Detect cluster from RPC endpoint
  useEffect(() => {
    if (!connection?.rpcEndpoint) return;
    const url = connection.rpcEndpoint.toLowerCase();
    if (url.includes("devnet")) setNetworkName("devnet");
    else if (url.includes("testnet")) setNetworkName("testnet");
    else if (url.includes("mainnet")) setNetworkName("mainnet-beta");
    else setNetworkName("custom");
  }, [connection?.rpcEndpoint]);

  const createNonce = useCallback(() => uuidv4(), []);

  // ─── Shared send logic ──────────────────────────────────────

  type PartialTxResult = {
  type: "SOL" | "USDC";
  signature: string;
  amount: number;
  recipient: string;
};

  const sendTransactionBase = useCallback(
  async (
    buildTx: () => Promise<VersionedTransaction>,
    successData: (sig: string) => PartialTxResult,   // ← changed
    label: "SOL" | "USDC"
  ): Promise<void> => {
    if (isSending) return;
    setIsSending(true);
    setError(null);
    setTxResult(null);

    const nonce = createNonce();

    try {
      if (!connected || !publicKey) throw new Error("Wallet not connected");
      if (!recipient) throw new Error("Recipient address is required");

      const transaction = await buildTx();

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(DEFAULT_COMMITMENT);

      const rawSignature = await sendTransaction(transaction, connection, {
        preflightCommitment: DEFAULT_COMMITMENT,
        maxRetries: 3,
      });

      // Fix: Convert base64 signature → base58
      const signature = bs58.encode(Buffer.from(rawSignature, 'base64'));

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        DEFAULT_COMMITMENT
      );

      setTxResult({
        ...successData(signature),
        network: networkName,
        nonce,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Transaction failed – check wallet network, balance & console";
      console.error(`${label} send failed:`, err);
      setError(msg);
    } finally {
      setIsSending(false);
    }
  },
  [connected, publicKey, recipient, connection, networkName, isSending, createNonce, sendTransaction,]
);

  // ─── Send SOL ───────────────────────────────────────────────

  const sendSOL = useCallback(async () => {
    if (typeof amountSOL !== "number" || amountSOL <= 0) {
      setError("Enter a valid SOL amount > 0");
      return;
    }

    await sendTransactionBase(
      async () => {
        const instructions = [
          SystemProgram.transfer({
            fromPubkey: publicKey!,
            toPubkey: new PublicKey(recipient),
            lamports: Math.floor(amountSOL * 1_000_000_000),
          }),
        ];

        const { blockhash } = await connection.getLatestBlockhash(DEFAULT_COMMITMENT);

        const message = new TransactionMessage({
          payerKey: publicKey!,
          recentBlockhash: blockhash,
          instructions,
        }).compileToV0Message();

        return new VersionedTransaction(message);
      },
      (signature) => ({
        type: "SOL" as const,
        signature,
        amount: amountSOL,
        recipient,
      }),
      "SOL"
    );
  }, [sendTransactionBase, amountSOL, publicKey, recipient, connection]);

  // ─── Send USDC ──────────────────────────────────────────────

  const sendUSDC = useCallback(async () => {
    if (typeof amountUSDC !== "number" || amountUSDC <= 0) {
      setError("Enter a valid USDC amount > 0");
      return;
    }

    await sendTransactionBase(
      async () => {
        const decimals = 6;
        const uiAmount = amountUSDC;
        const rawAmount = Math.floor(uiAmount * 10 ** decimals);

        const fromATA = await getAssociatedTokenAddress(USDC_MINT_DEVNET, publicKey!);
        const toATA = await getAssociatedTokenAddress(USDC_MINT_DEVNET, new PublicKey(recipient));

        const instructions = [
          createTransferInstruction(
            fromATA,
            toATA,
            publicKey!,
            rawAmount,
            [],
            TOKEN_PROGRAM_ID
          ),
        ];

        const { blockhash } = await connection.getLatestBlockhash(DEFAULT_COMMITMENT);

        const message = new TransactionMessage({
          payerKey: publicKey!,
          recentBlockhash: blockhash,
          instructions,
        }).compileToV0Message();

        return new VersionedTransaction(message);
      },
      (signature) => ({
        type: "USDC" as const,
        signature,
        amount: amountUSDC,
        recipient,
      }),
      "USDC"
    );
  }, [sendTransactionBase, amountUSDC, publicKey, recipient, connection]);

  // ─── Render ─────────────────────────────────────────────────

  const buttonTextSOL = isSending ? "Sending SOL..." : "Send SOL";
  const buttonTextUSDC = isSending ? "Sending USDC..." : "Send USDC";

  return (
    <div className="p-6 space-y-6 max-w-lg mx-auto">
      <div className="flex justify-center">
        <WalletMultiButton />
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Recipient */}
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Recipient Address</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value.trim())}
          placeholder="Enter Solana address (Base58)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* SOL Transfer */}
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Amount (SOL)</label>
        <input
          type="number"
          step="0.000000001"
          min="0"
          value={amountSOL}
          onChange={(e) => setAmountSOL(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={sendSOL}
          disabled={!connected || isSending || !recipient || typeof amountSOL !== "number" || amountSOL <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {buttonTextSOL}
        </button>
      </div>

      {/* USDC Transfer */}
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Amount (USDC)</label>
        <input
          type="number"
          step="0.000001"
          min="0"
          value={amountUSDC}
          onChange={(e) => setAmountUSDC(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
        <button
          onClick={sendUSDC}
          disabled={!connected || isSending || !recipient || typeof amountUSDC !== "number" || amountUSDC <= 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {buttonTextUSDC}
        </button>
      </div>

      {/* Status */}
      <div className="text-sm text-gray-600 space-y-1 pt-2 border-t">
        <p>
          Wallet: <span className="font-medium">{wallet?.adapter.name ?? "None"}</span>
        </p>
        <p>
          Address: <span className="font-mono break-all">{publicKey?.toBase58() ?? "Not connected"}</span>
        </p>
        {connected && networkName && (
          <p>
            Network: <strong>{networkName}</strong>
          </p>
        )}
      </div>

      {/* Transaction Result */}
      {txResult && (
        <div className="mt-6 p-5 border border-gray-200 rounded-xl bg-gray-50 shadow-sm space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">
            {txResult.type} Transaction Confirmed!
          </h3>
          <div className="text-sm space-y-1">
            <p>
              Network: <strong>{txResult.network}</strong>
            </p>
            <p>
              Nonce: <span className="font-mono text-xs">{txResult.nonce}</span>
            </p>
            <p className="break-all">
              Signature:{" "}
              <a
                href={`https://explorer.solana.com/tx/${txResult.signature}?cluster=${txResult.network}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-mono text-xs"
              >
                {txResult.signature}
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}