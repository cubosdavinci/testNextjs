"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import ErrorAlert from "@/components/banners/ErrorAlert";

// SPL Token imports for USDC
import {
    createTransferInstruction,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";

export default function SolanaPage() {

  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const [recipient, setRecipient] = useState("");
  const [amountSOL, setAmountSOL] = useState(1);      // default 1 SOL
  const [amountUSDC, setAmountUSDC] = useState(1);    // default 1 USDC
  const [txResult, setTxResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string>("");

  // USDC mint on devnet
  const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

  // Detect network/cluster on client only
  useEffect(() => {
    if (!connection) return;
    const url = connection.rpcEndpoint;
    if (url.includes("devnet")) setNetworkName("devnet");
    else if (url.includes("testnet")) setNetworkName("testnet");
    else setNetworkName("mainnet-beta");
  }, [connection]);

  const sendSOL = async () => {
    try {
      setError(null);
      setTxResult(null);

      if (!connected) throw new Error("Wallet not connected");
      if (!recipient) throw new Error("Recipient address is required");

      const toPubkey = new PublicKey(recipient);
      const lamports = Math.floor(amountSOL * 1_000_000_000); // SOL -> lamports

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey!,
          toPubkey,
          lamports,
        })
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey!;

      const signature = await sendTransaction(transaction, connection, { preflightCommitment: 'confirmed' });
      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });

      setTxResult({ 
        type: "SOL", 
        signature, 
        lamports, 
        recipient,
        network: networkName
      });
    } catch (err: any) {
      setError(err.message ?? "Unexpected error");
      console.error(err);
    }
  };

  const sendUSDC = async () => {
    try {
      setError(null);
      setTxResult(null);

      if (!connected) throw new Error("Wallet not connected");
      if (!recipient) throw new Error("Recipient address is required");

      const toPubkey = new PublicKey(recipient);
      const decimals = 6;
      const amount = Math.floor(amountUSDC * Math.pow(10, decimals));

      const fromATA = await getAssociatedTokenAddress(USDC_MINT, publicKey!);
      const toATA = await getAssociatedTokenAddress(USDC_MINT, toPubkey);

      const transaction = new Transaction().add(
        createTransferInstruction(fromATA, toATA, publicKey!, amount, [], TOKEN_PROGRAM_ID)
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey!;

      const signature = await sendTransaction(transaction, connection, { preflightCommitment: 'confirmed' });
      await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });

      setTxResult({ 
        type: "USDC", 
        signature, 
        amount, 
        recipient,
        network: networkName
      });
    } catch (err: any) {
      setError(err.message ?? "Unexpected error");
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <WalletMultiButton />

      {error && <ErrorAlert message={error} />}

      <div className="space-y-2">
        <label className="block font-semibold">Recipient Address:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Enter Solana address"
        />
      </div>

      {/* SOL */}
      <div className="space-y-2">
        <label className="block font-semibold">Amount SOL:</label>
        <input
          type="number"
          value={amountSOL}
          onChange={(e) => setAmountSOL(parseFloat(e.target.value))}
          className="border p-2 rounded w-full"
          step="0.01"
          min="0"
        />
        <button
          onClick={sendSOL}
          disabled={!connected}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send SOL
        </button>
      </div>

      {/* USDC */}
      <div className="space-y-2">
        <label className="block font-semibold">Amount USDC:</label>
        <input
          type="number"
          value={amountUSDC}
          onChange={(e) => setAmountUSDC(parseFloat(e.target.value))}
          className="border p-2 rounded w-full"
          step="0.01"
          min="0"
        />
        <button
          onClick={sendUSDC}
          disabled={!connected}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Send USDC
        </button>
      </div>

      <p>Connected Wallet: {publicKey?.toBase58() ?? "None"}</p>
      {connected && networkName && (
        <p>Network/Cluster: <strong>{networkName}</strong></p>
      )}

      {/* Transaction result */}
      {txResult && (
        <div className="mt-4 p-4 border rounded bg-gray-50 space-y-2">
          <p className="font-semibold text-lg">{txResult.type} Transaction Sent!</p>
          <p>Network/Cluster: <strong>{txResult.network}</strong></p>
          <pre>{JSON.stringify(txResult, null, 2)}</pre>
          <a
            href={`https://explorer.solana.com/tx/${txResult.signature}?cluster=${txResult.network}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            View on Solana Explorer
          </a>
        </div>
      )}
    </div>
  );
}