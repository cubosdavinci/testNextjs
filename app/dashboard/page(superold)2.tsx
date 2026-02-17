'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthModal } from '@/components/hooks/useAuthModal'

import { UserInfoTable } from './UserInfoTable'
import { AppMetadataTable } from './AppMetadataTable'
import { Web3ClaimsTable } from './Web3ClaimsTable'
import { SystemTable } from './SystemTable'
import { JwtSessionTable } from './tables/JwtSessionTable'
import { AppKitAccountTable } from './tables/AppKitAccountTable'

export default function DashboardPage() {
  const router = useRouter()

  // Use the new hook
  const { isSignedIn, loading, user, signIn, logout } = useAuthModal({
    redirect: '/dashboard',
  })

  // Trigger Web3 login if needed
  useEffect(() => {
    if (!loading && !isSignedIn) {
      signIn()
    }
  }, [loading, isSignedIn, signIn])

  // If still loading or no user yet, show loader
  if (loading || !isSignedIn || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading dashboard…</p>
      </div>
    )
  }

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
          onClick={logout}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Tables */}
      <JwtSessionTable />
      <AppKitAccountTable />

      {/* Raw user JSON */}
      <details className="mt-6 rounded border border-border bg-muted">
        <summary className="cursor-pointer select-none px-4 py-2 font-medium">
          Raw User JSON
        </summary>
        <pre className="overflow-auto px-4 pb-4 pt-2 text-sm">
          {JSON.stringify(user, null, 2)}
        </pre>
      </details>

      <UserInfoTable user={user} />
      <AppMetadataTable user={user} />
      <Web3ClaimsTable user={user} />
      <SystemTable user={user} />
    </main>
  )
}