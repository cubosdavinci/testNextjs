/**
 * Represents a Google account linked to the user's profile.
 * This is the cleaned data structure intended for the frontend/browser.
 */
export type GoogleLinkedAccount = {

  id: string;


  googleEmail: string;


  /** The valid OAuth2 access token (refreshed automatically if needed). */
  accessToken?: string | null;

  /** * Token expiration timestamp in Unix Epoch Milliseconds.
   * Use `new Date(expires_at)` to convert to a JS Date object. 
   */
  expiresAt?: number | null;

  /** * Indicates if the refresh token is invalid or the user has revoked access.
   * If true, the user must re-authenticate to restore functionality. 
   */
  consentExpired: boolean;
};


export type NewAccessToken = { 
  /** The valid OAuth2 access token */
  accessToken?: string | null ;
  expiresAt?: number | null
};


/*export type RefreshTokenResult =
  | { data: { accessToken: string; expiryDate?: number | null } }
  | { error: { message: string; exception?: Error | unknown; details?: string } };*/