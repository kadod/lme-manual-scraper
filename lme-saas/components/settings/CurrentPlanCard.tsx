'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface CurrentPlanCardProps {
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'paused'
  currentPeriodEnd?: string
  trialEnd?: string
  cancelAtPeriodEnd?: boolean
  onUpgrade?: () => void
  onCancel?: () => void
}

const PLAN_DETAILS = {
  free: {
    name: 'Free プラン',
    price: '¥0',
    color: 'bg-gray-100 text-gray-800',
  },
  pro: {
    name: 'Pro プラン',
    price: '¥9,800/月',
    color: 'bg-blue-100 text-blue-800',
  },
  enterprise: {
    name: 'Enterprise プラン',
    price: 'カスタム',
    color: 'bg-purple-100 text-purple-800',
  },
}

const STATUS_LABELS = {
  active: { label: '有効', color: 'bg-green-100 text-green-800' },
  trialing: { label: 'トライアル中', color: 'bg-blue-100 text-blue-800' },
  past_due: { label: '支払い期限切れ', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'キャンセル済み', color: 'bg-gray-100 text-gray-800' },
  paused: { label: '一時停止中', color: 'bg-yellow-100 text-yellow-800' },
}

export function CurrentPlanCard({
  plan,
  status,
  currentPeriodEnd,
  trialEnd,
  cancelAtPeriodEnd,
  onUpgrade,
  onCancel,
}: CurrentPlanCardProps) {
  const planDetails = PLAN_DETAILS[plan]
  const statusLabel = STATUS_LABELS[status]

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>現在のプラン</CardTitle>
            <CardDescription>プランと請求の管理</CardDescription>
          </div>
          {plan !== 'enterprise' && onUpgrade && (
            <Button onClick={onUpgrade}>
              プランをアップグレード
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Info */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge className={planDetails.color}>
                {planDetails.name}
              </Badge>
              <Badge className={statusLabel.color}>
                {statusLabel.label}
              </Badge>
            </div>
            <div className="text-2xl font-bold">{planDetails.price}</div>
          </div>
        </div>

        {/* Trial Info */}
        {status === 'trialing' && trialEnd && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">トライアル期間中</p>
              <p className="text-sm text-blue-700">
                {formatDate(trialEnd)}まで無料でご利用いただけます
              </p>
            </div>
          </div>
        )}

        {/* Active Subscription Info */}
        {status === 'active' && currentPeriodEnd && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900">サブスクリプション有効</p>
              <p className="text-sm text-green-700">
                次回更新日: {formatDate(currentPeriodEnd)}
              </p>
              {cancelAtPeriodEnd && (
                <p className="text-sm text-orange-700 mt-1">
                  このプランは{formatDate(currentPeriodEnd)}に終了します
                </p>
              )}
            </div>
          </div>
        )}

        {/* Past Due Warning */}
        {status === 'past_due' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-medium text-red-900">支払いの問題が発生しています</p>
            <p className="text-sm text-red-700 mt-1">
              お支払い方法を更新してください。更新されない場合、サービスが停止される可能性があります。
            </p>
          </div>
        )}

        {/* Cancel Subscription */}
        {plan !== 'free' && status === 'active' && !cancelAtPeriodEnd && onCancel && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={onCancel}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              サブスクリプションをキャンセル
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
