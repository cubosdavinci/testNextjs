import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export function sanitizeProductDescription(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
        "h1", "h2", "h3", "h4", "h5", "h6", // headings
        "p", "b", "i", "u", "strong", "em", 
        "ul", "ol", "li", "br", "span",
    ],
    ALLOWED_ATTR: ["class", "style"],
  });
}