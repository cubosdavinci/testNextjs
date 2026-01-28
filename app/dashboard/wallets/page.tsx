"use client"
import RegisterNewWallet from "./RegisterNewWallet"
import YourWallets from "./YourWallets"

export default function WalletsPage() {
return (
<div className="space-y-12">
{/* Add Wallet Section */}
<section>
<h2 className="text-xl font-semibold mb-4">Add Wallet</h2>
<RegisterNewWallet />
</section>


{/* Registered Wallets Section */}
<section>
<h2 className="text-xl font-semibold mb-4">Your Wallets</h2>
<YourWallets />
</section>
</div>
)
}