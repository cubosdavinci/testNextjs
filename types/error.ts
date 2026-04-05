// lib/errors/GoogleApiError.ts
export class GoogleApiError extends Error {
  status?: number; // optional HTTP status code

  constructor(message: string, status?: number) {
    super(message);
    this.name = "GoogleApiError";
    this.status = status;
  }
}