'use client'

import { useEffect, useState } from 'react'
import type { AppKitTronAdapter, AppKitTronAccount } from '../../WalletConnectTronAdapter'

interface Props {
  adapter: AppKitTronAdapter
}

export function TronWalletTable({ adapter }: Props) {
  const [account, setAccount] = useState<AppKitTronAccount | null>(null)
  const [network, setNetwork] = useState<string>('')
  const [message, setMessage] = useState('')
  const [signedMessage, setSignedMessage] = useState<string | null>(null)
  const [txTo, setTxTo] = useState('')
  const [txAmount, setTxAmount] = useState<number>(0)
  const [txResult, setTxResult] = useState<string | null>(null)
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenAmount, setTokenAmount] = useState<number>(0)
  const [tokenTxResult, setTokenTxResult] = useState<string | null>(null)

  // On mount, get account info
  useEffect(() => {
    const init = async () => {
      const accounts = await adapter.getAccounts()
      setAccount(accounts[0] ?? null)
      setNetwork(
        accounts[0]?.chainId ?? 'unknown'
      )
    }
    init()
  }, [adapter])

  // Sign message handler
  const handleSignMessage = async () => {
    if (!message) return
    const sig = await adapter.tron_signMessage(message)
    setSignedMessage(sig)
  }

  // Send TRX handler
  const handleSendTransaction = async () => {
    if (!txTo || !txAmount) return
    const txid = await adapter.sendTransaction({ to: txTo, value: txAmount * 1_000_000 }) // Convert TRX to SUN
    setTxResult(txid)
  }

  // Send TRC-20 handler
  const handleSendTRC20 = async () => {
    if (!tokenSymbol || !txTo || !tokenAmount) return
    const txid = await adapter.sendTRC20Transaction(tokenSymbol, txTo, tokenAmount)
    setTokenTxResult(txid)
  }

  if (!account) return <p>No connected Tron account</p>

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">Tron Wallet</h2>
      <table className="w-full border border-border text-sm mb-4">
        <tbody>
          <tr className="bg-muted/50">
            <td className="border px-3 py-2 font-semibold">Property</td>
            <td className="border px-3 py-2 font-semibold">Value</td>
          </tr>
          <tr>
            <td className="border px-3 py-2">Address</td>
            <td className="border px-3 py-2 break-all font-mono">{account.address}</td>
          </tr>
          <tr>
            <td className="border px-3 py-2">Chain</td>
            <td className="border px-3 py-2">{network}</td>
          </tr>
        </tbody>
      </table>

      {/* Sign Message */}
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Sign Message</h3>
        <input
          className="border px-2 py-1 mr-2"
          type="text"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={handleSignMessage}
          className="px-4 py-1 bg-blue-500 text-white rounded"
        >
          Sign
        </button>
        {signedMessage && (
          <p className="mt-2 break-all font-mono">Signature: {signedMessage}</p>
        )}
      </div>

      {/* Send TRX */}
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Send TRX</h3>
        <input
          type="text"
          placeholder="To address"
          value={txTo}
          onChange={(e) => setTxTo(e.target.value)}
          className="border px-2 py-1 mr-2"
        />
        <input
          type="number"
          placeholder="Amount"
          value={txAmount}
          onChange={(e) => setTxAmount(Number(e.target.value))}
          className="border px-2 py-1 mr-2"
        />
        <button
          onClick={handleSendTransaction}
          className="px-4 py-1 bg-green-500 text-white rounded"
        >
          Send
        </button>
        {txResult && <p className="mt-2 font-mono">TX ID: {txResult}</p>}
      </div>

      {/* Send TRC-20 */}
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Send TRC-20 Token</h3>
        <input
          type="text"
          placeholder="Token symbol"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          className="border px-2 py-1 mr-2"
        />
        <input
          type="text"
          placeholder="To address"
          value={txTo}
          onChange={(e) => setTxTo(e.target.value)}
          className="border px-2 py-1 mr-2"
        />
        <input
          type="number"
          placeholder="Amount"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(Number(e.target.value))}
          className="border px-2 py-1 mr-2"
        />
        <button
          onClick={handleSendTRC20}
          className="px-4 py-1 bg-purple-500 text-white rounded"
        >
          Send
        </button>
        {tokenTxResult && <p className="mt-2 font-mono">TX ID: {tokenTxResult}</p>}
      </div>
    </div>
  )
}