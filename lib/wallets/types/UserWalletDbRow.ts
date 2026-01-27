// lib/types/WalletDbRow.ts
import { WalletProviderEnum } from '@/lib/wallet/types/WalletProviderEnum';

export type UserWalletDbRow = {
  id: string;
  provider: WalletProviderEnum;
  wallet_address: string;
  is_active: boolean;
};
