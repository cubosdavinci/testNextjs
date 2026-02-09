'use client'

import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
}

export function Web3ClaimsTable({ user }: Props) {
  return (
    <table className="mt-6 w-full border border-border text-sm">
      <tbody>
        <tr className="bg-muted/50">
          <td className="border px-3 py-2 font-semibold" colSpan={2}>Web3 Claims</td>
        </tr>
        <tr><td className="border px-3 py-2">address</td><td className="border px-3 py-2">{user?.user_metadata?.custom_claims?.address}</td></tr>
        <tr><td className="border px-3 py-2">chain</td><td className="border px-3 py-2">{user?.user_metadata?.custom_claims?.chain}</td></tr>
        <tr><td className="border px-3 py-2">network</td><td className="border px-3 py-2">{user?.user_metadata?.custom_claims?.network}</td></tr>
        <tr><td className="border px-3 py-2">domain</td><td className="border px-3 py-2">{user?.user_metadata?.custom_claims?.domain}</td></tr>
      </tbody>
    </table>
  )
}
