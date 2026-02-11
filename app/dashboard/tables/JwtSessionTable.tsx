'use client'

import { useEffect, useState } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'

interface JwtSessionTableProps {
  supabase: SupabaseClient
}

function decodeJwt(token?: string) {
  if (!token) return null
  try {
    const base64 = token
      .split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export function JwtSessionTable({ supabase }: JwtSessionTableProps) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const decodedJwt = decodeJwt(session?.access_token)

  if (!session) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        No active session
      </p>
    )
  }

  return (
    <details className="mt-6 rounded border border-border bg-muted">
      <summary className="cursor-pointer select-none px-4 py-2 font-medium">
        Supabase JWT Session
      </summary>

      <div className="px-4 pb-4">
        <table className="mt-2 w-full border border-border text-sm">
          <tbody>
            <tr>
              <td className="border px-3 py-2">user.id</td>
              <td className="border px-3 py-2">{session.user.id}</td>
            </tr>

            <tr>
              <td className="border px-3 py-2">user.role</td>
              <td className="border px-3 py-2">{session.user.role}</td>
            </tr>

            <tr>
              <td className="border px-3 py-2">provider</td>
              <td className="border px-3 py-2">
                {session.user.app_metadata?.provider}
              </td>
            </tr>

            <tr>
              <td className="border px-3 py-2">expires_at</td>
              <td className="border px-3 py-2">
                {new Date(session.expires_at! * 1000).toLocaleString()}
              </td>
            </tr>

            <tr>
              <td className="border px-3 py-2">access_token</td>
              <td className="border px-3 py-2 break-all font-mono">
                {session.access_token}
              </td>
            </tr>

            <tr>
              <td className="border px-3 py-2">refresh_token</td>
              <td className="border px-3 py-2 break-all font-mono">
                {session.refresh_token}
              </td>
            </tr>

            <tr className="bg-muted/50">
              <td className="border px-3 py-2 font-semibold" colSpan={2}>
                Decoded JWT Payload
              </td>
            </tr>

            {decodedJwt ? (
              Object.entries(decodedJwt).map(([key, value]) => (
                <tr key={key}>
                  <td className="border px-3 py-2">{key}</td>
                  <td className="border px-3 py-2 break-all font-mono">
                    {typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border px-3 py-2" colSpan={2}>
                  Unable to decode JWT
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </details>
  )
}