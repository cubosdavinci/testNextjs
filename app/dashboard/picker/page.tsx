import { supabaseServer } from '@/lib/supabase/clients/supabaseServer';
import { GoogleAuthService } from '@/lib/services/google/GoogleAuthService'; // Your implementation
import DriveManager from './DriveManager';

export default async function DrivePage() {
  // 1. Initialize Supabase Server Client
  const supabase = await supabaseServer();
  
  // 2. Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-6">Please log in to view your files.</div>;
  }

  // 3. Initialize your service
  // Pass the supabase instance if your service needs it to perform queries
  const googleService = new GoogleAuthService();

  // 4. Fetch accounts directly from the service
  const accounts = await googleService.getLinkedAccounts(user.id);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Google Drive Manager</h1>
      {/* Pass the server-fetched accounts directly to the component */}
      <DriveManager initialAccounts={accounts} />
    </div>
  );
}