// lib/services/google-auth-service.ts
import { errorGoogleAuthService } from './GoogleAuthServiceError';
import { OAuth2Client, OAuth2ClientOptions, } from 'google-auth-library';
import { GaxiosError } from 'gaxios';
import type {GoogleLinkedAccount, NewAccessToken} from './GoogleAuthServiceTypes'
import { consoleLog } from '../../utils';
import { supabaseAdmin } from '@/lib/supabase/clients/supabaseAdmin';

import { QueryData } from '@supabase/supabase-js';


type GoogleLinkedAccountRow = {
  id: string,
  google_email: string;
  access_token: string;
  expires_at: string | number; 
  refresh_token: string | null;
  consent_expired: boolean;
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
  /*async getValidToken(credentialId: string): Promise<string | null> {
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

  private async refreshAndSaveToken(creds: GoogleLinkedAccountRow): Promise<string | null> {
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
  }*/

  /**
   * Universal exchange method
   * @param code The auth code from Google
   * @param userId The Supabase User ID
   */
  /*async exchangeCode(code: string, userId: string) {

    // Exchange code for tokens
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
      .from('google_linked_accounts')
      .upsert({
        user_id: userId,
        google_sub: payload.sub,
        google_email: payload.email,
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token!, // Note: only sent on first consent
        expires_at: expiresAt,
      }, {
        onConflict: 'user_id, google_sub'
      });

    if (error) throw new Error(error.message);

    return { success: true, email: payload.email };
  }*/

  /**
   * Retrieves all Google accounts linked to a specific user.
   * * This method performs the following:
   * 1. Fetches stored credentials from the 'google_linked_accounts' table.
   * 2. Checks if the access token is near expiration (within 15 minutes).
   * 3. Automatically attempts a refresh if needed and consent is still valid.
   * 4. Maps the internal DB row format to a browser-friendly format (converting dates to ms).
   * * @param userId - The internal unique identifier for the user.
   * @returns A promise resolving to an array of GoogleLinkedAccount.
   * @throws Relays database errors if the Supabase query fails.
   */
  async getLinkedAccounts(userId: string): Promise<GoogleLinkedAccount[]> {
    try {
      const { data, error } = await this.supabase
        .from('google_linked_accounts')
        .select('id, google_email, access_token, expires_at, refresh_token, consent_expired')
        .eq('user_id', userId)

      if (error) {
        consoleLog('Error fetching google linked accounts from supabase', error);
        throw error;
      }

      const rows = data ?? [];

      const refreshedData: GoogleLinkedAccount[] = await Promise.all(
        rows.map(async (row) => {
          const now = Date.now();
          const expiryMs = new Date(row.expires_at).getTime();

          const isExpired = expiryMs <= now;
          const willExpireSoon = expiryMs - now <= 5 * 60 * 1000;

          const shouldRefresh =
            !!row.refresh_token && // not null
            !row.consent_expired &&
            (isExpired || willExpireSoon);

          if (shouldRefresh) {
            try {
              const result = await this.refreshAccessToken(
                row.refresh_token!,
                row.id
              );

              // If DB updated version returned
              if ('accessToken' in result!) {
                return {
                  id: row.id,
                  googleEmail: row.google_email,
                  accessToken: result.accessToken,
                  expiresAt: result.expiresAt, // already ms
                  consentExpired: row.consent_expired,
                };
              }

              // fallback (if your union differs)
              return {
                id: row.id,
                googleEmail: row.google_email,
                accessToken: row.access_token,
                expiresAt: expiryMs,
                consentExpired: row.consent_expired,
              };

            } catch (err) {
              consoleLog("Failed to refresh token", err);

              // fallback to existing token
              return {
                id: row.id,
                googleEmail: row.google_email,
                accessToken: row.access_token,
                expiresAt: expiryMs,
                consentExpired: row.consent_expired,
              };
            }
          }
          // No refresh needed
          return {
            id: row.id,
            googleEmail: row.google_email,
            accessToken: row.access_token,
            expiresAt: expiryMs, // ✅ UTC → Unix ms
            consentExpired: row.consent_expired,
          };
        })
      );

      return refreshedData;

    } catch (err) {
      consoleLog('Unexpected error accessing Supabase', err);
      throw err;
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
  async refreshAccessToken(
    refreshToken: string,
    id: string,   
  ): Promise<GoogleLinkedAccount | NewAccessToken> {    
    if (!refreshToken || !refreshToken.trim()) {
      const error = errorGoogleAuthService('MISSING_REFRESH_TOKEN', new Error('Undefined refresh_token'));
      consoleLog("(Error at GoogleAuthService.refreshAccessToken)", error);  
      throw error;
    }
    else if (!id){
      const error = errorGoogleAuthService('MISSING_GOOGLE_LINKED_ACCOUNT_ID', new Error('Undefined id'));
      consoleLog("(Error at GoogleAuthService.refreshAccessToken)", error);  
      throw error;
    }
    
    // setting refresh_token
    this.oauth2Client.setCredentials({ refresh_token: refreshToken});

    try {      
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if(!credentials.access_token || !credentials.expiry_date){
        const error = errorGoogleAuthService('GOOGLE_OAUTH2_REFRESH_ACCESS_TOKEN_FAILED', new Error('Undefined credentials.access_token or credentials.expiry_date'));
        consoleLog("(Error at GoogleAuthService.refreshAccessToken)", error);  
        throw error;
      }

      try {
        return await this.dbUpdateAccesstoken(id, credentials.access_token, credentials.expiry_date)
      } catch (err) {        
        consoleLog("Failed to persist new access token", err);

        const refreshedToken: NewAccessToken = {
          accessToken: credentials.access_token,
          expiresAt: credentials.expiry_date
        }
        return refreshedToken
      }  
      
    } catch (err: unknown) {
      // 🔥 Google refresh token is no longer valid      
      let errorDescription;
      let error;
      if (err instanceof GaxiosError) {
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

      const errMessage = (error) ? error : 'Unexpected error refreshing access token';
      return {

        error: {
          message: errMessage,
          exception: err,
          details: errorDescription,
        }
      };
    }
  }

  async dbUpdateAccesstoken(id: string, accessToken: string, expiryDate: number):Promise<GoogleLinkedAccount>{    
  
    if (!id) {
      const error = errorGoogleAuthService('MISSING_GOOGLE_LINKED_ACCOUNT_ID', new Error('(Error) GoogleAuthService.dbUpdateAccesstoken'));
      consoleLog("GoogleAuthService.dbUpdateAccesstoken (Error) ", error);  
      throw error;
    }
    else if (!accessToken) {  
      const error = errorGoogleAuthService('MISSING_ACCESS_TOKEN', new Error('(Error) GoogleAuthService.dbUpdateAccesstoken'));
      consoleLog("(Error at GoogleAuthService.dbUpdateAccesstoken)", error);    
      throw error
    }

    const dbExpiryDate = expiryDate
      ? new Date(expiryDate).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString();

    try {
      const { data, error:updateError } = await this.supabase
        .from('google_linked_accounts')
        .update({
          access_token: accessToken,
          expires_at: dbExpiryDate,
        })
        .eq('id', id)
        .select()
        .single()
        
      if (updateError) {
        const error = errorGoogleAuthService('SUPABASE_QUERY_ERROR', updateError);
        consoleLog('(Error at GoogleAuthService.dbUpdateAccesstoken)', updateError);
        throw error;
      }

     const result: GoogleLinkedAccount = {
        id: data.id,
        googleEmail: data.google_email,
        accessToken: data.access_token,
        expiresAt: new Date(data.expires_at).getTime(),
        consentExpired: data.consent_expired!,
      };

      return result;
                
    } catch (err: unknown) {
        const error = errorGoogleAuthService('SUPABASE_CATCHED_ERROR', err);
        consoleLog('(Error at GoogleAuthService.dbUpdateAccesstoken)', err);
        throw error;
    }   
  }
}