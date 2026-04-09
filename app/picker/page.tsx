'use client';

import { useState, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { supabaseBrowser } from "@/lib/supabase/clients/supabaseBrowser"; // Your helper path
import { browserConsoleLog } from '@/lib/utils';

export default function DriveTestPage() {
  const [openPicker] = useDrivePicker();
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      const supabase = supabaseBrowser();
      
      // 1. Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 2. Fetch the token from your table via RLS
        const { data, error } = await supabase
          .from('user_google_credentials')
          .select('id, access_token')
          .single();
        browserConsoleLog("supabase Data", data);
        browserConsoleLog("Supabase Error", error);
  
        if (data?.access_token) {
          // NOTE: You should ideally call your /api/google/picker-token 
          // route here instead of reading the raw DB to ensure 
          // the token is refreshed if it's expired!
          const res = await fetch(`/api/google/picker-token?id=${data.id}`);
          const refreshed = await res.json();
          setGoogleToken(refreshed.accessToken);
        }
      }
      setIsLoading(false);
    }

    fetchToken();
  }, []);

  if (isLoading) return <div>Loading connection status...</div>;

  // ... rest of your handleOpenPicker and return JSX ...
}