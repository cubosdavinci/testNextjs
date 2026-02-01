// ewtewt
"use client";

import { useState, useEffect } from "react";
import { preloadIcons } from "@/lib/web3/preloadIcons";
import WalletSlider from "components/radix-ui-slider/WalletSlider"; // import the WalletSlider
import BNetworkSlider from "components/radix-ui-slider/BNetworkSlider"; // import the BNetworkSlider

// Modal Inclusion
import { WalletService } from "wallet/service";
import { detectWallets } from "wallet/providers";
import { validateNetwork } from "wallet/connect";
import { getTokenAddress, SUPPORTED_BNETWORKS } from "@/lib/web3/wallets";
import { ZodError } from "zod/v4";





export default function Page() {
  const [selectedWallet, setSelectedWallet] = useState("io.metamask");
  const [selectedChainId, setSelectedChainId] = useState<number>();
  const [selectedToken, setSelectedToken] = useState<string>();

//  Modal //
const [walletAddress, setWalletAddress] = useState<string>("")
const [isRegistering, setIsRegistering] = useState(false)

const walletService = new WalletService()

type Step =
  | "idle"
  | "connecting"
  | "network"
  | "token"
  | "saving"
  | "done"

const [step, setStep] = useState<Step>("idle")
const [modalOpen, setModalOpen] = useState(false)
const [status, setStatus] = useState<string>("")
const [error, setError] = useState<string | null>(null)
const [modalError, setModalError] = useState<string | null>(null)
/*
async function handleRegister() {
  try {
    setError(null)
    setIsRegistering(true)

    if (!selectedChainId || !selectedToken || !selectedWallet) {
      throw new Error("Missing wallet, network, or token selection")
    }

    // 1️⃣ Discover providers
    const wallets = await detectWallets()

    const discovered = wallets.find(
      (w) => w.info.rdns === selectedWallet
    )

    if (!discovered) {
      throw new Error("Selected wallet provider not found")
    }

    const provider = discovered.provider

    // 2️⃣ Verify ownership (connect + sign)
    const address = await walletService.connectAndSaveWallet({
      provider,
      wallet_provider: selectedWallet,
      chain_id: selectedChainId,
      token_address: selectedToken,
    })

    // 3️⃣ Validate network
    const network = validateNetwork(selectedChainId)

    // 4️⃣ Switch / Add network
    await ensureNetwork(provider, network)

    // 5️⃣ Add token to wallet
    await ensureToken(provider, selectedChainId, selectedToken)

    alert("Wallet successfully registered 🎉")
  } catch (err: any) {
    console.error(err)
    setError(err.message || "Failed to register wallet")
  } finally {
    setIsRegistering(false)
  }
}

*/
//////
async function startWizard() {
  try {
    setError(null)
    setModalError(null)
    // 1️⃣ Discover provider
    if (!walletAddress) {
      setError("You must enter a wallet address")
      return
    }

    setModalOpen(true)

    setStep("connecting")
    setStatus("Looking for wallet provider...")

    const wallets = await detectWallets()
    console.log("Wallets", wallets)
    const discovered = wallets.find(
      (w) => w.info.rdns === selectedWallet
    )


    if (!discovered) {
      throw new Error("Wallet provider not found")
    }


    const provider = discovered.provider

    // 2️⃣ Connect + verify
    setStatus("Requesting wallet connection & signature...")
    console.log("Step1: Requesting wallet connection & signature..." )
    const address = await walletService.connectAndSaveWallet({
      provider,
      wallet_provider: selectedWallet,
      chain_id: selectedChainId!,
      token_sym: selectedToken!,
      token_address: getTokenAddress(selectedChainId!, selectedToken!)!
    })

    // 3️⃣ Network
    setStep("network")
    setStatus("")
    console.log("Step2: Switching / adding network..." )
    const network = validateNetwork(selectedChainId!)
    //await ensureNetwork(provider, network)

    // 4️⃣ Token
    setStep("token")
    setStatus("Adding token to wallet...")
    console.log("Step3: Adding token to wallet..." )
    //await ensureToken(provider, selectedChainId!, selectedToken!)

    // 5️⃣ Save
    setStep("saving")
    setStatus("Saving wallet to database...")
   /* await walletService.connectAndSaveWallet({
      provider,
      wallet_provider: selectedWallet,
      chain_id: selectedChainId!,
      token_address: selectedToken!,
    })*/

    setStep("done")
    setStatus("Wallet successfully registered 🎉")
  } catch (err) {
      if (err instanceof ZodError) {
    let errors:string[] = []

    // Loop through each issue
    for (const issue of err.issues) {
      //const line = `${issue.path.join(".")}: ${issue.message}`;
      errors.push(issue.message)
      console.error(issue.message);
    }
    setModalError(errors.join('\n') || "Registration failed")
    setStep("idle")
  }else if (err instanceof Error){
    console.error(err)
    setModalError(err.message || "Registration failed")
    setStep("idle")
    }
  }
}



  function StepRow({
  label,
  active,
  done,
}: {
  label: string
  active: boolean
  done: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`${
          active ? "text-blue-600 font-medium" : ""
        }`}
      >
        {label}
      </span>

      <span>
        {done ? "✅" : active ? "🔵" : "⚪"}
      </span>
    </div>
  )
}
  

  // Handle changes to the selected wallet and blockchain
 /* useEffect(() => {
    console.log("Selected wallet:", selectedWallet);
    console.log("Selected blockchain:", selectedChainId);
    preloadIcons();
  }, [selectedWallet, selectedChainId]);*/

    useEffect(() => {
      preloadIcons();
    }, []);

    useEffect(() => {
      console.log("Selected wallet:", selectedWallet);
    }, [selectedWallet]);

    useEffect(() => {
      console.log("Selected blockchain:", selectedChainId);
    }, [selectedChainId]);

    useEffect(() => {
      console.log("Selected token:", selectedToken);
    }, [selectedToken]);

  return (
    <div className="flex flex-col items-center p-8">
      {/* WalletSlider component */}
      <WalletSlider
        sliderName="Select Wallet Provider"
        value={selectedWallet}
        returns={(val: string) => setSelectedWallet(val)}
      />
      {/* BNetworkSlider component */}
      <BNetworkSlider
        sliderName="Select Network"
        value={selectedChainId!}
        outChainId={(val: number) => setSelectedChainId(val)}
        outToken={(val: string) => setSelectedToken(val)}
      />


      {/* Selected Wallet Key */}
      <div className="mt-6 text-center text-lg font-medium text-gray-800">
        Selected wallet key: {selectedWallet}
      </div>
      {/* Selected Blockchain Key */}
      <div className="mt-6 text-center text-lg font-medium text-gray-800">
        Selected blockchain key: {selectedChainId}
      </div>
            {/* Selected Blockchain Key */}
      <div className="mt-6 text-center text-lg font-medium text-gray-800">
        Selected Network Token: {selectedToken}
      </div>
      <div className="mt-8 w-full max-w-md">
  <label className="block mb-2 text-sm font-medium text-gray-700">
    Wallet Address (optional — auto-filled when connecting)
  </label>

  <input
    value={walletAddress}
    onChange={(e) => setWalletAddress(e.target.value)}
    placeholder="0x..."
    className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
  />
</div>
<button
  disabled={isRegistering || !selectedWallet || !selectedChainId || !selectedToken}
  onClick={startWizard}
  className="mt-8 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium
             hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isRegistering ? "Registering Wallet..." : "Register New Wallet"}
</button>
{error && (
  <div className="text-sm text-red-600">
    {error}
  </div>
)}



      {modalOpen && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-6">
          <h2 className="text-xl font-semibold">
            Register New Wallet
          </h2>

          <StepRow
            label="Connect Wallet"
            active={step === "connecting"}
            done={["network", "token", "saving", "done"].includes(step)}
          />

          <StepRow
            label="Set Network"
            active={step === "network"}
            done={["token", "saving", "done"].includes(step)}
          />

          <StepRow
            label="Add Token"
            active={step === "token"}
            done={["saving", "done"].includes(step)}
          />

          <StepRow
            label="Save Wallet"
            active={step === "saving"}
            done={step === "done"}
          />

          <div className="text-sm text-gray-600 min-h-[40px]">
            {status}
          </div>

          {modalError && (
            <div className="text-sm text-red-600">
              {modalError.split("\n").map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              disabled={step !== "idle" && step !== "done"}
              onClick={startWizard}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            >
              {step === "done" ? "Close" : "Start"}
            </button>
          </div>
        </div>
      </div>
    )}  
    </div>
  );
}


