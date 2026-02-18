"use client";
import {JSX} from "react";
import ErrorAlert from "@/components/banners/ErrorAlert";
import { AppKitButton, modal, useAppKitState } from "@reown/appkit/react";
import { useAppKit } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { usePublicClient, useConnection, useDisconnect } from "wagmi";
import { appkitTheme } from "@/theme/theme"
//import { useBrowserTheme } from "@/theme/useBrowserTheme"

import { useAppKitTheme } from '@reown/appkit/react'
import { useSession } from "@/components/auth/useSession";
import { Spinner } from "@/components/auth/spinner";


export default function MyComponent() {
  const {session, user, sessionLoading, sessionError }= useSession()
  const { initialized, loading, open,  selectedNetworkId, activeChain } = useAppKitState();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const { address } = useConnection(); // returns the currently connected wallet address  
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);

  





    // const browserTheme = useBrowserTheme()

  // Choose the correct classes
 // const themeClassName = appkitTheme[browserTheme]

  // Effect 1: Reset blockNumber when wallet disconnects
  useEffect(() => {
    if (!publicClient || !address) {
      setBlockNumber(null);
      return;
    }
  }, [publicClient, address]);

  
  // Effect 2: Fetch block number when wallet connects
  useEffect(() => {
    if (!publicClient || !address) return;

    let cancelled = false;

    async function loadBlockNumber() {
      try {
        const block = await publicClient!.getBlockNumber();
        if (!cancelled) setBlockNumber(block);
      } catch {
        if (!cancelled) {
          setBlockNumber(null);
          setError("Failed to load block number");
        }
      }
    }

    loadBlockNumber();


    return () => {
      cancelled = true; // cleanup if component unmounts or address changes
    };
  }, [publicClient, address]);

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (user) return
 

      // Function to remove Reown branding
  const removeReownBranding = () => {
    const interval = setInterval(() => {
      const el = document.querySelector('[data-testid="ux-branding-reown"]')
      if (el) {
        el.remove()
        clearInterval(interval) // stop checking after removal
      }
    }, 50) // check every 50ms until element exists
  }

  // Handle click
  const handleClick = () => {
    modal!.open()           // opens the AppKit modal
    removeReownBranding()  // remove branding after it appears
  }
  
  // Single JSX return
  let content: JSX.Element;

  if (!publicClient) {
    content = <ErrorAlert message="Public Client Not Available" />;
  } else if (!address) {
    content = <AppKitButton onClick={handleClick}/>;
  } else if (error) {
    content = <ErrorAlert message={error} />;
  } else if (blockNumber === null) {
    content = <div>Loading block number...</div>;
  } else {
    
    content = <div><AppKitButton onClick={handleClick}/>;Current block: {blockNumber.toString()}</div>;
  }

  return <>{content}</>;
}