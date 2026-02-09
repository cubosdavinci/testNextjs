'use client'

import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
}

export function UserInfoTable({ user }: Props) {
  return (
    <table className="mt-6 w-full border border-border text-sm">
      <thead>
        <tr className="bg-muted">
          <th className="border px-3 py-2 text-left">Field</th>
          <th className="border px-3 py-2 text-left">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr><td className="border px-3 py-2">id</td><td className="border px-3 py-2">{user?.id}</td></tr>
        <tr><td className="border px-3 py-2">aud</td><td className="border px-3 py-2">{user?.aud}</td></tr>
        <tr><td className="border px-3 py-2">role</td><td className="border px-3 py-2">{user?.role}</td></tr>
        <tr><td className="border px-3 py-2">email</td><td className="border px-3 py-2">{user?.email || "—"}</td></tr>
        <tr><td className="border px-3 py-2">phone</td><td className="border px-3 py-2">{user?.phone || "—"}</td></tr>
        <tr><td className="border px-3 py-2">last_sign_in_at</td><td className="border px-3 py-2">{user?.last_sign_in_at}</td></tr>
      </tbody>
    </table>
  )
}
