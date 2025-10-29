'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckIcon } from '@heroicons/react/24/outline'

interface Plan {
  id: 'free' | 'pro' | 'enterprise'
  name: string
  price: string
  priceDetail?: string
  description: string
  features: string[]
  limits: {
    friends: string
    messages: string
    staff: string
    forms: string
    richMenus: string
    api: string
  }
  popular?: boolean
}

interface PlanComparisonCardsProps {
  currentPlan: 'free' | 'pro' | 'enterprise'
  onSelectPlan: (plan: 'free' | 'pro' | 'enterprise') => void
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '¥0',
    priceDetail: '永久無料',
    description: '個人利用や小規模ビジネスに最適',
    features: [
      '基本的なメッセージ配信',
      '友だち管理',
      'タグ・セグメント機能',
      'フォーム作成',
      '基本的な分析機能',
      'コミュニティサポート',
    ],
    limits: {
      friends: '1,000人',
      messages: '5,000通/月',
      staff: '3人',
      forms: '10個',
      richMenus: '5個',
      api: '1,000回/日',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '¥9,800',
    priceDetail: '/月',
    description: '成長するビジネスに最適',
    features: [
      'Freeの全機能',
      '高度なセグメント機能',
      'リッチメニュー無制限',
      '予約管理システム',
      '詳細な分析レポート',
      'URL短縮・トラッキング',
      'カスタムレポート',
      '優先サポート',
      'Webhook統合',
    ],
    limits: {
      friends: '10,000人',
      messages: '50,000通/月',
      staff: '10人',
      forms: '無制限',
      richMenus: '無制限',
      api: '10,000回/日',
    },
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'カスタム',
    description: '大規模組織向けの完全カスタマイズプラン',
    features: [
      'Proの全機能',
      '無制限の友だち',
      '無制限のメッセージ配信',
      '無制限のスタッフアカウント',
      '専任サポート担当',
      'SLA保証',
      'カスタム機能開発',
      'オンボーディング支援',
      'セキュリティ監査',
      'データエクスポート',
    ],
    limits: {
      friends: '無制限',
      messages: '無制限',
      staff: '無制限',
      forms: '無制限',
      richMenus: '無制限',
      api: '無制限',
    },
  },
]

export function PlanComparisonCards({ currentPlan, onSelectPlan }: PlanComparisonCardsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">プラン比較</h3>
        <p className="text-sm text-gray-600">
          あなたのビジネスに最適なプランをお選びください
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? 'border-blue-500 border-2 shadow-lg' : ''
              } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500">人気</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500">現在のプラン</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.priceDetail && (
                    <span className="text-gray-600 ml-1">{plan.priceDetail}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">主な機能:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limits */}
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700">制限:</p>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">友だち:</dt>
                      <dd className="font-medium">{plan.limits.friends}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">配信:</dt>
                      <dd className="font-medium">{plan.limits.messages}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">スタッフ:</dt>
                      <dd className="font-medium">{plan.limits.staff}</dd>
                    </div>
                  </dl>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={isCurrent}
                >
                  {isCurrent
                    ? '現在のプラン'
                    : plan.id === 'enterprise'
                    ? 'お問い合わせ'
                    : plan.id === 'pro'
                    ? 'アップグレード'
                    : '選択'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
