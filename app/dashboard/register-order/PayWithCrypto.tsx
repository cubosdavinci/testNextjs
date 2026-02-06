'use client'

import { useEffect } from 'react'
import { useActionState } from 'react'
import { createOrderAction } from './actions/createOrderAction'
import type { CreateOrderState} from './actions/createOrderAction'
//import { EscrowV1_ABI } from './ABI/registerEscrow'

type PayWithCryptoProps = {
  productId: string
  licenseId: string
}

export default function PayWithCrypto({ productId, licenseId }: PayWithCryptoProps) {
  // Server action hook
  const [data, createOrder, pending] = useActionState<CreateOrderState, FormData>(createOrderAction, {})

  // Automatically trigger payOrder when server response arrives
  useEffect(() => {
    if (data?.errors /*&& data.errors.length > 0*/) {
  // Show all error messages
  //const messages = data.errors.map((e: any) => e.message).join('\n')
  console.log(`Errors:\n${data.errors.message}`)
} else if (data?.order) {
  // No errors, show order and signature
  console.log(`Order: ${JSON.stringify(data.order)}\nSignature: ${data.signature}`)
} else {
  console.log('Unknown error')
}
   /* if (data?.order) {
      // Only call payOrder if order exists
      
      payOrder(data.order)
    }*/
  }, [data])

  // Placeholder function for now
  const payOrder = (order: any) => {
    // Implementation to be done later
    console.log('payOrder triggered with:', order)
  }

  
  return (
    <form action={createOrder}>
      {/* Hidden inputs instead of radio/visible inputs */}
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="licenseId" value={licenseId} />

      <button type="submit" disabled={pending}>
        {pending ? "Processing..." : "Create Order"}
      </button>
    </form>
  )
}
