"use client";

import { useConnection, useConnect, useDisconnect } from 'wagmi';

export default function Home() {
  const connection = useConnection(); // ← changed here
  const { address, isConnected, connector } = connection; // or destructure directly

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Find your MetaMask connector (id might be 'metaMaskSDK' or similar)
  const metaMaskConnector = connectors.find(c => c.id.includes('metaMask') || c.name.includes('MetaMask'));

  return (
    <div>
      {!isConnected ? (
        <button 
          onClick={() => metaMaskConnector && connect({ connector: metaMaskConnector })}
        >
          Connect MetaMask (Mobile OK!)
        </button>
      ) : (
        <div>
          Connected: {address}
          <p>Via: {connector?.name}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      )}
    </div>
  );
}