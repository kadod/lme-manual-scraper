'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { pauseCampaign, resumeCampaign, deleteCampaign, duplicateCampaign } from '@/app/actions/campaigns'

interface Campaign {
  id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  trigger_type: 'friend_add' | 'tag_add' | 'form_submit' | 'manual'
  total_subscribers: number
  active_subscribers: number
  completed_subscribers: number
  created_at: string
}

interface CampaignListProps {
  campaigns: Campaign[]
}

const statusConfig = {
  draft: { label: '下書き', color: 'bg-gray-500' },
  active: { label: 'アクティブ', color: 'bg-green-500' },
  paused: { label: '一時停止', color: 'bg-yellow-500' },
  completed: { label: '完了', color: 'bg-blue-500' },
}

const triggerTypeLabels = {
  friend_add: '友だち追加',
  tag_add: 'タグ追加',
  form_submit: 'フォーム送信',
  manual: '手動',
}

export function CampaignList({ campaigns }: CampaignListProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePause = async (campaignId: string) => {
    setLoading(campaignId)
    try {
      const result = await pauseCampaign(campaignId)
      if (result.error) {
        alert(`エラー: ${result.error}`)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleResume = async (campaignId: string) => {
    setLoading(campaignId)
    try {
      const result = await resumeCampaign(campaignId)
      if (result.error) {
        alert(`エラー: ${result.error}`)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (campaignId: string, campaignName: string) => {
    if (!confirm(`「${campaignName}」を削除してもよろしいですか？この操作は取り消せません。`)) {
      return
    }

    setLoading(campaignId)
    try {
      const result = await deleteCampaign(campaignId)
      if (result.error) {
        alert(`エラー: ${result.error}`)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleDuplicate = async (campaignId: string) => {
    setLoading(campaignId)
    try {
      const result = await duplicateCampaign(campaignId)
      if (result.error) {
        alert(`エラー: ${result.error}`)
      }
    } finally {
      setLoading(null)
    }
  }

  const calculateCompletionRate = (campaign: Campaign) => {
    if (campaign.total_subscribers === 0) return 0
    return Math.round((campaign.completed_subscribers / campaign.total_subscribers) * 100)
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClockIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">ステップ配信キャンペーンがありません</p>
          <p className="text-sm text-muted-foreground mb-4">
            新しいキャンペーンを作成して、自動配信を開始しましょう
          </p>
          <Link href="/dashboard/messages/step-campaigns/new">
            <Button>新規キャンペーン作成</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => {
        const completionRate = calculateCompletionRate(campaign)
        const status = statusConfig[campaign.status]

        return (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{campaign.name}</CardTitle>
                  {campaign.description && (
                    <CardDescription className="text-sm">
                      {campaign.description}
                    </CardDescription>
                  )}
                </div>
                <Badge className={`${status.color} text-white ml-2`}>
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <span className="inline-flex items-center">
                  トリガー: {triggerTypeLabels[campaign.trigger_type]}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <UserGroupIcon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-2xl font-bold">{campaign.total_subscribers}</div>
                  <div className="text-xs text-muted-foreground">登録者</div>
                </div>
                <div>
                  <ClockIcon className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <div className="text-2xl font-bold">{campaign.active_subscribers}</div>
                  <div className="text-xs text-muted-foreground">進行中</div>
                </div>
                <div>
                  <CheckCircleIcon className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <div className="text-2xl font-bold">{campaign.completed_subscribers}</div>
                  <div className="text-xs text-muted-foreground">完了</div>
                </div>
              </div>

              {/* Completion Rate */}
              {campaign.total_subscribers > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">完了率</span>
                    <span className="font-medium">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/messages/step-campaigns/${campaign.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    詳細
                  </Button>
                </Link>

                {campaign.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePause(campaign.id)}
                    disabled={loading === campaign.id}
                  >
                    <PauseIcon className="h-4 w-4" />
                  </Button>
                )}

                {(campaign.status === 'paused' || campaign.status === 'draft') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResume(campaign.id)}
                    disabled={loading === campaign.id}
                  >
                    <PlayIcon className="h-4 w-4" />
                  </Button>
                )}

                <Link href={`/dashboard/messages/step-campaigns/${campaign.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(campaign.id)}
                  disabled={loading === campaign.id}
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(campaign.id, campaign.name)}
                  disabled={loading === campaign.id}
                  className="text-red-500 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
