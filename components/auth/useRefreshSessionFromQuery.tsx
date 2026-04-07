'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from '@/components/auth/useSession'

export function useRefreshSessionFromQuery() {
  const searchParams = useSearchParams()
  const { refreshSession } = useSession()

  useEffect(() => {
    if (!searchParams.has('refresh_session')) return

    const run = async () => {
      await refreshSession()

      // Clean URL to prevent infinite loops
      const url = new URL(window.location.href)
      url.searchParams.delete('refresh_session')
      window.history.replaceState({}, '', url.toString())
    }

    run()
  }, [searchParams, refreshSession])
}