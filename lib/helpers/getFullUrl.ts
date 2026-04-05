/**
 * Prepends the site base URL to a local path.
 *
 * @param localPath - Path relative to the site root (e.g., "/images/avatar.jpg")
 * @returns Fully qualified URL (e.g., "https://yourdomain.com/images/avatar.jpg")
 */
export function getFullUrl(localPath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  return `${baseUrl}${localPath.startsWith("/") ? "" : "/"}${localPath}`;
}