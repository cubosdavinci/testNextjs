import { getPageFiles } from "next/dist/server/get-page-files";
import { browserConsoleLog, consoleLog } from "../utils";
import { prettySize } from "../helpers/prettySize";
import { removeSubstring } from "../helpers/removeSubstring";

/**
 * Validates that a file has an allowed image MIME type and is within the size limit.
 *
 * @param file - The file to validate.
 * @param allowedTypes (Default: [image/jpeg, image/png, image/webp]) - Optional array of allowed MIME types. Defaults to common image types.
 * @param maxSize - Optional maximum size (in bytes) for the image. Default is no limit.
 *
 * @throws Error if the file type or size is not allowed.
 */
export function validateImageFile(
  file: File,
  allowedTypes: string[] = ["image/jpeg", "image/png", "image/webp"],
  maxSize: number = Infinity // Default: no size limit
): void {
  consoleLog("🔔 🔆 Validator Helper Starts (lib/validate/validateImageType.ts)");

  let errorMessage = ""; // Temporary error message string to accumulate errors

  // Validate file type
  consoleLog("🔍 File Type", removeSubstring(file.type, "image/"));
  consoleLog("🔍 Allowed Types", removeSubstring(allowedTypes.join(", "), "image/"))
  if (!allowedTypes.includes(file.type)) {
    consoleLog("🔥 ❌ Invalid Image Type:", file.type);    
    errorMessage += `Allowed types are: <span class="text-green-700">${removeSubstring(allowedTypes.join(", "), "image/")}</span>. <br/>`;
    errorMessage += `Invalid image type: <span class="text-yellow-700 font-semibold">${removeSubstring(file.type, "image/")}</span>. <br/>`;
  }

  // Validate file size (in bytes)
  if (file.size > maxSize) {
    consoleLog("🔥 ❌ File size exceeds the limit:", file.size);
    errorMessage += `File size exceeds the maximum limit of <span class="text-green-700">${prettySize(maxSize)}</span>.<br/>`;
    errorMessage += `Provided file size is: <span class="text-yellow-700 font-semibold">${prettySize(file.size)}</span>. <br/>`;
  }

  // If there are accumulated errors, throw them together
  if (errorMessage) {
    consoleLog("🔥🔥🔥 Propagating error(s) to higher levels...");
    throw new Error(errorMessage); // Throw all errors in one message
  }
}
