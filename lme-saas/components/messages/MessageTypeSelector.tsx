'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  ChatBubbleLeftIcon,
  PhotoIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  QueueListIcon
} from '@heroicons/react/24/outline'

export type MessageType = 'text' | 'image' | 'video' | 'flex' | 'carousel'

interface MessageTypeSelectorProps {
  value: MessageType
  onChange: (value: MessageType) => void
}

const messageTypes = [
  {
    value: 'text' as MessageType,
    label: 'テキスト',
    description: 'テキストメッセージを送信',
    icon: ChatBubbleLeftIcon,
  },
  {
    value: 'image' as MessageType,
    label: '画像',
    description: '画像メッセージを送信',
    icon: PhotoIcon,
  },
  {
    value: 'video' as MessageType,
    label: '動画',
    description: '動画メッセージを送信',
    icon: VideoCameraIcon,
  },
  {
    value: 'flex' as MessageType,
    label: 'Flex Message',
    description: 'カスタムレイアウトメッセージ',
    icon: CodeBracketIcon,
  },
  {
    value: 'carousel' as MessageType,
    label: 'カルーセル',
    description: '複数のカードを横スクロール',
    icon: QueueListIcon,
  },
]

export function MessageTypeSelector({ value, onChange }: MessageTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <Label>メッセージタイプ</Label>
      <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {messageTypes.map((type) => {
          const Icon = type.icon
          return (
            <Label
              key={type.value}
              htmlFor={type.value}
              className={`
                flex flex-col items-center justify-center gap-3 rounded-lg border-2 p-4 cursor-pointer
                transition-all hover:border-primary/50
                ${value === type.value ? 'border-primary bg-primary/5' : 'border-muted'}
              `}
            >
              <RadioGroupItem
                id={type.value}
                value={type.value}
                className="sr-only"
              />
              <Icon className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
              </div>
            </Label>
          )
        })}
      </RadioGroup>
    </div>
  )
}
