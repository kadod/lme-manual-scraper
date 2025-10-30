'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  UsersIcon,
  TagIcon,
  UserGroupIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { getTargetCount } from '@/lib/actions/messages'

export type TargetType = 'all' | 'segments' | 'tags' | 'manual'

interface TargetSelectorProps {
  targetType: TargetType
  targetIds: string[]
  excludeBlocked: boolean
  excludeUnsubscribed: boolean
  onChange: (field: string, value: any) => void
  segments?: Array<{ id: string; name: string }>
  tags?: Array<{ id: string; name: string; color: string }>
}

export function TargetSelector({
  targetType,
  targetIds,
  excludeBlocked,
  excludeUnsubscribed,
  onChange,
  segments = [],
  tags = [],
}: TargetSelectorProps) {
  const [estimatedCount, setEstimatedCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCount = async () => {
      setIsLoading(true)
      try {
        const count = await getTargetCount(
          targetType,
          targetIds
        )
        setEstimatedCount(count)
      } catch (error) {
        console.error('ターゲット数取得エラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCount()
  }, [targetType, targetIds])

  const toggleTargetId = (id: string) => {
    const newIds = targetIds.includes(id)
      ? targetIds.filter(tid => tid !== id)
      : [...targetIds, id]
    onChange('targetIds', newIds)
  }

  return (
    <div className="space-y-6">
      {/* ターゲットタイプ選択 */}
      <div className="space-y-4">
        <Label>配信先</Label>
        <RadioGroup
          value={targetType}
          onValueChange={(value) => {
            onChange('targetType', value)
            onChange('targetIds', [])
          }}
        >
          <div className="space-y-3">
            <Label
              htmlFor="all"
              className={`
                flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer
                transition-all hover:border-primary/50
                ${targetType === 'all' ? 'border-primary bg-primary/5' : 'border-muted'}
              `}
            >
              <RadioGroupItem id="all" value="all" />
              <UsersIcon className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">全員</div>
                <div className="text-sm text-muted-foreground">すべての友だちに配信</div>
              </div>
            </Label>

            <Label
              htmlFor="segments"
              className={`
                flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer
                transition-all hover:border-primary/50
                ${targetType === 'segments' ? 'border-primary bg-primary/5' : 'border-muted'}
              `}
            >
              <RadioGroupItem id="segments" value="segments" />
              <UserGroupIcon className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">セグメント</div>
                <div className="text-sm text-muted-foreground">セグメント条件で配信</div>
              </div>
            </Label>

            <Label
              htmlFor="tags"
              className={`
                flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer
                transition-all hover:border-primary/50
                ${targetType === 'tags' ? 'border-primary bg-primary/5' : 'border-muted'}
              `}
            >
              <RadioGroupItem id="tags" value="tags" />
              <TagIcon className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">タグ</div>
                <div className="text-sm text-muted-foreground">タグで絞り込んで配信</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* セグメント選択 */}
      {targetType === 'segments' && (
        <div className="space-y-3">
          <Label>セグメント選択</Label>
          {segments.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {segments.map((segment) => (
                <Button
                  key={segment.id}
                  type="button"
                  variant={targetIds.includes(segment.id) ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => toggleTargetId(segment.id)}
                >
                  {targetIds.includes(segment.id) && (
                    <CheckIcon className="h-4 w-4 mr-2" />
                  )}
                  {segment.name}
                </Button>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                セグメントが登録されていません
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* タグ選択 */}
      {targetType === 'tags' && (
        <div className="space-y-3">
          <Label>タグ選択（複数選択可）</Label>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={targetIds.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-2 hover:opacity-80 transition-opacity"
                  style={
                    targetIds.includes(tag.id)
                      ? { backgroundColor: tag.color, borderColor: tag.color }
                      : {}
                  }
                  onClick={() => toggleTargetId(tag.id)}
                >
                  {targetIds.includes(tag.id) && (
                    <CheckIcon className="h-3 w-3 mr-1" />
                  )}
                  {tag.name}
                </Badge>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                タグが登録されていません
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 除外設定 */}
      <div className="space-y-4">
        <Label>除外設定</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="excludeBlocked" className="font-normal cursor-pointer">
                ブロック済みを除外
              </Label>
              <p className="text-sm text-muted-foreground">
                ブロックしている友だちには配信しません
              </p>
            </div>
            <Switch
              id="excludeBlocked"
              checked={excludeBlocked}
              onCheckedChange={(checked) => onChange('excludeBlocked', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="excludeUnsubscribed" className="font-normal cursor-pointer">
                配信停止中を除外
              </Label>
              <p className="text-sm text-muted-foreground">
                配信停止した友だちには配信しません
              </p>
            </div>
            <Switch
              id="excludeUnsubscribed"
              checked={excludeUnsubscribed}
              onCheckedChange={(checked) => onChange('excludeUnsubscribed', checked)}
            />
          </div>
        </div>
      </div>

      {/* 予想配信数 */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">予想配信数</div>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${estimatedCount.toLocaleString()}人`
                )}
              </div>
            </div>
            <UsersIcon className="h-10 w-10 text-primary/30" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
