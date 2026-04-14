'use client';

import ConnectGoogle from '@/components/auth/google/ConnectGoogle';
import ErrorAlert from '@/components/banners/ErrorAlert';
import Card_GoogleAccount from '@/components/auth/google/ui/Card_GoogleAccount';
import { useGoogle } from '@/context/GoogleContext'; // Updated import

export default function ConnectGoogleAccountPage() {
  const {
    googleAccounts,
    isLoading,
    error,
    refreshAccounts,
    removeLinkedAccount,
    disconnectLinkedAccount,
    // clearError (optional: if you want to use it for the Alert)
  } = useGoogle();

  // Calculate the count safely
  const accountCount = googleAccounts?.length ?? 0;

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading Google accounts...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Linked Google Accounts</h1>

      {/* Error Handling */}
      {error && (
        <ErrorAlert
          message={error}
          onClose={refreshAccounts} // Refreshing acts as a reset/retry
        />
      )}

      {/* Connected Accounts List */}
      {googleAccounts && googleAccounts.length > 0 ? (
        <div className="space-y-4">          
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Connected Accounts</h2>
            <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
              {accountCount} / 5 Accounts Linked
            </span>
          </div>

          {googleAccounts.map((account) => (
            <Card_GoogleAccount
              key={account.id}
              googleAccount={account}
              removeLinkedAccount={removeLinkedAccount}
              disconnectLinkedAccount={disconnectLinkedAccount}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">No accounts connected yet.</p>
      )}

      {/* Connect New Account Section */}      
      {accountCount < 5 && (
        <div className="pt-6 border-t">
          <h2 className="text-lg font-semibold mb-4">Connect New Account</h2>
          <ConnectGoogle />
        </div>
      )}
    </div>
  );
}