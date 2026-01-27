export type UserWalletDbRow = {
  id: string
  user_id: string
  wallet_provider: string
  wallet_address: string
  chain_id: number
  token_address: string
  token_sym: string
  token_dec: number
  token_name: string
  icon_path: string | null
  explorer_url: string | null
  // Flags
  is_default:boolean
  is_active: boolean
  created_at: string
  updated_at: string
} | undefined
