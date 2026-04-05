import { UAParser } from "ua-parser-js";
import { UserAgentInfo } from "@/types/userAgentInfo";

/**
 * Parse headers to extract client information
 * @param headersMap Map<string, string>
 * @returns ClientInfo
 */
export function getUserAgentFromHeaders(headersIterator: HeadersIterator<[string, string]>): UserAgentInfo {
  // Read headers from Next.js App Router
  const headersMap = new Map<string, string>(headersIterator);

  const uaString = headersMap.get("user-agent") ?? "";
  const parser = new UAParser(uaString);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();
  const language = headersMap.get("accept-language") ?? "Unknown";
  const ip = headersMap.get("x-forwarded-for") ?? "Unknown";

  return {
    browser: `${browser.name ?? "Unknown"} ${browser.version ?? ""}`.trim(),
    os: `${os.name ?? "Unknown"} ${os.version ?? ""}`.trim(),
    device: `${device.type ?? "Desktop"} ${device.model ?? ""}`.trim(),
    language,
    ip,
  };
}