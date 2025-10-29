"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartBarIcon, ClockIcon, BanknotesIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline"

interface UsageStats {
  totalTokens: number
  apiCalls: number
  estimatedCost: number
  errorRate: number
  lastUpdated: string
}

interface AIUsageStatsProps {
  stats: UsageStats
}

export function AIUsageStats({ stats }: AIUsageStatsProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const statItems = [
    {
      title: "トークン使用量",
      value: formatNumber(stats.totalTokens),
      icon: ChartBarIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      unit: "tokens"
    },
    {
      title: "API呼び出し回数",
      value: formatNumber(stats.apiCalls),
      icon: ClockIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
      unit: "回"
    },
    {
      title: "推定コスト",
      value: formatCurrency(stats.estimatedCost),
      icon: BanknotesIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      unit: ""
    },
    {
      title: "エラー率",
      value: `${stats.errorRate.toFixed(1)}%`,
      icon: ExclamationCircleIcon,
      color: stats.errorRate > 5 ? "text-red-600" : "text-gray-600",
      bgColor: stats.errorRate > 5 ? "bg-red-50" : "bg-gray-50",
      unit: ""
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>使用状況モニタリング</CardTitle>
        <CardDescription>
          AI応答の使用状況とコストを確認できます
          <span className="block mt-1 text-xs">
            最終更新: {new Date(stats.lastUpdated).toLocaleString('ja-JP')}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {statItems.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">{item.title}</p>
                <p className="text-2xl font-bold mt-1">
                  {item.value}
                  {item.unit && (
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      {item.unit}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {stats.errorRate > 5 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-yellow-900">
                  エラー率が高くなっています
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  API設定やプロンプト設定を見直すことをお勧めします
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            コスト見積もりについて
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• GPT-4: $0.03/1K tokens (input), $0.06/1K tokens (output)</li>
            <li>• GPT-4 Turbo: $0.01/1K tokens (input), $0.03/1K tokens (output)</li>
            <li>• GPT-3.5 Turbo: $0.0015/1K tokens (input), $0.002/1K tokens (output)</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            ※ 実際の料金はOpenAIの請求内容をご確認ください
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
