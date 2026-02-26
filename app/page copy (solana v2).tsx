"use client";

import { useState } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function SolanaPage() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  // State for the recipient address
  const [recipient, setRecipient] = useState("");

  const sendSOL = async () => {
    if (!connected) return alert("Wallet not connected");
    if (!recipient) return alert("Please enter a recipient address");

    let toPubkey: PublicKey;
    try {
      toPubkey = new PublicKey(recipient);
    } catch (err) {
      return alert("Invalid address");
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey!,
        toPubkey,
        lamports: 1_000_000_000, // 1 SOL = 1_000_000_000 lamports
      })
    );



    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

        // Attach blockhash and feePayer
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey!;


    const signature = await sendTransaction(transaction, connection, {
      preflightCommitment: 'confirmed',
    });

    await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
    alert(`Transaction sent! Signature: ${signature}`);
  };

  return (
    <div className="p-6 space-y-4">
      <WalletMultiButton />

      <div className="space-y-2">
        <label className="block font-semibold">Recipient Address:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Enter Solana address"
        />
        <button
          onClick={sendSOL}
          disabled={!connected}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send 1 SOL
        </button>
      </div>

      <p>Connected Wallet: {publicKey?.toBase58() ?? "None"}</p>
    </div>
  );
}





// 384cf2PBQjvLEdbsiyPWjuzZ1Ethb3CFq9FmQjjV9Rikm5SREEu923Z7QXqV9EwqUeJzQQRurTqjaJaU3NZBTApq