export function toWalletUI(row: WalletRow) {
    return {
        user_id: row.user_id,
        wallet_provider: row.wallet_provider,
        wallet_address: row.wallet_address,
        chain_id: row.chain_id,
        token_sym: row.token_sym,
        // intentionally exclude token_address if needed
    };
}