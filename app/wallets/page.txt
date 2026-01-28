import { createClient } from '@/lib/supabase/server';
import ConnectUserWallets from './ConnectUserWallets';
import { WalletProviderEnum } from '@/lib/wallet/types/WalletProviderEnum';
import type { UserWalletDbRow } from '@/lib/wallet/types/UserWalletDbRow';

export default async function WalletsConnectPage() {
  const supabase = await createClient();

  const { data: wallets, error } = await supabase
    .from('user_wallets')
    .select('id, provider, wallet_address, is_active')
    .eq('is_active', true);

  if (error) {
    throw new Error(error.message);
  }

  return <ConnectUserWallets wallets={(wallets ?? []) as UserWalletDbRow[]} />;
}
