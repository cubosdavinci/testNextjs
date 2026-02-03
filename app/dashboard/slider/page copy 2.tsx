"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getClientSession } from "@/lib/supabase/auth"


import { preloadIcons } from "@/lib/web3/preloadIcons"
import WalletSlider from "components/radix-ui-slider/WalletSlider"
import BNetworkSlider from "components/radix-ui-slider/BNetworkSlider"

import { WalletService } from "wallet/service"
import { detectWallets } from "wallet/providers"
import { validateNetwork } from "wallet/connect"
import { getTokenAddress } from "@/lib/web3/wallets"
import { Web3AddressSchema } from "@/lib/zod/Web3AddressSchema"
import { ZodError } from "zod/v4"
import { AuthApiError } from "@supabase/supabase-js"

const walletService = new WalletService()

type Step = "idle" | "connecting" | "network" | "token" | "saving" | "done"

export default function Page() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [selectedWallet, setSelectedWallet] = useState("io.metamask")
  const [selectedChainId, setSelectedChainId] = useState<number>()
  const [selectedToken, setSelectedToken] = useState<string>()
  const [walletAddress, setWalletAddress] = useState<string>("")

  const [isRegistering, setIsRegistering] = useState(false)
  const [step, setStep] = useState<Step>("idle")
  const [modalOpen, setModalOpen] = useState(false)
  const [status, setStatus] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  // Preload wallet icons once
  useEffect(() => {
    preloadIcons()
  }, [])

   useEffect(() => {
    async function checkAuth() {
      const sess = await getClientSession()
      if (!sess) {
        // redirect if not signed in
        router.replace("/login")
        return
      }

      // user is signed in      
      setSession(sess)
      if (sess) {
        console.log("Session: ", sess)
          console.log("provider: ", sess)
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) return <div>Loading…</div>

  async function startWizard() {
    try {
      setError(null)
      setModalError(null)
      setIsRegistering(true)

      // Validate wallet address (optional)
      if (walletAddress) {
        try {
          Web3AddressSchema.parse(walletAddress)
        } catch (err) {
          if (err instanceof ZodError) {
            setError(err.issues.map(i => i.message).join(", "))
          } else {
            setError("Invalid wallet address")
          }
          return
        }
      }

      if (!selectedWallet || !selectedChainId || !selectedToken) {
        setError("Missing wallet, network, or token selection")
        return
      }



      setModalOpen(true)
      setStep("connecting")
      setStatus("Looking for wallet provider...")

      const wallets = await detectWallets()
      const discovered = wallets.find(w => w.info.rdns === selectedWallet)
      if (!discovered) throw new Error("Wallet provider not found")

      setStatus("Requesting wallet connection & signature...")
      const address = await walletService.connectAndSaveWallet({
        user_id: session.user.id,
        provider: discovered.provider,
        wallet_provider: selectedWallet,
        wallet_address: walletAddress || undefined,
        chain_id: selectedChainId!,
        token: {
          address: getTokenAddress(selectedChainId!, selectedToken!)!,
          symbol: selectedToken!,
          decimals: 6
        }
      })

      // Optional: network validation
      setStep("network")
      setStatus("Validating network...")
      validateNetwork(selectedChainId!)

      // Optional: token handling
      setStep("token")
      setStatus("Adding token to wallet...")

      // Saving wallet to DB
      setStep("saving")
      setStatus("Saving wallet to database...")

      setStep("done")
      setStatus("Wallet successfully registered 🎉")
    } catch (err: any) {
      console.error(err)
      if (err instanceof ZodError) {
        setModalError(err.issues.map(i => i.message).join("\n"))
      } else if (err instanceof AuthApiError) {
        setModalError(err.message || "Authentication error")
      } else {
        setModalError(err.message || "Wallet registration failed")
      }
      setStep("idle")
    } finally {
      setIsRegistering(false)
    }
  }

  function StepRow({ label, active, done }: { label: string; active: boolean; done: boolean }) {
    return (
      <div className="flex items-center justify-between">
        <span className={active ? "text-blue-600 font-medium" : ""}>{label}</span>
        <span>{done ? "✅" : active ? "🔵" : "⚪"}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-8">
      <WalletSlider sliderName="Select Wallet Provider" value={selectedWallet} returns={setSelectedWallet} />

      <BNetworkSlider sliderName="Select Network" value={selectedChainId!} outChainId={setSelectedChainId} outToken={setSelectedToken} />

      <div className="mt-6 text-center text-lg font-medium text-gray-800">Selected wallet: {selectedWallet}</div>
      <div className="mt-2 text-center text-lg font-medium text-gray-800">Selected chain: {selectedChainId}</div>
      <div className="mt-2 text-center text-lg font-medium text-gray-800">Selected token: {selectedToken}</div>

      <div className="mt-4 w-full max-w-md">
        <label className="block mb-2 text-sm font-medium text-gray-700">Wallet Address (optional)</label>
        <input
          value={walletAddress}
          onChange={e => setWalletAddress(e.target.value)}
          placeholder="0x..."
          className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
        />
      </div>

      <button
        disabled={isRegistering || !selectedWallet || !selectedChainId || !selectedToken}
        onClick={startWizard}
        className="mt-6 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRegistering ? "Registering Wallet..." : "Register New Wallet"}
      </button>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-6">
            <h2 className="text-xl font-semibold">Register New Wallet</h2>

            <StepRow label="Connect Wallet" active={step === "connecting"} done={["network", "token", "saving", "done"].includes(step)} />
            <StepRow label="Set Network" active={step === "network"} done={["token", "saving", "done"].includes(step)} />
            <StepRow label="Add Token" active={step === "token"} done={["saving", "done"].includes(step)} />
            <StepRow label="Save Wallet" active={step === "saving"} done={step === "done"} />

            <div className="text-sm text-gray-600 min-h-[40px]">{status}</div>

            {modalError && <div className="text-sm text-red-600 whitespace-pre-line">{modalError}</div>}

            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border">
                Cancel
              </button>

              <button disabled={step !== "idle" && step !== "done"} onClick={startWizard} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">
                {step === "done" ? "Close" : "Start"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
