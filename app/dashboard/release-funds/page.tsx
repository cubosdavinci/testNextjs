"use client"
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ReleaseFundsMessage } from "@/lib/web3/contract/ReleaseFundsMessage"; // Import the ReleaseFundsMessage class
import { IReleaseFunds } from "@/lib/web3/contract/types/eip712/IReleaseFunds"; // Define the IReleaseFunds interface
import { OrderIdSchema } from "@/lib/zod/OrderIdSchema";
import { ZodError } from "zod";

export default function ReleaseFundsPage() {
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the window.ethereum object is available (MetaMask)
    if (typeof window.ethereum !== "undefined") {
      console.log("MetaMask is installed!");
    } else {
      console.error("MetaMask is not installed. Please install MetaMask.");
    }
  }, []);

const handleSignOrder = async () => {
  try {
    setLoading(true);
    setError(null);

    // Check if MetaMask is available
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed. Please install MetaMask.");
      return;
    }

    // Request account access if not already granted
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Create an Ethers.js provider using the MetaMask provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Use await here to resolve the Promise
    const signer = await provider.getSigner(); // MetaMask signer

    // Create the ReleaseFundsMessage instance (sign the order)
    const orderId = OrderIdSchema.parse("550e8400-e29b-41d4-a716-446655440000");
    const releaseFundsMessage = new ReleaseFundsMessage(orderId, signer);

    // Wait until the signature is generated
    if (releaseFundsMessage.signature) {
      const data: IReleaseFunds = {
        ...releaseFundsMessage.data,
        signature: releaseFundsMessage.signature,
    };

    console.log(data)
    
      // Send the data to the API route
      const response = await fetch('/api/web3/release-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Funds released:", result);
      } else {
        setError("Failed to release funds");
      }
    }
  } catch (err) {
     if (err instanceof ZodError) {
                setError(err.issues.map((i) => i.message).join(", "));
              } else {
                setError("Failed to sign or send the order");
              }
    
  } finally {
    setLoading(false);
  }
};


  return (
    <div>
      <h1>Release Funds</h1>
      <button onClick={handleSignOrder} disabled={loading}>
        {loading ? "Signing..." : "Sign Order"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {signature && <p>Signature: {signature}</p>}
    </div>
  );
}
