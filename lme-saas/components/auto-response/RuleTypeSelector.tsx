'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ChatBubbleLeftRightIcon,
  BoltIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

interface RuleTypeSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RuleTypeSelector({ open, onOpenChange }: RuleTypeSelectorProps) {
  const router = useRouter()

  const ruleTypes = [
    {
      type: 'keyword',
      title: 'キーワードルール',
      description: '特定のキーワードに反応して自動応答します',
      icon: ChatBubbleLeftRightIcon,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      type: 'scenario',
      title: 'シナリオルール',
      description: '事前に設定したシナリオに基づいて会話を進めます',
      icon: BoltIcon,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      type: 'ai',
      title: 'AIルール',
      description: 'AIが文脈を理解して適切な応答を生成します',
      icon: SparklesIcon,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      badge: 'Coming Soon',
    },
  ]

  const handleSelect = (type: string) => {
    router.push(`/dashboard/auto-response/new?type=${type}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ルールタイプを選択</DialogTitle>
          <DialogDescription>
            作成する自動応答ルールのタイプを選択してください
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {ruleTypes.map((ruleType) => (
            <Card
              key={ruleType.type}
              className={`p-6 cursor-pointer hover:shadow-md transition-all ${
                ruleType.badge ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              onClick={() => !ruleType.badge && handleSelect(ruleType.type)}
            >
              <div className="text-center space-y-4">
                <div className={`inline-flex p-4 rounded-full ${ruleType.bgColor}`}>
                  <ruleType.icon className={`h-8 w-8 ${ruleType.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
                    {ruleType.title}
                    {ruleType.badge && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {ruleType.badge}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {ruleType.description}
                  </p>
                </div>
                {!ruleType.badge && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(ruleType.type)
                    }}
                  >
                    選択
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
