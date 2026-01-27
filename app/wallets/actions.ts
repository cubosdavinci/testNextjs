'use server';

import { createClient } from '@/lib/supabase/server';
import { ethers } from 'ethers';
import crypto from 'crypto';
import { WalletProviderEnum } from '@/lib/wallet/types/WalletProviderEnum';
import type { UserWalletDbRow } from '@/lib/wallet/types/UserWalletDbRow';
import { consoleLog } from '@/lib/utils';

/**
 * Step 1: Request nonce and message
 */
export async function connectWallet(provider: WalletProviderEnum) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const nonce = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const message = `Verify wallet ownership
User: ${user.id}
Provider: ${provider}
Nonce: ${nonce}
Expires: ${expiresAt.toISOString()}`;

  await supabase.from('wallet_nonces').insert({
    user_id: user.id,
    nonce,
    expires_at: expiresAt,
    message,
  });

  return { message, nonce };
}

/**
 * Step 2: Verify wallet signature
 */
export async function verifyWallet({
  provider,
  walletAddress,
  signature,
  nonce,
}: {
  provider: WalletProviderEnum;
  walletAddress: string;
  signature: string;
  nonce: string;
}): Promise<UserWalletDbRow> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Validate provider is in the enum
  consoleLog("provider (arg)", provider);
  consoleLog("WalletProviderEnum (arg)", WalletProviderEnum);

  if (!Object.values(WalletProviderEnum).includes(provider)) {
    throw new Error('Invalid wallet provider');
  }

  // Fetch nonce row
  const { data: nonceRow } = await supabase
    .from('wallet_nonces')
    .select('*')
    .eq('nonce', nonce)
    .eq('user_id', user.id)
    .single();

  if (!nonceRow) throw new Error('Invalid nonce');
  if (new Date(nonceRow.expires_at) < new Date())
    throw new Error('Nonce expired');

  // Verify signature
  const recovered = ethers.verifyMessage(nonceRow.message, signature);
  if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error('Signature mismatch');
  }

  // Insert wallet using RPC, return the inserted row
  const { data: walletRow, error } = await supabase
    .rpc('add_verified_wallet', {
      p_user_id: user.id,
      p_wallet_address: walletAddress,
      p_provider: provider,
    })
    .single();

  if (error) throw error;

  // Cleanup nonce
  await supabase.from('wallet_nonces').delete().eq('id', nonceRow.id);

  // Return typed wallet row
  return walletRow as UserWalletDbRow;
}

/**
 * Step 3: Delete wallet
 */
export async function deleteWallet(walletId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('user_wallets')
    .delete()
    .eq('id', walletId);

  if (error) throw error;
}
