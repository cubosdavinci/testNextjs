'use client'

import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
}

export function SystemTable({ user }: Props) {
  return (
    <table className="mt-6 w-full border border-border text-sm">
      <tbody>
        <tr className="bg-muted/50">
          <td className="border px-3 py-2 font-semibold" colSpan={2}>System</td>
        </tr>
        <tr><td className="border px-3 py-2">created_at</td><td className="border px-3 py-2">{user?.created_at}</td></tr>
        <tr><td className="border px-3 py-2">updated_at</td><td className="border px-3 py-2">{user?.updated_at}</td></tr>
        <tr><td className="border px-3 py-2">is_anonymous</td><td className="border px-3 py-2">{String(user?.is_anonymous)}</td></tr>
      </tbody>
    </table>
  )
}
