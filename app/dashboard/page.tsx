'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthModal } from '@/components/hooks/useAuthModal'
import ErrorAlert from '@/components/banners/ErrorAlert'

import { UserInfoTable } from './UserInfoTable'
import { AppMetadataTable } from './AppMetadataTable'
import { Web3ClaimsTable } from './Web3ClaimsTable'
import { SystemTable } from './SystemTable'
import { JwtSessionTable } from './tables/JwtSessionTable'

export default function DashboardPage() {
  const router = useRouter()

  const { isSignedIn, loading, user, signIn, logout, isError, error } = useAuthModal({
    redirect: '/dashboard',
  })

  // Trigger Web3 login if needed
  useEffect(() => {
    if (!loading && !isSignedIn && !isError) {
      signIn()
    }
  }, [loading, isSignedIn, signIn, isError])

  // If still loading and no error, show loader
  if (loading && !isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading dashboard…</p>
      </div>
    )
  }

  // If there is an error, show the error alert + logout/retry
  if (isError || (!loading && !isSignedIn)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 px-4">
        <ErrorAlert message={error?.message || "You are not signed in"} />
        <button
          onClick={logout}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Logout / Retry
        </button>
      </div>
    )
  }

  // Dashboard content (user may still be null but signed in, safe fallback)
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome back, {user?.email || "User"}
      </p>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
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

      {/* Raw user JSON */}
      <details className="rounded border border-border bg-muted">
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