import { createAnonClient } from "./client"

export async function getClientSession() {
  const supabase = createAnonClient()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error(error)
    return null
  }

  return session
}
