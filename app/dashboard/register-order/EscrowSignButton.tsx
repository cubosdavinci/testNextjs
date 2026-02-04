"use client"
import {AMOY_DOMAIN} from "@/app/testing-create-order/types/AmoyDomain"
import { useState } from "react"
import { ethers } from "ethers"
import { signERC2612Permit } from "eth-permit"
import {
  EscrowOrderPayload,
  EscrowOrderPayloadTypesEIP712
} from "@/app/testing-create-order/types/EscrowOrderPayloadEIP712Types"
import { BrowserProvider } from "ethers"

interface EscrowSignButtonProps {
  orderPayload: EscrowOrderPayload
}


export function EscrowSignButton({ orderPayload }: EscrowSignButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleSign() {
    try {
      setLoading(true)

      if (!window.ethereum) throw new Error("No wallet found")

      const provider = new BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()
      const buyer = await signer.getAddress()

      // Ensure the buyer matches orderPayload
      if (buyer.toLowerCase() !== orderPayload.buyer.toLowerCase()) {
        throw new Error("Connected wallet does not match order buyer")
      }

      // -----------------------
      // 1) Sign escrow intent (EIP-712)
      // -----------------------
      const escrowSig = await signer.signTypedData(
        AMOY_DOMAIN,
        EscrowOrderPayloadTypesEIP712,
        orderPayload
      )

      // -----------------------
      // 2) Sign ERC-2612 permit
      // -----------------------
      const permit = await signERC2612Permit(
        provider,
        orderPayload.paymentToken,
        buyer,
        AMOY_DOMAIN.verifyingContract,
        orderPayload.total,
        Number(orderPayload.deadline)
      )

      // -----------------------
      // Send both signatures to backend
      // -----------------------
      await fetch("/api/web3/contract/relayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({          
          escrowSig,
          permit,
          
        })
      })

      alert("Order submitted!")
    } catch (err: any) {
      console.error(err)
      alert(err?.message || "User rejected or error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleSign} disabled={loading}>
      {loading ? "Signing..." : "Create Escrow"}
    </button>
  )
}