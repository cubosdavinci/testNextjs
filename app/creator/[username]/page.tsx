'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createAnonClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  website: string | null
  updated_at: string | null
}

const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default function CreatorProfile() {
  const params = useParams()
  const usernameParam = params?.username

  const supabase = createAnonClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usernameParam) return

    async function fetchProfile() {
      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq(uuidV4Regex.test(usernameParam as string) ? 'id' : 'username', usernameParam)
        .maybeSingle()

      setProfile(data ?? null)
      setLoading(false)
    }

    fetchProfile()
  }, [usernameParam, supabase])

  if (loading) {
    return <div className="p-6 text-center">Loading profile...</div>
  }

  if (!profile) {
    return <div className="p-6 text-center">Profile not found.</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <img
          src={profile.avatar_url || 'https://via.placeholder.com/100?text=Avatar'}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{profile.full_name || 'Unnamed Creator'}</h1>
          <p className="text-gray-500">@{profile.username || profile.id}</p>
          {profile.website && (
            <a href={profile.website} target="_blank" className="text-blue-500 underline">
              {profile.website}
            </a>
          )}
        </div>
      </div>
      <div className="mt-6 text-sm text-gray-400">
        Last updated: {profile.updated_at ? new Date(profile.updated_at).toLocaleString() : 'N/A'}
      </div>
    </div>
  )
}