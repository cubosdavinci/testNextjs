// lib/validate/products/download-link
import { z } from "zod";

const driveOrDocsRegex = /^https:\/\/(drive\.google\.com\/file\/d|docs\.google\.com\/(document|spreadsheets|presentation)\/d)\/([^\/]+)\/(view|edit)\?usp=(sharing|drive_link)$/;

export const validateGoogleDriveLink = z.preprocess(
  (val) => (typeof val === "string" ? val.trim() : val),
  z.string()
    .min(1, { message: "Download Link is required" })
    .regex(driveOrDocsRegex, { message: "Invalid Google Drive shared link format" })
);








// OLDDDD !!!! lib/validate/products/download-link
/*import { z } from "zod";
const driveLinkRegex = /^https:\/\/drive\.google\.com\/file\/d\/([^\/]+)\/view\?usp=(sharing|drive_link)$/;

export const validateGoogleDriveLink = z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string()
      .min(1, { message: "Download Link is required" })
      .regex(driveLinkRegex, { message: "Invalid Google Drive link format" })
);*/