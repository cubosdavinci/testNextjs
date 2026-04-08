import { supabaseServer } from '@/lib/supabase/clients/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';
import type { UserIdentity } from '@supabase/supabase-js';
import { browserConsoleLog, consoleLog } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
/*
  browserConsoleLog('Code', code)
  browserConsoleLog('Error', error) 
  browserConsoleLog('Error Description', errorDescription) */
  consoleLog('Code', code)
  consoleLog('Error', error)
  consoleLog('Error Description', errorDescription)

  if (error) {
    console.error('Google OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code_received', requestUrl.origin));
  }

  const supabase = await supabaseServer(); // ← Now async + modern client

  try {
    // 1. Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;

    // 2. Get user
    const { data: { user } } = await supabase.auth.getUser();

    // 3. Update email from Google identity if missing
    if (user && !user.email) {
      const googleIdentity = user.identities?.find(
        (identity): identity is UserIdentity => identity.provider === 'google'
      );

      if (googleIdentity?.identity_data?.email) {
        const googleEmail = googleIdentity.identity_data.email as string;

        const { error: updateError } = await supabase.auth.updateUser({
          email: googleEmail,
        });

        if (updateError) {
          console.error('Failed to update email:', updateError);
        } else {
          console.log('✅ Email updated successfully from Google:', googleEmail);
        }
      }
    }

    // Refresh session so client-side hooks pick up changes
    await supabase.auth.refreshSession();
  } catch (err: unknown) {
    console.error('Error processing Google callback:', err);
    return NextResponse.redirect(
      new URL('/?error=link_failed', requestUrl.origin)
    );
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}