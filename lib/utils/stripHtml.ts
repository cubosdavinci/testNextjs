/**
 * Strips HTML tags from a string to return raw text content.
 * Useful for character count validation.
 */
export const stripHtml = (html: string): string => {
    if (!html) return "";

    // 1. Remove all HTML tags
    let text = html.replace(/<[^>]+>/g, "");

    // 2. Optional: Replace common HTML entities with their character equivalents
    // This ensures that "&nbsp;" counts as 1 character instead of 6
    text = text.replace(/&nbsp;/g, " ");

    return text.trim();
};