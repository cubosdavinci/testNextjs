"use client"
import {AMOY_DOMAIN} from "@/lib/web3/contract/types/domains"
import { useState } from "react"
import { ethers } from "ethers"
import { signERC2612Permit } from "eth-permit"
import {
  EscrowOrderPayload,
  EscrowOrderPayloadTypesEIP712
} from "@/app/testing-create-order/types/EscrowOrderPayloadEIP712Types"
import { BrowserProvider } from "ethers"
import { EIP1193Provider } from "hardhat/types/providers"

interface EscrowSignButtonProps {
  orderPayload: EscrowOrderPayload
  discoveredProvider: any
}


export function EscrowSignButton({ orderPayload, discoveredProvider}: EscrowSignButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleSign() {
    try {
      setLoading(true)

      const provider = new BrowserProvider(discoveredProvider)
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
<button
  onClick={handleSign}
  disabled={loading}
  className="
    w-full
    rounded-xl
    bg-gradient-to-r from-indigo-500 to-purple-600
    px-5 py-3
    text-base font-semibold text-white
    shadow-lg shadow-indigo-500/30
    transition-all duration-200

    hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40
    active:translate-y-0 active:shadow-md

    focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2

    disabled:cursor-not-allowed
    disabled:opacity-60
    disabled:shadow-none
    disabled:hover:translate-y-0
  "
>
  {loading ? "Signing..." : "Create Escrow"}
</button>
  )
}