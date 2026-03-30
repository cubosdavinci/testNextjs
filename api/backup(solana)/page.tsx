"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
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
  createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";

import ErrorAlert from "@/components/banners/ErrorAlert";

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

type SuccessDataFn = (signature: string) => Omit<TxResult, "network" | "nonce">;

type TxStatus = "idle" | "pending" | "confirming" | "success";

export default function SolanaPage() {
  const { publicKey, connected, sendTransaction, wallet } = useWallet();
  const { connection } = useConnection();

  const [recipient, setRecipient] = useState("");
  const [amountSOL, setAmountSOL] = useState<number | "">(1);
  const [amountUSDC, setAmountUSDC] = useState<number | "">(1);

  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Network detection
  useEffect(() => {
    if (!connection?.rpcEndpoint) return;
    const url = connection.rpcEndpoint.toLowerCase();
    if (url.includes("devnet")) setNetworkName("devnet");
    else if (url.includes("testnet")) setNetworkName("testnet");
    else if (url.includes("mainnet")) setNetworkName("mainnet-beta");
    else setNetworkName("custom");
  }, [connection?.rpcEndpoint]);

  // Wallet disconnected message
  useEffect(() => {
    if (!connected) {
      setError("Wallet is disconnected. Please connect your wallet.");
      setTxStatus("idle");
    } else {
      setError(null);
    }
  }, [connected]);

  const createNonce = useCallback(() => uuidv4(), []);

  // Clear error when user wants (used by the X button)
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ─── Shared send logic ─────────────────────────
  const sendTransactionBase = useCallback(
    async (
      buildTx: () => Promise<VersionedTransaction>,
      successData: SuccessDataFn,
      type: "SOL" | "USDC"
    ) => {
      if (isSending) return;

      setIsSending(true);
      setError(null);
      setTxResult(null);
      setTxStatus("pending");

      try {
        if (!connected || !publicKey) {
          throw new Error("Wallet is disconnected. Please connect your wallet.");
        }
        if (!recipient) {
          throw new Error("Recipient address is required");
        }

        const transaction = await buildTx();

        const signature = await sendTransaction(transaction, connection, {
          preflightCommitment: DEFAULT_COMMITMENT,
          maxRetries: 3,
        });

        setTxStatus("confirming");

        await connection.confirmTransaction(signature, DEFAULT_COMMITMENT);

        const result: TxResult = {
          ...successData(signature),
          network: networkName,
          nonce: createNonce(),
        };

        setTxResult(result);
        setTxStatus("success");

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        console.error("Transaction failed:", err);
        setError(msg);
        setTxStatus("idle");
      } finally {
        setIsSending(false);
      }
    },
    [connected, publicKey, recipient, connection, networkName, isSending, sendTransaction, createNonce]
  );

  // Send SOL & USDC (unchanged)
  const sendSOL = useCallback(async () => {
    if (typeof amountSOL !== "number" || amountSOL <= 0) {
      setError("Enter valid SOL amount");
      return;
    }
    await sendTransactionBase(
      async () => {
        const { blockhash } = await connection.getLatestBlockhash(DEFAULT_COMMITMENT);
        const message = new TransactionMessage({
          payerKey: publicKey!,
          recentBlockhash: blockhash,
          instructions: [
            SystemProgram.transfer({
              fromPubkey: publicKey!,
              toPubkey: new PublicKey(recipient),
              lamports: Math.floor(amountSOL * 1_000_000_000),
            }),
          ],
        }).compileToV0Message();
        return new VersionedTransaction(message);
      },
      (signature) => ({
        type: "SOL",
        signature,
        amount: amountSOL,
        recipient,
      }),
      "SOL"
    );
  }, [amountSOL, publicKey, recipient, connection, sendTransactionBase]);

  const sendUSDC = useCallback(async () => {
    if (typeof amountUSDC !== "number" || amountUSDC <= 0) {
      setError("Enter valid USDC amount");
      return;
    }
    await sendTransactionBase(
      async () => {
        const decimals = 6;
        const rawAmount = Math.floor(amountUSDC * 10 ** decimals);
        const fromATA = await getAssociatedTokenAddress(USDC_MINT_DEVNET, publicKey!);
        const toATA = await getAssociatedTokenAddress(USDC_MINT_DEVNET, new PublicKey(recipient));

        const { blockhash } = await connection.getLatestBlockhash(DEFAULT_COMMITMENT);

        const instructions = [
          createAssociatedTokenAccountIdempotentInstruction(
            publicKey!, toATA, new PublicKey(recipient), USDC_MINT_DEVNET
          ),
          createTransferInstruction(fromATA, toATA, publicKey!, rawAmount, [], TOKEN_PROGRAM_ID),
        ];

        const message = new TransactionMessage({
          payerKey: publicKey!,
          recentBlockhash: blockhash,
          instructions,
        }).compileToV0Message();

        return new VersionedTransaction(message);
      },
      (signature) => ({
        type: "USDC",
        signature,
        amount: amountUSDC,
        recipient,
      }),
      "USDC"
    );
  }, [amountUSDC, publicKey, recipient, connection, sendTransactionBase]);

  // ─── UI ──────────────────────────────────────
  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <div className="flex justify-center">
        <WalletMultiButton />
      </div>

      {/* Closeable Error Alert */}
      {error && (
        <ErrorAlert 
          message={error} 
          onClose={clearError}   // ← Added X button support
        />
      )}

      {/* Transaction Status Feedback */}
      {txStatus === "pending" && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded text-blue-700">
          Sending transaction to wallet...
        </div>
      )}

      {txStatus === "confirming" && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
          Transaction sent — confirming on Solana network...
        </div>
      )}

      {txStatus === "success" && txResult && (
        <div className="p-4 border rounded bg-green-50">
          <p className="font-medium text-green-700">
            ✅ {txResult.type} transfer successful!
          </p>
          <p className="text-xs break-all mt-2 font-mono">{txResult.signature}</p>
        </div>
      )}

      <input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value.trim())}
        placeholder="Recipient address"
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        value={amountSOL}
        onChange={(e) => setAmountSOL(e.target.value === "" ? "" : Number(e.target.value))}
        className="w-full p-2 border rounded"
      />

      {/* Buttons now enabled when transaction is "available" (idle or success) */}
      <button
        onClick={sendSOL}
        disabled={!connected || isSending || (txStatus !== "idle" && txStatus !== "success")}
        className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
      >
        {isSending ? "Processing..." : "Send SOL"}
      </button>

      <button
        onClick={sendUSDC}
        disabled={!connected || isSending || (txStatus !== "idle" && txStatus !== "success")}
        className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50"
      >
        Send USDC
      </button>

      <div className="text-sm text-gray-600">
        <p>Wallet: {wallet?.adapter.name ?? "None"}</p>
        <p>Address: {publicKey?.toBase58() ?? "Not connected"}</p>
        <p>Network: {networkName || "Unknown"}</p>
      </div>
    </div>
  );
}