import { browserConsoleLog, consoleLog } from "@/lib/utils"
import { UserWalletDbRow } from "./types/UserWalletDbRow"

export function mapUserWalletRow(data: any): UserWalletDbRow | undefined {

    if (!data) {
        browserConsoleLog('(lib/web3/db/mapping.ts -> mapUserWalletRow): input (data) is undefined')
        return undefined
    }

    return {
    id: data.id,
    user_id: data.user_id,
    wallet_provider: data.wallet_provider,
    wallet_address: data.wallet_address,
    chain_id: data.chain_id,
    token_address: data.token_address,
    token_sym: data.token_sym,
    token_dec: data.token_dec,
    token_name: data.token_name,
    icon_path: data.icon_path,
    explorer_url: data.explorer_url,
    is_active: data.is_active,
    is_default: data.is_default,
    created_at: data.created_at,
    updated_at: data.updated_at,
    }
}

export function mapUserWalletRows(
  rows: any[] | null | undefined
): UserWalletDbRow[] | undefined {
  if (!rows || rows.length === 0) return undefined

  return rows.map(mapUserWalletRow)
}
