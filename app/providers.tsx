'use client'

import { useEffect, useState } from 'react'
import { createAnonClient } from '@/lib/supabase/client'

// ✅ Create the client ONCE (module scope)
export const supabase = createAnonClient()

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // 1️⃣ Initial session check (runs once)
    supabase.auth.getSession().finally(() => {
      setReady(true)
    })

    // 2️⃣ Subscribe to auth changes
    const { data } = supabase.auth.onAuthStateChange(() => {
      // no-op here; pages/hooks can react if needed
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  // Prevent hydration mismatch
  if (!ready) return null

  return <>{children}</>
}
