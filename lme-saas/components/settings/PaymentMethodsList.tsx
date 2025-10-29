'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PaymentMethodCard } from './PaymentMethodCard'
import { PlusIcon } from '@heroicons/react/24/outline'

interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account'
  cardBrand?: string
  cardLast4?: string
  cardExpMonth?: number
  cardExpYear?: number
  bankName?: string
  bankLast4?: string
  isDefault: boolean
}

interface PaymentMethodsListProps {
  paymentMethods: PaymentMethod[]
  onAddPaymentMethod: () => void
  onSetDefault: (id: string) => void
  onDelete: (id: string) => void
}

export function PaymentMethodsList({
  paymentMethods,
  onAddPaymentMethod,
  onSetDefault,
  onDelete,
}: PaymentMethodsListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>支払い方法</CardTitle>
            <CardDescription>
              登録されているお支払い方法の管理
            </CardDescription>
          </div>
          <Button onClick={onAddPaymentMethod} size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            支払い方法を追加
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              支払い方法が登録されていません
            </p>
            <Button onClick={onAddPaymentMethod}>
              <PlusIcon className="h-4 w-4 mr-2" />
              最初の支払い方法を追加
            </Button>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              {...method}
              onSetDefault={onSetDefault}
              onDelete={onDelete}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}
