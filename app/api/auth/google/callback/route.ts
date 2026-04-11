// app/api/auth/google/callback/route.ts
import { supabaseServer } from '@/lib/supabase/clients/supabaseServer';
import { supabaseAdmin } from '@/lib/supabase/clients/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { consoleLog } from '@/lib/utils';

async function handleGoogleCode(code: string, userId: string) {
  consoleLog('Handle Google Code')
  // Initialize Google OAuth2 client
  consoleLog('redirect_uri:', process.env.GOOGLE_REDIRECT_URI)
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET, // NOT API KEY
  'postmessage' // if it were a GET request should use: process.env.GOOGLE_REDIRECT_URI
);

  // Exchange code for tokens
  const { tokens } = await oAuth2Client.getToken(code);
  consoleLog('This is the token', tokens)

  // Decode ID token to get Google email
  if (!tokens.id_token) throw new Error('No ID token received from Google');
  const ticket = await oAuth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new Error('Google ID token missing email');
  const decodedEmail = payload.email;

  const expiresAt = tokens.expiry_date
    ? new Date(tokens.expiry_date).toISOString()
    : new Date(Date.now() + 3600 * 1000).toISOString();

  // Upsert into Supabase
  const supabase =  supabaseAdmin('gotit');
  const { error } = await supabase
    .from('google_linked_accounts')
    .upsert({
      user_id: userId,
      google_email: decodedEmail,
      access_token: tokens.access_token ?? '',
      refresh_token: tokens.refresh_token ?? null,
      expires_at: expiresAt,
      is_main_linked: false,
    });

  if (error) throw new Error(error.message);

  return { success: true };
}

// --- POST handler for popup flow ---
export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  consoleLog('This is the router User', user)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code } = await req.json();
    consoleLog('This is the code', code)
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

  try {
    const result = await handleGoogleCode(code, user.id);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const  errMessage = (err instanceof Error) ? err.message : 'Unknown error';
    consoleLog('Google OAuth callback error:', errMessage); // log on server too
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

// --- GET handler for redirect flow ---
export async function GET(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Missing code in query' }, { status: 400 });

  try {
    const result = await handleGoogleCode(code, user.id);
    // Redirect user to dashboard or home after success
    return NextResponse.redirect(new URL('/', req.url));
  } catch (err: unknown) {
    const  errMessage = (err instanceof Error) ? err.message : 'Unknown error';
    consoleLog('Google OAuth callback error:', errMessage); // log on server too
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}