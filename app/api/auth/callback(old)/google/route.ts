// app/api/auth/callback/google/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { UserIdentity } from '@supabase/supabase-js';
import { exchangeGoogleOAuthCode} from "@/lib/utils/exchangeGoogleOAuthCode"
import { consoleLog } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const baseUrl =
  process.env.NGROK_URL && process.env.NGROK_URL.length > 0
    ? process.env.NGROK_URL
    : requestUrl.origin;


  consoleLog('------------------------- Google Callback API Route -------------')
  consoleLog('Request Url (routes)', request.url)
  consoleLog('Request Origin (routes)', requestUrl.origin)
  consoleLog('Request Params: ', requestUrl) 
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorCode = requestUrl.searchParams.get('error_code');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    consoleLog('Google OAuth error:', { error, errorCode, errorDescription });

    if (errorCode === 'identity_already_exists') {
      // Construct full redirect URL with template litera
      const redirectUrl = `${baseUrl}/dashboard?refresh_session=true`
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent(error)}&error_code=${encodeURIComponent(errorCode || '')}&error_description=${encodeURIComponent(errorDescription || error)}`,
        baseUrl
      )
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code_received', baseUrl));
  }

  const supabase = await createClient();

  try {

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


    // Exchange the code for a Supabase session
    const { data: exchangeData, error: exchangeError } = await exchangeGoogleOAuthCode(code);
    if (exchangeError) throw exchangeError;


    // ←←← HERE IS THE GOOGLE ACCESS TOKEN ←←←
// ←←← HERE IS THE GOOGLE ACCESS TOKEN ←←←
const googleAccessToken = exchangeData?.access_token
const googleRefreshToken = exchangeData?.refresh_token

    consoleLog('✅ Google Access Token received:', googleAccessToken ? 'Yes (present)' : 'No');
    consoleLog('✅ Google Access Refresh received:', googleRefreshToken ? 'Yes (present)' : 'No');

    if (googleAccessToken) {
      console.log('Google Access Token (first 30 chars):', googleAccessToken.substring(0, 30) + '...');

      // Optional: Save it to your database for later use
      // await saveGoogleTokenToDatabase(session.user.id, googleAccessToken, googleRefreshToken);
    } else {
      console.warn('⚠️ No provider_token received. Check if you added the youtube.readonly scope correctly.');
    }

    // Log Refresh Token
    if (googleRefreshToken) {
      console.log(
        'Google Refresh Token (first 30 chars):',
        googleRefreshToken.substring(0, 30) + '...'
      )
    } else {
      console.warn('⚠️ No Refresh Token received')
    }    

    // await supabase.auth.refreshSession();
  } catch (err: unknown) {
    console.error('Error processing Google callback:', err);
    return NextResponse.redirect(new URL('/?error=link_failed', baseUrl));
  }

  // Success → redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', baseUrl));
}