'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClockIcon, TagIcon } from '@heroicons/react/24/outline'
import {
  TimeCondition,
  FriendCondition,
  LimitCondition,
} from '@/types/auto-response'

interface ConditionBuilderProps {
  timeConditions?: TimeCondition[]
  friendConditions?: FriendCondition
  limitConditions?: LimitCondition
  onChange: (field: string, value: any) => void
  tags?: Array<{ id: string; name: string; color: string }>
  segments?: Array<{ id: string; name: string }>
}

export function ConditionBuilder({
  timeConditions = [],
  friendConditions,
  limitConditions,
  onChange,
  tags = [],
  segments = [],
}: ConditionBuilderProps) {
  const handleTimeConditionChange = (field: string, value: any) => {
    const condition = timeConditions[0] || {
      days: [],
      startTime: '00:00',
      endTime: '23:59',
    }
    const updated = { ...condition, [field]: value }
    onChange('timeConditions', [updated])
  }

  const handleFriendConditionChange = (field: string, value: any) => {
    const condition = friendConditions || {
      tagIds: [],
      segmentIds: [],
      customFields: {},
    }
    const updated = { ...condition, [field]: value }
    onChange('friendConditions', updated)
  }

  const handleLimitConditionChange = (field: string, value: any) => {
    const condition = limitConditions || {}
    const updated = { ...condition, [field]: value }
    onChange('limitConditions', updated)
  }

  const days = [
    { value: 0, label: '日' },
    { value: 1, label: '月' },
    { value: 2, label: '火' },
    { value: 3, label: '水' },
    { value: 4, label: '木' },
    { value: 5, label: '金' },
    { value: 6, label: '土' },
  ]

  const timeCondition = timeConditions[0] || {
    days: [],
    startTime: '00:00',
    endTime: '23:59',
  }

  const toggleDay = (day: number) => {
    const currentDays = timeCondition.days || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day]
    handleTimeConditionChange('days', newDays)
  }

  return (
    <div className="space-y-6">
      {/* Time Conditions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle>時間条件</CardTitle>
          </div>
          <CardDescription>応答する曜日・時間帯を設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>曜日指定</Label>
            <div className="flex gap-2 mt-2">
              {days.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={
                    timeCondition.days.includes(day.value) ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => toggleDay(day.value)}
                  className="w-12"
                >
                  {day.label}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              未選択の場合は全ての曜日で応答します
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>開始時刻</Label>
              <Input
                type="time"
                value={timeCondition.startTime}
                onChange={(e) =>
                  handleTimeConditionChange('startTime', e.target.value)
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label>終了時刻</Label>
              <Input
                type="time"
                value={timeCondition.endTime}
                onChange={(e) =>
                  handleTimeConditionChange('endTime', e.target.value)
                }
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Friend Conditions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle>友だち条件</CardTitle>
          </div>
          <CardDescription>タグ・セグメントでフィルター</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>タグフィルター</Label>
            <Select
              value={friendConditions?.tagIds?.[0] || ''}
              onValueChange={(value) =>
                handleFriendConditionChange('tagIds', value ? [value] : [])
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="タグを選択（任意）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">タグ指定なし</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>セグメントフィルター</Label>
            <Select
              value={friendConditions?.segmentIds?.[0] || ''}
              onValueChange={(value) =>
                handleFriendConditionChange('segmentIds', value ? [value] : [])
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="セグメントを選択（任意）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">セグメント指定なし</SelectItem>
                {segments.map((segment) => (
                  <SelectItem key={segment.id} value={segment.id}>
                    {segment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Limit Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>回数制限</CardTitle>
          <CardDescription>応答回数の上限を設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>1人あたりの応答回数</Label>
            <Input
              type="number"
              min="1"
              value={limitConditions?.perUser || ''}
              onChange={(e) =>
                handleLimitConditionChange(
                  'perUser',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="制限なし"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              空欄の場合は制限なし
            </p>
          </div>

          <div>
            <Label>期間内の総応答回数</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="number"
                min="1"
                value={limitConditions?.total || ''}
                onChange={(e) =>
                  handleLimitConditionChange(
                    'total',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="制限なし"
              />
              <Select
                value={limitConditions?.period || 'day'}
                onValueChange={(value) =>
                  handleLimitConditionChange('period', value)
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">1日</SelectItem>
                  <SelectItem value="week">1週間</SelectItem>
                  <SelectItem value="month">1ヶ月</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
