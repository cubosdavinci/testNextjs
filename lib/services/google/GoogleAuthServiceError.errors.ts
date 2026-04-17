// google-auth.errors.ts
export const GoogleAuthErrors = {  
  SUPABASE_QUERY_ERROR: {
    code: 'SUPABASE_QUERY_ERROR',
    message: 'Supabase query error',
  },
  MISSING_USER_ID: {
    code: 'MISSING_USER_ID',
    message: 'Missing user ID',
  },
  SUPABASE_CATCHED_ERROR: {
    code: 'SUPABASE_CATCHED_ERROR',
    message: 'Supabase catched error.',
  },
  MISSING_ACCESS_TOKEN: {
    code: 'MISSING_ACCESS_TOKEN',
    message: 'An access token must be provided',
  },
  MISSING_REFRESH_TOKEN: {
    code: 'MISSING_REFRESH_TOKEN',
    message: 'A refresh token must be provided',
  },
    MISSING_GOOGLE_LINKED_ACCOUNT_ID: {
    code: 'MISSING_GOOGLE_LINKED_ACCOUNT_ID',
    message: 'Removing Linked Account (missing id)',
  },
    GOOGLE_OAUTH2_REFRESH_ACCESS_TOKEN_FAILED: {
    code: 'GOOGLE_OAUTH2_REFRESH_ACCESS_TOKEN_FAILED',
    message: 'Google did not return a valid access token.',
  },
  GOOGLE_OAUTH2_EXCHANGE_CODE_FAILED: {
    code: 'GOOGLE_OAUTH2_EXCHANGE_CODE_FAILED',
    message: 'Google GIS exchange code Failed. No valid Credentials',
  },
  LINK_FAILED: {
    code: 'LINK_FAILED',
    message: 'Failed to link Google account',
  },

} as const;