// utils/googleOAuth.ts
export interface GoogleOAuthResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope: string
  token_type: string
  id_token?: string
  [key: string]: string | number | undefined
}

export interface ExchangeResult {
  data: GoogleOAuthResponse | null
  error: Error | null
}

export async function exchangeGoogleOAuthCode(code: string): Promise<ExchangeResult> {
  const tokenUrl = 'https://oauth2.googleapis.com/token'

  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    grant_type: 'authorization_code',
  })

  try {
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!res.ok) {
      const text = await res.text()
      return { data: null, error: new Error(`Google OAuth token exchange failed: ${text}`) }
    }

    const data: GoogleOAuthResponse = await res.json()
    return { data, error: null }
  } catch (err: unknown) {
  // Narrow the unknown to Error if possible
      if (err instanceof Error) {
        return { data: null, error: err }
      } else {
        return { data: null, error: new Error(String(err)) }
      }
    }
}