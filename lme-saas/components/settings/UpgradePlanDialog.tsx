'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface UpgradePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan: 'free' | 'pro' | 'enterprise'
  targetPlan: 'free' | 'pro' | 'enterprise'
  onConfirm: () => Promise<void>
}

const PLAN_DETAILS = {
  free: {
    name: 'Free プラン',
    price: '¥0',
    features: ['基本的なメッセージ配信', '友だち管理', 'タグ・セグメント機能'],
  },
  pro: {
    name: 'Pro プラン',
    price: '¥9,800/月',
    features: [
      '高度なセグメント機能',
      '予約管理システム',
      '詳細な分析レポート',
      'URL短縮・トラッキング',
      '優先サポート',
    ],
  },
  enterprise: {
    name: 'Enterprise プラン',
    price: 'カスタム',
    features: [
      '無制限の友だち',
      '無制限のメッセージ配信',
      '専任サポート担当',
      'SLA保証',
      'カスタム機能開発',
    ],
  },
}

export function UpgradePlanDialog({
  open,
  onOpenChange,
  currentPlan,
  targetPlan,
  onConfirm,
}: UpgradePlanDialogProps) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const targetPlanDetails = PLAN_DETAILS[targetPlan]
  const isUpgrade = targetPlan !== 'free'
  const isEnterprise = targetPlan === 'enterprise'

  const handleConfirm = async () => {
    if (isEnterprise) {
      // Redirect to contact form for Enterprise
      window.location.href = '/contact?plan=enterprise'
      return
    }

    setProcessing(true)
    setError(null)

    try {
      await onConfirm()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プランの変更に失敗しました')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isUpgrade ? 'プランをアップグレード' : 'プランを変更'}
          </DialogTitle>
          <DialogDescription>
            {isEnterprise
              ? 'Enterprise プランについては、お問い合わせフォームからご連絡ください'
              : `${targetPlanDetails.name}に変更します`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Plan Details */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-lg mb-2">{targetPlanDetails.name}</h4>
            <p className="text-2xl font-bold text-blue-900 mb-3">
              {targetPlanDetails.price}
            </p>
            <ul className="space-y-2">
              {targetPlanDetails.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Billing Information */}
          {isUpgrade && !isEnterprise && (
            <Alert>
              <AlertDescription>
                プランは即座にアップグレードされ、日割り計算で請求されます。
                次回の請求日から新しい料金プランが適用されます。
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processing}
          >
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={processing}>
            {processing
              ? '処理中...'
              : isEnterprise
              ? 'お問い合わせフォームへ'
              : '変更を確定'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
