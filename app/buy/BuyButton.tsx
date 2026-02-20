'use client'

import { useState } from 'react'
import { BuyProductFlow } from './BuyProductFlow'

export function BuyButton({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded bg-primary text-white"
      >
        Buy
      </button>

      {open && (
        <BuyProductFlow
          productId={productId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
