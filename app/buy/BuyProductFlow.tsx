'use client'

import { useState } from 'react'
import { Spinner } from '@/components/auth/spinner'

type BuyStep =
  | 'creating'
  | 'signing'
  | 'submitting'
  | 'confirming'
  | 'ready'
  | 'error'

export function BuyProductFlow({
  productId,
  onClose,
}: {
  productId: string
  onClose: () => void
}) {
  const [step, setStep] = useState<BuyStep>('creating')
  const [label, setLabel] = useState('Creating order…')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  // Start immediately on mount
  useState(() => {
    runFlow()
  })

  async function runFlow() {
    try {
      // 1️⃣ Create order
      setLabel('Creating order…')
      const order = await fetch('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }).then(r => r.json())

      // 2️⃣ Sign permit
      setStep('signing')
      setLabel('Please sign to authorize purchase')

      const signature = await signPermit(order.permit)

      // 3️⃣ Submit transaction
      setStep('submitting')
      setLabel('Submitting transaction…')

      await fetch('/api/orders/submit', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          signature,
        }),
      })

      // 4️⃣ Confirm + poll
      setStep('confirming')
      setLabel('Waiting for confirmation…')

      const poll = async () => {
        const res = await fetch(`/api/orders/${order.id}`).then(r => r.json())
        if (res.status === 'completed') {
          setDownloadUrl(res.downloadUrl)
          setStep('ready')
        } else {
          setTimeout(poll, 2000)
        }
      }

      poll()
    } catch {
      setStep('error')
      setLabel('Purchase failed')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-background p-6 rounded w-[320px] text-center">
        {step !== 'ready' ? (
          <Spinner label={label} />
        ) : (
          <a
            href={downloadUrl!}
            onClick={onClose}
            className="block w-full px-4 py-2 rounded bg-primary text-white"
          >
            Download product
          </a>
        )}
      </div>
    </div>
  )
}
