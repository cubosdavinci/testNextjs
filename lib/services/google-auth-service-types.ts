/**
 * Represents a Google account linked to the user's profile.
 * This is the cleaned data structure intended for the frontend/browser.
 */
export type GoogleLinkedAccount = {
  /** The unique identifier for the Google account (from the 'sub' claim). */
  google_sub: string;

  /** The valid OAuth2 access token (refreshed automatically if needed). */
  access_token: string;

  /** * Token expiration timestamp in Unix Epoch Milliseconds.
   * Use `new Date(expires_at)` to convert to a JS Date object. 
   */
  expires_at: number;

  /** * Indicates if the refresh token is invalid or the user has revoked access.
   * If true, the user must re-authenticate to restore functionality. 
   */
  consent_expired: boolean;
};

export type RefreshTokenResult =
  | { data: { accessToken: string; expiryDate?: number | null } }
  | { error: { message: string; exception?: Error | unknown; details?: string } };