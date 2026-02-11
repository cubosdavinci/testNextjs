'use client'

import { useAppKitAccount } from '@reown/appkit/react'
import type { UseAppKitAccountReturn } from '@reown/appkit/react'

export function AppKitAccountTable() {
  const account: UseAppKitAccountReturn = useAppKitAccount()

  return (
    <details className="mt-6 rounded border border-border bg-muted">
      <summary className="cursor-pointer select-none px-4 py-2 font-medium">
        AppKit Account (Wallet State)
      </summary>

      <div className="px-4 pb-4">
        <table className="mt-2 w-full border border-border text-sm">
          <tbody>
            {/* Connection status */}
            <tr className="bg-muted/50">
              <td className="border px-3 py-2 font-semibold" colSpan={2}>
                Connection
              </td>
            </tr>

            <tr>
              <td className="border px-3 py-2">isConnected</td>
              <td className="border px-3 py-2">
                {String(account.isConnected)}
              </td>
            </tr>

            <tr>
              <td className="border px-3 py-2">status</td>
              <td className="border px-3 py-2">{account.status}</td>
            </tr>

            {/* Addresses */}
            <tr className="bg-muted/50">
              <td className="border px-3 py-2 font-semibold" colSpan={2}>
                Addresses
              </td>
            </tr>

            <tr>
              <td className="border px-3 py-2">address</td>
              <td className="border px-3 py-2 font-mono break-all">
                {account.address ?? '—'}
              </td>
            </tr>

            <tr>
              <td className="border px-3 py-2">caipAddress</td>
              <td className="border px-3 py-2 font-mono break-all">
                {account.caipAddress ?? '—'}
              </td>
            </tr>

            {/* All accounts */}
            <tr className="bg-muted/50">
              <td className="border px-3 py-2 font-semibold" colSpan={2}>
                All Accounts
              </td>
            </tr>

            <tr>
              <td className="border px-3 py-2">allAccounts</td>
              <td className="border px-3 py-2 font-mono break-all">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(account.allAccounts, null, 2)}
                </pre>
              </td>
            </tr>

            {/* Embedded wallet info */}
            <tr className="bg-muted/50">
              <td className="border px-3 py-2 font-semibold" colSpan={2}>
                Embedded Wallet Info
              </td>
            </tr>

            {account.embeddedWalletInfo ? (
              <>
                <tr>
                  <td className="border px-3 py-2">user</td>
                  <td className="border px-3 py-2 font-mono break-all">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(
                        account.embeddedWalletInfo.user,
                        null,
                        2
                      )}
                    </pre>
                  </td>
                </tr>

                <tr>
                  <td className="border px-3 py-2">authProvider</td>
                  <td className="border px-3 py-2">
                    {account.embeddedWalletInfo.authProvider}
                  </td>
                </tr>

                <tr>
                  <td className="border px-3 py-2">accountType</td>
                  <td className="border px-3 py-2">
                    {account.embeddedWalletInfo.accountType ?? '—'}
                  </td>
                </tr>

                <tr>
                  <td className="border px-3 py-2">
                    isSmartAccountDeployed
                  </td>
                  <td className="border px-3 py-2">
                    {String(
                      account.embeddedWalletInfo.isSmartAccountDeployed
                    )}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td className="border px-3 py-2" colSpan={2}>
                  No embedded wallet info
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </details>
  )
}