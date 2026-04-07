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

  // ─── Handle OAuth Errors from Supabase / Google ─────────────────────
  if (error) {
    console.error('Google OAuth error:', { error, errorCode, errorDescription });

    // Special case: Identity is already linked
    if (errorCode === 'identity_already_exists') {
      return NextResponse.redirect(
        new URL(
          `/?error=identity_already_exists&error_code=${encodeURIComponent(errorCode)}&error_description=${encodeURIComponent(errorDescription || 'Identity is already linked')}`,
          requestUrl.origin
        )
      );
    }

    // General error case
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent(error)}&error_code=${encodeURIComponent(errorCode || '')}&error_description=${encodeURIComponent(errorDescription || error)}`,
        requestUrl.origin
      )
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=no_code_received', requestUrl.origin)
    );
  }

  const supabase = await createClient();

  try {
    // 1. Exchange code → session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;

    // 2. Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user returned after exchange');

    // 3. Update email only if missing
    if (!user.email) {
      const googleIdentity = user.identities?.find(
        (identity): identity is UserIdentity => identity.provider === 'google'
      );

      if (googleIdentity?.identity_data?.email) {
        const googleEmail = googleIdentity.identity_data.email as string;

        const { error: updateError } = await supabase.auth.updateUser({ email: googleEmail });

        if (updateError) {
          if (updateError.code === 'email_exists') {
            console.log('Email already exists – skipping update (normal behavior)');
          } else {
            console.error('Failed to update email:', updateError);
          }
        } else {
          console.log('✅ Email updated from Google:', googleEmail);
        }
      }
    }

    await supabase.auth.refreshSession();
  } catch (err: unknown) {
    console.error('Error in Google callback:', err);
    return NextResponse.redirect(
      new URL('/?error=link_failed', requestUrl.origin)
    );
  }

  // Success → go to dashboard
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}