import { supabaseServer } from '@/lib/supabase/clients/supabaseServer';
import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

export async function POST(req: Request) {
  const supabase = await supabaseServer();

  // Get the currently logged-in Supabase user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Extract the Google OAuth2 code from request
  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  // Initialize Google OAuth2 client
  const oAuth2Client = new OAuth2Client(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`
  );

  // Exchange code for tokens
  const { tokens } = await oAuth2Client.getToken(code);

  // Decode the ID token to get the user's email
  let decodedEmail: string = '';
  if (tokens.id_token) {
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return NextResponse.json({ error: 'Google ID token missing email' }, { status: 400 });
    }
    decodedEmail = payload.email; // string type guaranteed
  } else {
    return NextResponse.json({ error: 'No ID token received from Google' }, { status: 400 });
  }

  const expiresAt = tokens.expiry_date
  ? new Date(tokens.expiry_date).toISOString()        // use Google’s expiry_date directly
  : new Date(Date.now() + 3600 * 1000).toISOString(); 

  // Insert or update the user's Google credentials in Supabase
  const { error } = await supabase
    .from('user_google_credentials')
    .upsert({
      user_id: user.id,                           // required string
      google_email: decodedEmail,                 // required string NOT NULL
      access_token: tokens.access_token ?? '',    // required string
      refresh_token: tokens.refresh_token ?? null, // optional string | null
      expires_at: expiresAt,
      is_main_linked: false,                      // optional boolean, default false
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}