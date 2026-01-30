// ewtewt
"use client";

import { useState, useEffect } from "react";
import { preloadIcons } from "@/lib/web3/preloadIcons";
import WalletSlider from "components/radix-ui-slider/WalletSlider"; // import the WalletSlider
import BNetworkSlider from "components/radix-ui-slider/BNetworkSlider"; // import the BNetworkSlider
import { getWalletKeys, getWalletNames, getBNetworkBWIcons, getBNetworkIcons, getBNetworkKeys, getBNetworkNames, getWalletBWIcons, getWalletIcons, SUPPORTED_BNETWORKS, getBNetworkChainIds } from "@/lib/web3/wallets";

// Helper functions for generating dynamic keys, names, icons, and bwIcons
// lib/web3/wallets/types/SupportedBNetworks.ts

export default function Page() {
  const [selectedWallet, setSelectedWallet] = useState("io.metamask");
  const [selectedBNetwork, setSelectedBNetwork] = useState("arbitrum");
  const [selectedChainId, setSelectedChainId] = useState<number>();
  const [selectedToken, setSelectedToken] = useState<string>();
  

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
        value={selectedBNetwork}
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
      
    </div>
  );
}
