export { };

export interface GoogleDriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size?: string; // Drive API returns size as a string (bytes)
  createdTime: string;
  modifiedTime: string;
  owners: Array<{
    kind: string;
    displayName: string;
    me: boolean;
    permissionId: string;
    emailAddress: string;
  }>;
  webContentLink?: string;
  md5Checksum?: string;
}

// Define this in your types/drive.d.ts or at the top of your component
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
  [key: string]: unknown; // Allows for other dynamic properties
}
  
declare global {
  interface Window {
    gapi: any,
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id?: string;
            scope: string;
            ux_mode?: 'popup' | 'redirect';

            // ✅ add these:
            access_type?: 'offline' | 'online';
            prompt?: string;

            callback: (response: { code?: string }) => void;
          }) => {
            requestCode: () => void;
          };
        };
      };
      picker: {
        ViewId: {
          DOCS: string;
        };
        SortOrder: {
          NAME_ASCENDING: string;
        };
        Action: {
          PICKED: string;
          CANCEL: string;
          ERROR: string;
        };
        // Define the structure of the document/file object returned
        Document: {
          id: string;
          name: string;
          mimeType: string;
          url?: string;
          // Add other fields as needed based on your GoogleDriveFile interface
        };
        // Define the callback data structure
        Response: {
          action: string;
          docs: any[]; // Or: docs: Array<Window['google']['picker']['Document']>;
        };
        DocsView: any;
        PickerBuilder: any;
      };
    }
  }
}



