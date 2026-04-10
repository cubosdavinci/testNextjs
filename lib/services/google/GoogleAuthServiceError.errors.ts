// google-auth.errors.ts
export const GoogleAuthErrors = {  
  SUPABASE_QUERY_ERROR: {
    code: 'SUPABASE_QUERY_ERROR',
    message: 'Supabase query error',
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
    message: 'Missing primary key (id) for google_linked_accounts table',
  },
    GOOGLE_OAUTH2_REFRESH_ACCESS_TOKEN_FAILED: {
    code: 'GOOGLE_OAUTH2_REFRESH_ACCESS_TOKEN_FAILED',
    message: 'Google did not return a valid access token.',
  },
  LINK_FAILED: {
    code: 'LINK_FAILED',
    message: 'Failed to link Google account',
  },
  TOKEN_EXCHANGE_FAILED: {
    code: 'TOKEN_EXCHANGE_FAILED',
    message: 'Failed to exchange authorization code',
  },
} as const;