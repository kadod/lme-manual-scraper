'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserPlusIcon, TagIcon, DocumentTextIcon, HandRaisedIcon } from '@heroicons/react/24/outline'

interface TriggerSelectorProps {
  value: 'friend_add' | 'tag_add' | 'form_submit' | 'manual'
  onChange: (value: 'friend_add' | 'tag_add' | 'form_submit' | 'manual') => void
  config?: Record<string, unknown>
  onConfigChange?: (config: Record<string, unknown>) => void
}

const triggers = [
  {
    value: 'friend_add',
    label: '友だち追加',
    description: 'ユーザーが友だち追加したときに配信開始',
    icon: UserPlusIcon,
  },
  {
    value: 'tag_add',
    label: 'タグ追加',
    description: '特定のタグが付与されたときに配信開始',
    icon: TagIcon,
  },
  {
    value: 'form_submit',
    label: 'フォーム送信',
    description: '特定のフォームが送信されたときに配信開始',
    icon: DocumentTextIcon,
  },
  {
    value: 'manual',
    label: '手動登録',
    description: '管理画面から手動で登録したときに配信開始',
    icon: HandRaisedIcon,
  },
]

export function TriggerSelector({ value, onChange }: TriggerSelectorProps) {
  const selectedTrigger = triggers.find(t => t.value === value)

  return (
    <Card>
      <CardHeader>
        <CardTitle>トリガー設定</CardTitle>
        <CardDescription>
          ステップ配信を開始する条件を選択してください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trigger Type Selection */}
        <div>
          <Label htmlFor="trigger-type">トリガータイプ</Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger id="trigger-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {triggers.map((trigger) => (
                <SelectItem key={trigger.value} value={trigger.value}>
                  {trigger.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trigger Description */}
        {selectedTrigger && (
          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <selectedTrigger.icon className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">{selectedTrigger.label}</p>
              <p className="text-sm text-muted-foreground">
                {selectedTrigger.description}
              </p>
            </div>
          </div>
        )}

        {/* Additional Configuration based on trigger type */}
        {value === 'tag_add' && (
          <div>
            <Label htmlFor="trigger-tag">対象タグ</Label>
            <Select>
              <SelectTrigger id="trigger-tag">
                <SelectValue placeholder="タグを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="new">新規</SelectItem>
                <SelectItem value="interested">興味あり</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {value === 'form_submit' && (
          <div>
            <Label htmlFor="trigger-form">対象フォーム</Label>
            <Select>
              <SelectTrigger id="trigger-form">
                <SelectValue placeholder="フォームを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contact">お問い合わせ</SelectItem>
                <SelectItem value="survey">アンケート</SelectItem>
                <SelectItem value="registration">登録フォーム</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
