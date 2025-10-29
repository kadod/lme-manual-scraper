'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TriggerSelector } from './TriggerSelector'
import { StepBuilder, CampaignStep } from './StepBuilder'
import { CampaignFlowChart } from './CampaignFlowChart'
import { createCampaign, updateCampaign } from '@/app/actions/campaigns'
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline'

interface CampaignEditorProps {
  mode: 'create' | 'edit'
  campaignId?: string
  initialData?: {
    name: string
    description?: string
    trigger_type: 'friend_add' | 'tag_add' | 'form_submit' | 'manual'
    trigger_config?: Record<string, unknown>
    line_channel_id: string
    steps: CampaignStep[]
  }
}

export function CampaignEditor({ mode, campaignId, initialData }: CampaignEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [triggerType, setTriggerType] = useState<'friend_add' | 'tag_add' | 'form_submit' | 'manual'>(
    initialData?.trigger_type || 'friend_add'
  )
  const [triggerConfig, setTriggerConfig] = useState<Record<string, unknown>>(
    initialData?.trigger_config || {}
  )
  const [steps, setSteps] = useState<CampaignStep[]>(initialData?.steps || [])
  const [activeTab, setActiveTab] = useState('basic')

  const handleSubmit = async (status: 'draft' | 'active' = 'draft') => {
    // Validation
    if (!name.trim()) {
      alert('キャンペーン名を入力してください')
      return
    }

    if (steps.length === 0) {
      alert('少なくとも1つのステップを追加してください')
      return
    }

    // Validate steps
    for (const step of steps) {
      if (!step.name.trim()) {
        alert(`ステップ ${step.step_number} の名前を入力してください`)
        return
      }
      if (step.message_type === 'text' && !step.message_content.text?.trim()) {
        alert(`ステップ ${step.step_number} のメッセージ内容を入力してください`)
        return
      }
    }

    setLoading(true)
    try {
      const campaignData = {
        name,
        description,
        trigger_type: triggerType,
        trigger_config: triggerConfig,
        line_channel_id: initialData?.line_channel_id || 'default-channel-id', // TODO: Get from context
      }

      const stepsData = steps.map(step => ({
        step_number: step.step_number,
        name: step.name,
        delay_value: step.delay_value,
        delay_unit: step.delay_unit,
        message_type: step.message_type,
        message_content: step.message_content,
        condition: step.condition,
      }))

      let result
      if (mode === 'create') {
        result = await createCampaign(campaignData, stepsData)
      } else if (campaignId) {
        result = await updateCampaign(campaignId, campaignData, stepsData)
      }

      if (result?.error) {
        alert(`エラー: ${result.error}`)
        return
      }

      if (result?.data) {
        router.push('/dashboard/messages/step-campaigns')
      }
    } catch (error) {
      console.error('Error saving campaign:', error)
      alert('保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">
              {mode === 'create' ? '新規キャンペーン作成' : 'キャンペーン編集'}
            </h2>
            <p className="text-muted-foreground mt-1">
              ステップ配信キャンペーンを設定します
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
          >
            下書き保存
          </Button>
          <Button
            onClick={() => handleSubmit('active')}
            disabled={loading}
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            {mode === 'create' ? '作成して開始' : '保存して開始'}
          </Button>
        </div>
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">基本情報</TabsTrigger>
          <TabsTrigger value="trigger">トリガー</TabsTrigger>
          <TabsTrigger value="steps">ステップ設定</TabsTrigger>
          <TabsTrigger value="preview">プレビュー</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>
                キャンペーンの基本情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">キャンペーン名 *</Label>
                <Input
                  id="campaign-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: 新規会員向けウェルカムシリーズ"
                  maxLength={100}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {name.length} / 100
                </p>
              </div>

              <div>
                <Label htmlFor="campaign-description">説明</Label>
                <Textarea
                  id="campaign-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="このキャンペーンの目的や概要を入力してください"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {description.length} / 500
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trigger Tab */}
        <TabsContent value="trigger">
          <TriggerSelector
            value={triggerType}
            onChange={setTriggerType}
            config={triggerConfig}
            onConfigChange={setTriggerConfig}
          />
        </TabsContent>

        {/* Steps Tab */}
        <TabsContent value="steps">
          <StepBuilder steps={steps} onChange={setSteps} />
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>フローチャート</CardTitle>
              <CardDescription>
                配信フローを視覚的に確認できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignFlowChart steps={steps} triggerType={triggerType} />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>サマリー</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">キャンペーン名</p>
                  <p className="font-medium">{name || '未設定'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">トリガー</p>
                  <p className="font-medium">
                    {triggerType === 'friend_add' && '友だち追加'}
                    {triggerType === 'tag_add' && 'タグ追加'}
                    {triggerType === 'form_submit' && 'フォーム送信'}
                    {triggerType === 'manual' && '手動登録'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ステップ数</p>
                  <p className="font-medium">{steps.length}ステップ</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">配信期間</p>
                  <p className="font-medium">
                    {steps.length > 0
                      ? (() => {
                          let totalDays = 0
                          steps.forEach(step => {
                            if (step.delay_unit === 'days') {
                              totalDays += step.delay_value
                            } else if (step.delay_unit === 'hours') {
                              totalDays += step.delay_value / 24
                            } else if (step.delay_unit === 'minutes') {
                              totalDays += step.delay_value / (24 * 60)
                            }
                          })
                          return `約${Math.ceil(totalDays)}日間`
                        })()
                      : '未設定'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
