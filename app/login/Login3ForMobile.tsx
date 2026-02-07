"use client";

import { useConnect, useConnectors, useConnection, useDisconnect } from 'wagmi';

export default function Home() {
  const { address, isConnected, connector } = useConnection(); // still best for status
  const { mutate: connect } = useConnect(); // mutate is the connect action
  const connectors = useConnectors(); // ← replacement for old connectors list
  const { disconnect } = useDisconnect();

  // Your MetaMask connector (from earlier config with MetaMaskSDK)
  const metaMaskConnector = connectors.find(c => 
    c.id.includes('metaMask') || c.name?.includes('MetaMask')
  );

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