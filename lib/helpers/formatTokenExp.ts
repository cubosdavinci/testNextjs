/**
 * Converts a JWT expiration (exp) timestamp to a readable date string.
 * @param exp - JWT `exp` claim (seconds since Unix epoch)
 * @param timeZone - Optional IANA timezone string, default "UTC"
 * @returns Human-readable date string
 */
export function formatTokenExp(exp: number, timeZone: string = "UTC"): string {
  // Convert seconds → milliseconds
  const date = new Date(exp * 1000);

  // Format as human-readable string in the specified timezone
  return date.toLocaleString("en-GB", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
}