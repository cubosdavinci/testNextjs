import { z } from "zod";

export const GoogleDriveMetadataSchema = z.object({
    id: z.string(),
    name: z.string(),
    mimeType: z.string(),
    size: z.string().optional(), // still optional (matches interface)
    createdTime: z.string(),
    modifiedTime: z.string(),
    md5Checksum: z.string().optional(),
    webContentLink: z.string().optional(),
    owners: z.array(
        z.object({
            kind: z.string(),
            displayName: z.string(),
            me: z.boolean(),
            permissionId: z.string(),
            emailAddress: z.string(),
        })
    ),
});