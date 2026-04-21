// lib/services/google-auth-service.ts
import { errorGoogleAuthService } from './GoogleAuthServiceError';
import { OAuth2Client, OAuth2ClientOptions, } from 'google-auth-library';
import { GaxiosError } from 'gaxios';
import type {GoogleLinkedAccount, NewAccessToken} from './GoogleAuthServiceTypes'
import { consoleLog } from '../../utils';
import { supabaseAdmin } from '@/lib/supabase/clients/supabaseAdmin';

// Import your generated types
import { Database } from '@/types/supabase'
import { IGoogleAuthService } from './IGoogleAuthService';
import { requireEnv } from '@/lib/utils/requireEnv';
type GoogleLinkedAccountRow = Database['gotit']['Tables']['google_linked_accounts']['Row']

/*
type GoogleLinkedAccountRow = {
  id: string,
  google_email: string;
  access_token: string;
  expires_at: string | number; 
  refresh_token: string | null;
  consent_expired: boolean;
};*/



export class GoogleAuthService implements IGoogleAuthService {
  private oauth2Client: OAuth2Client;
  private supabase;

  // We default to false (popup/postmessage) because it's your main flow
  constructor(isRedirect: boolean = false) {
    const redirectUri = isRedirect
      ? requireEnv('GOOGLE_REDIRECT_URI')
      : 'postmessage';

    const options: OAuth2ClientOptions = {
      clientId: requireEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
      redirectUri,
    };

    this.oauth2Client = new OAuth2Client(options);
    this.supabase = supabaseAdmin('gotit')
  }

  async revokeAccessToken(accessToken: string) {
    try {
      await this.oauth2Client.revokeToken(accessToken);
    } catch (err) {
      consoleLog('Failed to revoke Google access token', err);
      throw err;
    }
  }
  
  async disconnectAccount(
    userId: string,
    accountId: string
  ): Promise<GoogleLinkedAccount> {
    let account: GoogleLinkedAccountRow;

    // 1. Get account from DB
    try {
      const { data, error } = await this.supabase
        .from('google_linked_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        throw errorGoogleAuthService(
          'SUPABASE_QUERY_ERROR',
          error ?? new Error('Account not found')
        );
      }

      account = data;
    } catch (err) {
      consoleLog('(disconnectAccount) Step 1 - fetch account failed', err);
      throw err; // cannot continue without account
    }

    // 2. Revoke refresh token (if exists)
    try {
      if (account.refresh_token) {
        await this.oauth2Client.revokeToken(account.refresh_token);
      }
    } catch (err) {
      consoleLog('(disconnectAccount) Step 2 - revoke refresh token failed', err);
    }

    // 3. Revoke access token if not expired
    try {
      const expiresAt = new Date(account.expires_at).getTime();
      const isExpired = expiresAt <= Date.now();

      if (!isExpired && account.access_token) {
        await this.oauth2Client.revokeToken(account.access_token);
      }
    } catch (err) {
      consoleLog('(disconnectAccount) Step 3 - revoke access token failed', err);
    }

    // 4. Update DB (clear refresh token)
    try {
      const { data, error } = await this.supabase
        .from('google_linked_accounts')
        .update({
          refresh_token: null,
        })
        .eq('id', accountId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error || !data) {
        throw errorGoogleAuthService(
          'SUPABASE_QUERY_ERROR',
          error ?? new Error('Failed to update account')
        );
      }

      account = data;
    } catch (err) {
      consoleLog('(disconnectAccount) Step 4 - DB update failed', err);
      throw err;
    }

    // Map to service type
    const result: GoogleLinkedAccount = {
      id: account.id,
      googleEmail: account.google_email,
      accessToken: account.access_token,
      expiresAt: new Date(account.expires_at).getTime(),
      consentExpired: account.consent_expired!,
    };

    return result;
  }
  async removeAccount(
    id: string,
    userId: string
  ): Promise<{ google_linked_account: GoogleLinkedAccount }> {
    if (!id) {
      const error = errorGoogleAuthService(
        'MISSING_GOOGLE_LINKED_ACCOUNT_ID',
        new Error('(Error) GoogleAuthService.removeAccount')
      );
      consoleLog('(Error at GoogleAuthService.removeAccount)', error);
      throw error;
    }

    if (!userId) {
      const error = errorGoogleAuthService(
        'MISSING_USER_ID',
        new Error('(Error) GoogleAuthService.removeAccount')
      );
      consoleLog('(Error at GoogleAuthService.removeAccount)', error);
      throw error;
    }

    try {
      const { data, error: deleteError } = await this.supabase
        .from('google_linked_accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single<GoogleLinkedAccountRow>(); // 👈 ensures single row

      if (deleteError) {
        const error = errorGoogleAuthService(
          'SUPABASE_QUERY_ERROR',
          deleteError
        );
        consoleLog('(Error at GoogleAuthService.removeAccount)', deleteError);
        throw error;
      }

      const mapped: GoogleLinkedAccount = {
        id: data.id,
        googleEmail: data.google_email,
        accessToken: data.access_token,
        expiresAt: new Date(data.expires_at).getTime(),
        consentExpired: data.consent_expired!,
      };

      return {
        google_linked_account: mapped,
      };

    } catch (err: unknown) {
      const error = errorGoogleAuthService(
        'SUPABASE_CATCHED_ERROR',
        err
      );
      consoleLog('(Error at GoogleAuthService.removeAccount)', err);
      throw error;
    }
  }
  
  /**
   * Universal exchange method
   * @param code The auth code from Google
   * @param userId The Supabase User ID
   */
  async exchangeCode(code: string, userId: string): Promise<GoogleLinkedAccount> {

    try {
      
      const { tokens } = await this.oauth2Client.getToken(code);

      // 3. Decode Email from ID Token
      if (!tokens.id_token) throw new Error('No ID token received from Google');

      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: requireEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload?.email) throw new Error('Google ID token missing email');

      // 4. Calculate metadata
      const expiresAt = tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : new Date(Date.now() + 3600 * 1000).toISOString();

      const scopeArray = tokens.scope ? tokens.scope.split(' ') : [];


      // 5. Database logic using Admin client (to bypass RLS for initial link if needed)

      const { data, error: queryError } = await this.supabase
        .from('google_linked_accounts')
        .insert({
          user_id: userId,
          google_sub: payload.sub,
          google_email: payload.email,
          access_token: tokens.access_token!,
          refresh_token: tokens.refresh_token!,
          expires_at: expiresAt,
          scopes: scopeArray,
        })
        .select()
        .single(); // ensures a singl


      if (queryError) {
        consoleLog('Supabase error inserting new  google_linked_account', queryError);
        throw errorGoogleAuthService('SUPABASE_QUERY_ERROR', queryError);
      }

      const result: GoogleLinkedAccount = {
        id: data.id,
        googleEmail: data.google_email,
        accessToken: data.access_token,
        expiresAt: new Date(data.expires_at).getTime(),
        consentExpired: data.consent_expired!,
      };

      return result;

    }
    catch (err) {
      consoleLog('Google GIS exchange code Failed. No valid Credentials', err);
      throw errorGoogleAuthService('GOOGLE_OAUTH2_EXCHANGE_CODE_FAILED', err);
    }
   

  }

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
      const { data, error: queryError } = await this.supabase
        .from('google_linked_accounts')
        .select('id, google_email, access_token, expires_at, refresh_token, consent_expired')
        .eq('user_id', userId)

        if (queryError) {
          const error = errorGoogleAuthService('SUPABASE_QUERY_ERROR', queryError);
          consoleLog('(Error at GoogleAuthService.getLinkedAccounts)', queryError);
          throw error;
        }

        if (!data) return data;

        // Cast the result if inference fails
        const rows = data as GoogleLinkedAccountRow[]
        
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
                  consentExpired: row.consent_expired!,
                };
              }

              // fallback (if your union differs)
              return {
                id: row.id,
                googleEmail: row.google_email,
                accessToken: row.access_token,
                expiresAt: expiryMs,
                consentExpired: row.consent_expired!,
              };

            } catch (err) {
              consoleLog("Failed to refresh token", err);

              // fallback to existing token
              return {
                id: row.id,
                googleEmail: row.google_email,
                accessToken: row.access_token,
                expiresAt: expiryMs,
                consentExpired: row.consent_expired!,
              };
            }
          }
          // No refresh needed
          return {
            id: row.id,
            googleEmail: row.google_email,
            accessToken: row.access_token,
            expiresAt: expiryMs, // ✅ UTC → Unix ms
            consentExpired: row.consent_expired!,
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

      if(!credentials?.access_token || !credentials?.expiry_date){
        consoleLog('Missing access_token or expiry_date in Google response')
        throw errorGoogleAuthService(
          'GOOGLE_OAUTH2_REFRESH_ACCESS_TOKEN_FAILED', 
          new Error('Missing access_token or expiry_date in Google response')
        );
      }
      
      if (credentials?.refresh_token && credentials?.refresh_token !== refreshToken) {
        // Save this new refresh token to your database!
        refreshToken = credentials.refresh_token
      }

      try {
        
        return await this.dbUpdateAccesstoken(id, credentials.access_token, credentials.expiry_date, refreshToken)

      } catch (err) {        
        consoleLog("Failed to persist new access token", err);

        const refreshedToken: NewAccessToken = {
          accessToken: credentials.access_token,
          expiresAt: credentials.expiry_date
        }
        // 
        return refreshedToken

      }  

    } catch (err) {

      if (err instanceof GaxiosError) {
        const errorDescription = err.response?.data?.error_description
        const error = err.response?.data?.error;
        if (
          error === 'invalid_grant' ||
          errorDescription?.includes('revoked') ||
          errorDescription?.includes('expired')
        ) {
          // revoke refresh_token in supabase
          try {
            const { data, error: queryError } = await this.supabase
              .from('google_linked_accounts')
              .update({
                refresh_token: null,
              })
              .eq('id', id)
              .select()
              .single()

            if (queryError ) {
              consoleLog('Supabase error updating google_linked_accounts table', queryError);
              throw errorGoogleAuthService('SUPABASE_QUERY_ERROR', queryError);
            }
                          
            const result: GoogleLinkedAccount = {
                id: data.id,
                googleEmail: data.google_email,
                accessToken: data.access_token,
                expiresAt: new Date(data.expires_at).getTime(),
                consentExpired: data.consent_expired!,
            };

            return result;
          } catch (err) {
            consoleLog('Supabase catched error updating "google_linked_accounts" table', err);
            throw errorGoogleAuthService('SUPABASE_QUERY_ERROR', err);
          }
        }
      }

     consoleLog('Catched error: await this.oauth2Client.refreshAccessToken()', err)
        throw errorGoogleAuthService(
          'GOOGLE_OAUTH2_REFRESH_ACCESS_TOKEN_FAILED', 
          err
        );
      
    }
  }

  async dbUpdateAccesstoken(id: string, accessToken: string, expiryDate: number, refreshToken: string): Promise<GoogleLinkedAccount>{    
  
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
          refresh_token: refreshToken
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

  async getValidAccessToken(accountId: string): Promise<string> {
    if (!accountId) {
      throw errorGoogleAuthService(
        'MISSING_GOOGLE_LINKED_ACCOUNT_ID',
        new Error('accountId is required')
      );
    }

    // 1. Fetch account
    const { data, error } = await this.supabase
      .from('google_linked_accounts')
      .select('id, access_token, expires_at, refresh_token, consent_expired')
      .eq('id', accountId)
      .single();

    if (error || !data) {
      throw errorGoogleAuthService(
        'SUPABASE_QUERY_ERROR',
        error ?? new Error('Account not found')
      );
    }

    const now = Date.now();
    const expiryMs = new Date(data.expires_at).getTime();

    const isExpired = expiryMs <= now;
    const willExpireSoon = expiryMs - now <= 5 * 60 * 1000;

    const shouldRefresh =
      !!data.refresh_token &&
      !data.consent_expired &&
      (isExpired || willExpireSoon);

    // 2. Refresh if needed
    if (shouldRefresh) {
      try {
        const refreshed = await this.refreshAccessToken(
          data.refresh_token!,
          data.id
        );

        if (!refreshed?.accessToken) {
          throw new Error("Missing access_token for Google account");
        }
       
        return refreshed.accessToken;

      } catch (err) {
        consoleLog('Token refresh failed, fallback to existing token', err);

      }
    }

    // 3. Return existing token
    return data.access_token;
  }

}