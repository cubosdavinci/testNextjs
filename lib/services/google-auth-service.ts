// lib/services/google-auth-service.ts
import { supabaseServer } from '@/lib/supabase/clients/supabaseServer'
import { OAuth2Client, OAuth2ClientOptions, } from 'google-auth-library';
import { GaxiosError } from 'gaxios';
import type { Database } from '@/types/supabase';
import { supabaseAdmin } from '../supabase/clients/supabaseAdmin';

import { consoleLog } from '../utils';

type CredentialRow = Database['public']['Tables']['user_google_credentials']['Row'];
type RefreshTokenResult =
  | { data: { accessToken: string; expiryDate?: number | null } }
  | { error: { message: string; exception?: Error | unknown; details?: string } };
type GoogleLinkedAccountRow = {
  google_sub: string;
  access_token: string;
  expires_at: string; 
  refresh_token: string | undefined;// timestamptz from Supabase returns ISO string
  consent_expired: boolean;
  expires_in_seconds: number;
  refresh_now: boolean;
};
type GoogleLinkedAccounts = {
  google_sub: string;       // Google account ID
  access_token: string;     // The current (or refreshed) access token
  expires_at: number; // Token expiration datetime in ISO format
  consent_expired: boolean;  // Whether the user has revoked consent
};
export class GoogleAuthService {
  private oauth2Client: OAuth2Client;
  private supabase;

  // We default to false (popup/postmessage) because it's your main flow
  constructor(isRedirect: boolean = false) {
    const redirectUri = isRedirect
      ? process.env.GOOGLE_REDIRECT_URI
      : 'postmessage';

    const options: OAuth2ClientOptions = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri,
    };

    this.oauth2Client = new OAuth2Client(options);
    this.supabase = supabaseAdmin('gotit')
  }
  
  /**
   * Helper to get a valid token. 
   * Handles the fetch, the check, and the potential refresh.
   */
  async getValidToken(credentialId: string): Promise<string | null> {
    const supabase = await supabaseServer();

    // 1. Fetch the specific credential record
    const { data: creds, error } = await supabase
      .from('user_google_credentials')
      .select('*')
      .eq('id', credentialId)
      .single();

    if (error || !creds) {
      consoleLog('Credential not found or access denied');
      return null;
    }

    // 2. Check expiration (5-minute safety buffer)
    const expiresAt = new Date(creds.expires_at).getTime();
    const now = Date.now();
    const buffer = 5 * 60 * 1000; 

    if (now + buffer < expiresAt && creds.access_token) {
      return creds.access_token;
    }

    // 3. If expired, try to refresh
    if (!creds.refresh_token) {
      console.warn('Token expired and no refresh_token available');
      return null;
    }

    return await this.refreshAndSaveToken(creds);
  }

  private async refreshAndSaveToken(creds: CredentialRow): Promise<string | null> {
    const supabase = await supabaseServer();

    try {
      this.oauth2Client.setCredentials({
        refresh_token: creds.refresh_token,
      });

      // Request a fresh access token from Google
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      const newAccessToken = credentials.access_token;
      const newExpiry = credentials.expiry_date
        ? new Date(credentials.expiry_date).toISOString()
        : new Date(Date.now() + 3600 * 1000).toISOString();

      // 4. Update Supabase with the new short-lived token
      const { error: updateError } = await supabase
        .from('user_google_credentials')
        .update({
          access_token: newAccessToken,
          expires_at: newExpiry,
          updated_at: new Date().toISOString(),
        })
        .eq('id', creds.id);

      if (updateError) throw updateError;

      return newAccessToken;
    } catch (err: unknown) {
      const  errMessage = (err instanceof Error) ? err.message : 'Unknown error';
      
      const errorData = err.response?.data?.error;
      err.response?.data?.error
      
      if (errorData === 'invalid_grant') {
        // The user likely revoked permission in Google Settings
        await supabase
          .from('user_google_credentials')
          .update({
            access_token: null,
            refresh_token: null,
            // Keep expires_at as a past date or handle nullability if your type allows
            expires_at: new Date(0).toISOString(), 
            updated_at: new Date().toISOString(),
          })
          .eq('id', creds.id);
      }
      
      consoleLog('Google token refresh failed:', errorData || err.message);
      return null;
    }
  }

  /**
   * Universal exchange method
   * @param code The auth code from Google
   * @param userId The Supabase User ID
   * @param redirectUri 'postmessage' for popups, or the GOOGLE_REDIRECT_URI for GET
   */
  async exchangeCode(code: string, userId: string) {


    // 2. Exchange code for tokens
    const { tokens } = await this.oauth2Client.getToken(code);

    // 3. Decode Email from ID Token
    if (!tokens.id_token) throw new Error('No ID token received from Google');
    
    const ticket = await this.oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error('Google ID token missing email');

    // 4. Calculate metadata
    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString();
      
    const scopeArray = tokens.scope ? tokens.scope.split(' ') : [];
    
    const refreshTokenExpiresAt = tokens.refresh_token_expires_in 
        ? new Date(Date.now() + tokens.refresh_token_expires_in * 1000).toISOString()
        : null;

    // 5. Database logic using Admin client (to bypass RLS for initial link if needed)
   
    const { error } = await (this.supabase)
      .from('user_google_credentials')
      .upsert({
        user_id: userId,
        google_email: payload.email,
        access_token: tokens.access_token ?? '',
        refresh_token: tokens.refresh_token ?? null, // Note: only sent on first consent
        expires_at: expiresAt,
        scopes: scopeArray,
        refresh_token_expires_at: refreshTokenExpiresAt,
        is_main_linked: false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id, google_email'
      });

    if (error) throw new Error(error.message);

    return { success: true, email: payload.email };
  }


  async getLinkedAccounts(userId: string):Promise<GoogleLinkedAccounts[] | undefined> {
    try {
      const supabase = supabaseAdmin('gotit');

      const { data, error } = await supabase
        .from('google_linked_accounts')           // ← your real table name
        .select(`
          google_sub,
          access_token,
          expires_at,
          refresh_token,
          consent_expired,
          EXTRACT(epoch FROM (expires_at - now())) as expires_in_seconds,
          CASE 
            WHEN EXTRACT(epoch FROM (expires_at - now())) < 900 
            THEN true 
            ELSE false 
          END as refresh_now
        `)
        .eq('user_id', userId)

      if (error) {
        consoleLog('Error fetching google linked accounts from supabase', error);
        throw error;
      }

      // 1️⃣ Convert Supabase result to typed rows
      const rawData = data as unknown[];

      const rows: GoogleLinkedAccountRow[] = rawData.map((row: any) => ({
        google_sub: row.google_sub,
        access_token: row.access_token,
        expires_at: row.expires_at,
        refresh_token: row.refresh_token,
        consent_expired: Boolean(row.consent_expired),
        expires_in_seconds: Number(row.expires_in_seconds),
        refresh_now: Boolean(row.refresh_now),
      }));

      // 2️⃣ Refresh eligible tokens
      const refreshedData = await Promise.all(
        rows.map(async (row) => {
          // Only refresh if consent is valid and token is about to expire
          if (!row.consent_expired && row.refresh_now) {
            // Call your refreshAccessToken function
            const result = await this.refreshAccessToken(
              row.refresh_token!, // refresh token
              userId,
              row.google_sub
            );

            if ('data' in result) {
              // Replace access_token and expiry in row for returning
              return {
                google_sub: row.google_sub,
                access_token: result.data.accessToken,
                expires_at: result.data.expiryDate ?? new Date(row.expires_at).getTime(),
                consent_expired: row.consent_expired,
              };
            } else {
              // Optional: keep old token if refresh fails
              console.error(`Failed to refresh token for ${row.google_sub}:`, result.error.message);                        
              return {
                google_sub: row.google_sub,
                access_token: row.access_token,
                expires_at: row.expires_at,
                consent_expired: row.consent_expired,
              };
            }
          } else {
            // No refresh needed
              return {
                google_sub: row.google_sub,
                access_token: row.access_token,
                expires_at: row.expires_at,
                consent_expired: row.consent_expired,
              };
          }
        })
      );

      return refreshedData

    } catch (err) {
      consoleLog('Unexpected error accessing Supabase', err);
    }    
  }

  
  /* Refreshes a Google access token using a provided refresh token,
  * updates the linked account record in Supabase, and handles revocations.
  *
  * @param refreshToken - The Google OAuth2 refresh token for the user
  * @param user_id - The internal user ID in your system
  * @param google_sub - The Google account ID (sub) associated with the user
  * @returns Promise<RefreshTokenResult> - { data: { accessToken, expiryDate } } on success, or { error: { message, exception?, details? } } on failure
  *
  * - Supabase update errors are logged but do not block returning the refreshed token.
  */
  async  refreshAccessToken(
    refreshToken: string,
    user_id: string,
    google_sub: string,
  ): Promise<RefreshTokenResult> {
    
    if (!refreshToken.trim())
      return {error:{message: 'A refresh token must be provided'}}
    else if (!user_id)
      return {error:{message: 'A user_id must must be provided'}}
    else if (!google_sub)
      return {error:{message: 'A sub (google account id) must be provided'}}

    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        return {
          error: {
            message: "Google did not return a valid access token.",
          },
        };
      }


      const newExpiry = credentials.expiry_date
        ? new Date(credentials.expiry_date).toISOString()
        : new Date(Date.now() + 3600 * 1000).toISOString();

      // 4. Update Supabase table

      try {
        const { error: updateError } = await this.supabase
          .from('google_linked_accounts')
          .update({
            access_token: credentials.access_token,
            expires_at: newExpiry,
          })
          .eq('user_id', user_id)
          .eq('google_sub', google_sub);

        if (updateError) {
          consoleLog('Supabase error updating google_linked_accounts table', updateError);
        }
      } catch (err) {
        consoleLog('Unexpected error accessing Supabase', err);
      }

      return {
          data: {
              accessToken: credentials.access_token,
              expiryDate: credentials.expiry_date,  // unix format
          }
      };
    } catch (err: unknown) {
      // 🔥 Google refresh token is no longer valid      
        let errorDescription;
        let error; 
        if( err instanceof GaxiosError ){
            errorDescription = err.response?.data?.error_description
            error = err.response?.data?.error;
          if ( 
            error === 'invalid_grant' ||
            errorDescription?.includes('revoked') ||
            errorDescription?.includes('expired')
          ) {
              // revoke refresh_token in supabase
              try {
                const { error: updateError } = await this.supabase
                  .from('google_linked_accounts')
                  .update({
                    refresh_token: undefined,
                  })
                  .eq('user_id', user_id)
                  .eq('user_id', google_sub);

                if (updateError) {
                  consoleLog('Supabase error updating google_linked_accounts table', updateError);
                }

              } catch (err) {
                consoleLog('Unexpected error accessing Supabase', err);
              }
          }

        }
      
      const  errMessage = (error) ? error : 'Unexpected error refreshing access token';
      return {

        error: {
          message: errMessage,
          exception: err,
          details: errorDescription,
        }      
      };
    }
  }
}