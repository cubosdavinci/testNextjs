"use client"


import { useEffect, useState } from "react"
import { WalletService } from "wallet/service"


const service = new WalletService()

export default function YourWallets() {
const [wallets, setWallets] = useState<any[]>([])


useEffect(() => {
service.getWallets().then((w) => setWallets(w || []))
}, [])


async function removeWallet(id: string) {
await service["repo"].deactivate(id)
setWallets((prev) => prev.filter((w) => w.id !== id))
}


return (
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{wallets.map((w) => (
<div
key={w.id}
className="border rounded-lg p-4 relative shadow"
>
<button
onClick={() => removeWallet(w.id)}
className="absolute top-2 right-2 text-red-600"
>
✕
</button>


<div className="font-semibold">
{w.wallet_provider}
</div>


<div className="text-sm mt-1">
{w.wallet_address.slice(0, 6)}...
{w.wallet_address.slice(-4)}
</div>


<div className="text-sm mt-1">
Chain: {w.chain_id}
</div>


<div className="text-sm mt-1">
Token: {w.token_address}
</div>
</div>
))}
</div>
)
}