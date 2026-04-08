// app/api/auth/callback/google/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { User, UserIdentity } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorCode = requestUrl.searchParams.get('error_code');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Google OAuth error:', { error, errorCode, errorDescription });

    if (errorCode === 'identity_already_exists') {
      return NextResponse.redirect(new URL('/dashboard?message=google_already_linked', requestUrl.origin));
    }

    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent(error)}&error_code=${encodeURIComponent(errorCode || '')}&error_description=${encodeURIComponent(errorDescription || error)}`,
        requestUrl.origin
      )
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code_received', requestUrl.origin));
  }

  const supabase = await createClient();

  try {
    // Exchange the code for a Supabase session
    const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;

    const session = exchangeData.session;
    if (!session) throw new Error('No session returned');

    // ←←← HERE IS THE GOOGLE ACCESS TOKEN ←←←
    const googleAccessToken = session.provider_token;
    const googleRefreshToken = session.provider_refresh_token; // may be null

    console.log('✅ Google Access Token received:', googleAccessToken ? 'Yes (present)' : 'No');

    if (googleAccessToken) {
      console.log('Google Access Token (first 30 chars):', googleAccessToken.substring(0, 30) + '...');

      // Optional: Save it to your database for later use
      // await saveGoogleTokenToDatabase(session.user.id, googleAccessToken, googleRefreshToken);
    } else {
      console.warn('⚠️ No provider_token received. Check if you added the youtube.readonly scope correctly.');
    }

    // 3. Update email if missing (optional but useful)
    const { data: { user } } = await supabase.auth.getUser();

    if (user && !user.email) {
      const googleIdentity = user.identities?.find(
        (identity): identity is UserIdentity => identity.provider === 'google'
      );

      if (googleIdentity?.identity_data?.email) {
        const { error: updateError } = await supabase.auth.updateUser({
          email: googleIdentity.identity_data.email as string,
        });

        if (updateError && updateError.code !== 'email_exists') {
          console.error('Failed to update email:', updateError);
        }
      }
    }

    await supabase.auth.refreshSession();
  } catch (err: unknown) {
    console.error('Error processing Google callback:', err);
    return NextResponse.redirect(new URL('/?error=link_failed', requestUrl.origin));
  }

  // Success → redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}