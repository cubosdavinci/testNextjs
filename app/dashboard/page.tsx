'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAnonClient } from '@/lib/supabase/client'
import { appKit } from '@/app/providers' // Use appKit directly
import type { User } from '@supabase/supabase-js'

import { UserInfoTable } from './UserInfoTable'
import { AppMetadataTable } from './AppMetadataTable'
import { Web3ClaimsTable } from './Web3ClaimsTable'
import { SystemTable } from './SystemTable'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createAnonClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user on mount
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.replace('/login')
          return
        }

        setUser(user)
      } catch (err) {
        console.error('Failed to get user:', err)
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase])

  // Logout handler
  const handleLogout = async () => {
    try {
      // Disconnect AppKit wallet
      appKit.disconnect()

      // Sign out Supabase session
      const { error } = await supabase.auth.signOut()
      if (error) console.error('Supabase logout failed:', error.message)
    } finally {
      router.replace('/') // Redirect to home/login
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading dashboard…</p>
      </div>
    )
  }

  if (!user) return null // safety fallback

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4 text-muted-foreground">Welcome back, {user.email}</p>

      {/* Action buttons */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => router.push('/dashboard/slider')}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Go to Slider
        </button>

        <button
          onClick={handleLogout}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Raw user JSON */}
      <details className="mt-6 rounded border border-border bg-muted">
        <summary className="cursor-pointer select-none px-4 py-2 font-medium">
          Raw User JSON
        </summary>
        <pre className="overflow-auto px-4 pb-4 pt-2 text-sm">
          {JSON.stringify(user, null, 2)}
        </pre>
      </details>

      {/* Tables */}
      <UserInfoTable user={user} />
      <AppMetadataTable user={user} />
      <Web3ClaimsTable user={user} />
      <SystemTable user={user} />
    </main>
  )
}
