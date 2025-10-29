'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCardIcon, TrashIcon } from '@heroicons/react/24/outline'

interface PaymentMethodCardProps {
  id: string
  type: 'card' | 'bank_account'
  cardBrand?: string
  cardLast4?: string
  cardExpMonth?: number
  cardExpYear?: number
  bankName?: string
  bankLast4?: string
  isDefault: boolean
  onSetDefault?: (id: string) => void
  onDelete?: (id: string) => void
}

const CARD_BRANDS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  jcb: 'JCB',
  diners: 'Diners Club',
  discover: 'Discover',
  unionpay: 'UnionPay',
}

export function PaymentMethodCard({
  id,
  type,
  cardBrand,
  cardLast4,
  cardExpMonth,
  cardExpYear,
  bankName,
  bankLast4,
  isDefault,
  onSetDefault,
  onDelete,
}: PaymentMethodCardProps) {
  const brandName = cardBrand ? CARD_BRANDS[cardBrand] || cardBrand : ''
  const expiration = cardExpMonth && cardExpYear ? `${cardExpMonth}/${cardExpYear}` : ''

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
              <CreditCardIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              {type === 'card' ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {brandName} •••• {cardLast4}
                    </span>
                    {isDefault && (
                      <Badge variant="outline" className="text-xs">
                        デフォルト
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    有効期限: {expiration}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {bankName} •••• {bankLast4}
                    </span>
                    {isDefault && (
                      <Badge variant="outline" className="text-xs">
                        デフォルト
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">銀行口座</p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isDefault && onSetDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetDefault(id)}
              >
                デフォルトに設定
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
