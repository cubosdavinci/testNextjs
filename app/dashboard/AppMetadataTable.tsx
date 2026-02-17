'use client'

import type { User } from '@supabase/supabase-js'

interface Props {
  user: User | null
}

export function AppMetadataTable({ user }: Props) {
  return (
    <table className="mt-6 w-full border border-border text-sm">
      <tbody>
        <tr className="bg-muted/50">
          <td className="border px-3 py-2 font-semibold" colSpan={2}>App Metadata</td>
        </tr>
        <tr><td className="border px-3 py-2">app_metadata.provider</td><td className="border px-3 py-2">{user?.app_metadata?.provider}</td></tr>
        <tr><td className="border px-3 py-2">app_metadata.providers</td><td className="border px-3 py-2">{user?.app_metadata?.providers?.join(", ")}</td></tr>
      </tbody>
    </table>
  )
}
