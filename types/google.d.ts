export {};
declare global {
  interface Window {
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
    };
  }
}