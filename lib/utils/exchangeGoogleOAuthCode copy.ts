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

export async function exchangeGoogleOAuthCode(code: string): Promise<GoogleOAuthResponse> {
  const tokenUrl = 'https://oauth2.googleapis.com/token'

  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    grant_type: 'authorization_code',
  })

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Google OAuth token exchange failed: ${errorText}`)
  }

  const data: GoogleOAuthResponse = await res.json()
  return data
}
