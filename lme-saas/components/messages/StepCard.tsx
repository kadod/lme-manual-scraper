'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { CampaignStep } from './StepBuilder'

interface StepCardProps {
  step: CampaignStep
  index: number
  isFirst: boolean
  isLast: boolean
  isEditing: boolean
  onEdit: () => void
  onCollapse: () => void
  onUpdate: (updates: Partial<CampaignStep>) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

const delayUnitLabels = {
  minutes: '分',
  hours: '時間',
  days: '日',
}

const messageTypeLabels = {
  text: 'テキスト',
  image: '画像',
  video: '動画',
  flex: 'Flexメッセージ',
  template: 'テンプレート',
}

export function StepCard({
  step,
  index,
  isFirst,
  isLast,
  isEditing,
  onEdit,
  onCollapse,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: StepCardProps) {
  const getDelayLabel = () => {
    if (index === 0) return 'トリガー直後'
    return `${step.delay_value}${delayUnitLabels[step.delay_unit]}後`
  }

  return (
    <Card className={isEditing ? 'ring-2 ring-primary' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
              {step.step_number}
            </div>
            <div>
              <h4 className="font-semibold">{step.name}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <ClockIcon className="h-4 w-4" />
                <span>{getDelayLabel()}</span>
                <span>•</span>
                <span>{messageTypeLabels[step.message_type]}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isFirst && (
              <Button variant="ghost" size="icon-sm" onClick={onMoveUp}>
                <ArrowUpIcon className="h-4 w-4" />
              </Button>
            )}
            {!isLast && (
              <Button variant="ghost" size="icon-sm" onClick={onMoveDown}>
                <ArrowDownIcon className="h-4 w-4" />
              </Button>
            )}
            {isEditing ? (
              <Button variant="ghost" size="icon-sm" onClick={onCollapse}>
                <ChevronUpIcon className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon-sm" onClick={onEdit}>
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={onDelete} className="text-red-500">
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isEditing && (
        <CardContent className="space-y-4 border-t pt-4">
          {/* Step Name */}
          <div>
            <Label htmlFor={`step-name-${step.id}`}>ステップ名</Label>
            <Input
              id={`step-name-${step.id}`}
              value={step.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="例: ウェルカムメッセージ"
            />
          </div>

          {/* Delay Settings (not for first step) */}
          {index > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`delay-value-${step.id}`}>待機時間</Label>
                <Input
                  id={`delay-value-${step.id}`}
                  type="number"
                  min="1"
                  value={step.delay_value}
                  onChange={(e) => onUpdate({ delay_value: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor={`delay-unit-${step.id}`}>単位</Label>
                <Select
                  value={step.delay_unit}
                  onValueChange={(value) => onUpdate({ delay_unit: value as CampaignStep['delay_unit'] })}
                >
                  <SelectTrigger id={`delay-unit-${step.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">分</SelectItem>
                    <SelectItem value="hours">時間</SelectItem>
                    <SelectItem value="days">日</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Message Type */}
          <div>
            <Label htmlFor={`message-type-${step.id}`}>メッセージタイプ</Label>
            <Select
              value={step.message_type}
              onValueChange={(value) => onUpdate({ message_type: value as CampaignStep['message_type'] })}
            >
              <SelectTrigger id={`message-type-${step.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">テキスト</SelectItem>
                <SelectItem value="image">画像</SelectItem>
                <SelectItem value="video">動画</SelectItem>
                <SelectItem value="flex">Flexメッセージ</SelectItem>
                <SelectItem value="template">テンプレート</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message Content */}
          {step.message_type === 'text' && (
            <div>
              <Label htmlFor={`message-text-${step.id}`}>メッセージ内容</Label>
              <Textarea
                id={`message-text-${step.id}`}
                value={step.message_content.text || ''}
                onChange={(e) =>
                  onUpdate({
                    message_content: {
                      ...step.message_content,
                      type: 'text',
                      text: e.target.value,
                    },
                  })
                }
                placeholder="メッセージを入力してください"
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-1">
                最大5000文字まで入力できます
              </p>
            </div>
          )}

          {step.message_type === 'image' && (
            <div>
              <Label htmlFor={`message-image-${step.id}`}>画像URL</Label>
              <Input
                id={`message-image-${step.id}`}
                value={step.message_content.originalContentUrl as string || ''}
                onChange={(e) =>
                  onUpdate({
                    message_content: {
                      type: 'image',
                      originalContentUrl: e.target.value,
                      previewImageUrl: e.target.value,
                    },
                  })
                }
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-sm text-muted-foreground mt-1">
                JPEG/PNG形式、最大10MB
              </p>
            </div>
          )}

          {/* Condition Settings */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium text-muted-foreground">
              分岐条件（オプション）
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              特定の条件を満たすユーザーのみにこのステップを送信できます
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              条件を追加
            </Button>
          </div>
        </CardContent>
      )}

      {!isEditing && step.message_type === 'text' && step.message_content.text && (
        <CardContent className="border-t pt-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {step.message_content.text}
          </p>
        </CardContent>
      )}
    </Card>
  )
}
