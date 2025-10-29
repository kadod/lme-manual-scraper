'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

// Safely initialize Stripe with environment variable validation
const getStripePromise = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!publishableKey) {
    console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables')
    return null
  }

  return loadStripe(publishableKey)
}

const stripePromise = getStripePromise()

interface AddPaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function PaymentForm({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || '支払い方法の追加に失敗しました')
        setProcessing(false)
        return
      }

      // Create PaymentMethod
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        elements,
      })

      if (paymentMethodError) {
        setError(paymentMethodError.message || '支払い方法の追加に失敗しました')
        setProcessing(false)
        return
      }

      // Call server action to attach payment method to customer
      const response = await fetch('/api/billing/add-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
        }),
      })

      if (!response.ok) {
        throw new Error('支払い方法の追加に失敗しました')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '支払い方法の追加に失敗しました')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={!stripe || processing}>
          {processing ? '処理中...' : '支払い方法を追加'}
        </Button>
      </div>
    </form>
  )
}

export function AddPaymentMethodDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddPaymentMethodDialogProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check if Stripe is configured
  if (!stripePromise) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>支払い方法を追加</DialogTitle>
            <DialogDescription>
              クレジットカードまたは銀行口座情報を入力してください
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              Stripe が設定されていません。環境変数 NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY を設定してください。
            </AlertDescription>
          </Alert>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Fetch setup intent when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    if (isOpen && !clientSecret) {
      try {
        setError(null)
        const response = await fetch('/api/billing/setup-intent', {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('セットアップに失敗しました')
        }

        const data = await response.json()

        if (!data.clientSecret) {
          throw new Error('無効なレスポンスです')
        }

        setClientSecret(data.clientSecret)
      } catch (error) {
        console.error('Failed to create setup intent:', error)
        setError(error instanceof Error ? error.message : 'セットアップに失敗しました')
      }
    }
    onOpenChange(isOpen)
  }

  const options: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }
    : undefined

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>支払い方法を追加</DialogTitle>
          <DialogDescription>
            クレジットカードまたは銀行口座情報を入力してください
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : clientSecret && options ? (
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm
              onSuccess={() => {
                onSuccess?.()
                onOpenChange(false)
              }}
              onCancel={() => onOpenChange(false)}
            />
          </Elements>
        ) : (
          <div className="py-8 text-center text-gray-600">読み込み中...</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
