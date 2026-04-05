import { consoleLog } from "../utils";

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

/**
 * Downloads an image from a URL and returns it as a File-like object.
 * Saleor expects a file for the `Upload!` type.
 */
export async function getImageFromUrl(url: string): Promise<File> {

    try {

        consoleLog("⚠️ Getting Image from url...")

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Failed to fetch image: ${res.statusText}`);
        }

        const contentType = res.headers.get("content-type") || "image/jpeg";
        const ext = EXT_MAP[contentType] || "jpg"; // fallback to jpg

        const buffer = await res.arrayBuffer();
        const file = new File( [buffer], `avatar.${ext}`, {
                type: contentType,
                lastModified: Date.now(),
            }
        );

        return file;
        
    } catch (err) {
        consoleLog( "💥 Unexpected error in /lib/utils/getImageFromUrl: ", [err] )
        throw err
    }       
}
