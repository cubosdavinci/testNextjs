/**
 * Removes all occurrences of a specified substring from a string.
 *
 * @param str - The string to process.
 * @param substring - The substring to remove from the string.
 * @returns The string with all occurrences of the substring removed.
 */
export function removeSubstring(str: string, substring: string): string {
  const regex = new RegExp(substring, "g"); // Create a global regular expression
  return str.replace(regex, ""); // Replace all occurrences with an empty string
}
