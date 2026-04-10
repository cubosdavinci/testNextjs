import { GoogleAuthErrors } from "./GoogleAuthServiceError.errors";

export class GoogleAuthServiceError extends Error {
  public code: string;
  public cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'GoogleAuthServiceError';
    this.code = code;
    this.cause = cause;

    // Maintains proper stack trace (important in Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GoogleAuthServiceError);
    }
  }
}

export function errorGoogleAuthService(
  type: keyof typeof GoogleAuthErrors,
  cause?: unknown
) {
  const err = GoogleAuthErrors[type];
  return new GoogleAuthServiceError(err.code, err.message, cause);
}