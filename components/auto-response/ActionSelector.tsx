'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { ActionConfig } from '@/types/auto-response'

interface ActionSelectorProps {
  actions: ActionConfig[]
  onChange: (actions: ActionConfig[]) => void
  tags?: Array<{ id: string; name: string; color: string }>
  segments?: Array<{ id: string; name: string }>
  stepCampaigns?: Array<{ id: string; name: string }>
}

export function ActionSelector({
  actions,
  onChange,
  tags = [],
  segments = [],
  stepCampaigns = [],
}: ActionSelectorProps) {
  const [actionType, setActionType] = useState<ActionConfig['type']>('tag')

  const handleAddAction = () => {
    const newAction: ActionConfig = {
      type: actionType,
      tagIds: actionType === 'tag' ? [] : undefined,
      segmentId: actionType === 'segment' ? '' : undefined,
      stepCampaignId: actionType === 'step' ? '' : undefined,
      notificationText: actionType === 'notify' ? '' : undefined,
    }
    onChange([...actions, newAction])
  }

  const handleRemoveAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index))
  }

  const handleUpdateAction = (index: number, field: string, value: any) => {
    onChange(
      actions.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      )
    )
  }

  const getActionLabel = (action: ActionConfig) => {
    switch (action.type) {
      case 'tag':
        return 'タグ付与'
      case 'segment':
        return 'セグメント移動'
      case 'step':
        return 'ステップ配信開始'
      case 'notify':
        return '通知送信'
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>アクション設定</Label>
        <div className="flex gap-2 mt-2">
          <Select
            value={actionType}
            onValueChange={(value) => setActionType(value as ActionConfig['type'])}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tag">タグ付与</SelectItem>
              <SelectItem value="segment">セグメント移動</SelectItem>
              <SelectItem value="step">ステップ配信開始</SelectItem>
              <SelectItem value="notify">通知送信</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" onClick={handleAddAction} size="icon">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            設定済みアクション ({actions.length})
          </Label>
          <div className="space-y-3">
            {actions.map((action, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{getActionLabel(action)}</div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAction(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>

                      {action.type === 'tag' && (
                        <div>
                          <Label className="text-sm">タグ選択</Label>
                          <Select
                            value={action.tagIds?.[0] || ''}
                            onValueChange={(value) =>
                              handleUpdateAction(index, 'tagIds', [value])
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="タグを選択" />
                            </SelectTrigger>
                            <SelectContent>
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
                      )}

                      {action.type === 'segment' && (
                        <div>
                          <Label className="text-sm">セグメント選択</Label>
                          <Select
                            value={action.segmentId || ''}
                            onValueChange={(value) =>
                              handleUpdateAction(index, 'segmentId', value)
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="セグメントを選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {segments.map((segment) => (
                                <SelectItem key={segment.id} value={segment.id}>
                                  {segment.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {action.type === 'step' && (
                        <div>
                          <Label className="text-sm">ステップ配信選択</Label>
                          <Select
                            value={action.stepCampaignId || ''}
                            onValueChange={(value) =>
                              handleUpdateAction(index, 'stepCampaignId', value)
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="ステップ配信を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {stepCampaigns.map((campaign) => (
                                <SelectItem key={campaign.id} value={campaign.id}>
                                  {campaign.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {action.type === 'notify' && (
                        <div>
                          <Label className="text-sm">通知内容</Label>
                          <Input
                            value={action.notificationText || ''}
                            onChange={(e) =>
                              handleUpdateAction(
                                index,
                                'notificationText',
                                e.target.value
                              )
                            }
                            placeholder="通知メッセージ"
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
