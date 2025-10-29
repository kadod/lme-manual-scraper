'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { KeywordInput } from './KeywordInput'
import { ResponseEditor } from './ResponseEditor'
import { ConditionBuilder } from './ConditionBuilder'
import { ActionSelector } from './ActionSelector'
import { KeywordTester } from './KeywordTester'
import {
  Keyword,
  ResponseContent,
  TimeCondition,
  FriendCondition,
  LimitCondition,
  ActionConfig,
  KeywordRuleFormData,
} from '@/types/auto-response'

interface KeywordBuilderProps {
  initialData?: KeywordRuleFormData
  tags?: Array<{ id: string; name: string; color: string }>
  segments?: Array<{ id: string; name: string }>
  templates?: Array<{ id: string; name: string; type: string }>
  stepCampaigns?: Array<{ id: string; name: string }>
  onSave: (data: KeywordRuleFormData) => Promise<void>
}

export function KeywordBuilder({
  initialData,
  tags = [],
  segments = [],
  templates = [],
  stepCampaigns = [],
  onSave,
}: KeywordBuilderProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [priority, setPriority] = useState(initialData?.priority || 50)
  const [keywords, setKeywords] = useState<Keyword[]>(initialData?.keywords || [])
  const [response, setResponse] = useState<ResponseContent>(
    initialData?.response || {
      type: 'text',
      text: '',
    }
  )
  const [timeConditions, setTimeConditions] = useState<TimeCondition[]>(
    initialData?.timeConditions || []
  )
  const [friendConditions, setFriendConditions] = useState<FriendCondition | undefined>(
    initialData?.friendConditions
  )
  const [limitConditions, setLimitConditions] = useState<LimitCondition | undefined>(
    initialData?.limitConditions
  )
  const [actions, setActions] = useState<ActionConfig[]>(initialData?.actions || [])
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [validUntil, setValidUntil] = useState(initialData?.validUntil || null)

  const handleConditionChange = (field: string, value: any) => {
    switch (field) {
      case 'timeConditions':
        setTimeConditions(value)
        break
      case 'friendConditions':
        setFriendConditions(value)
        break
      case 'limitConditions':
        setLimitConditions(value)
        break
    }
  }

  const validateForm = (): boolean => {
    setError(null)

    if (!name.trim()) {
      setError('ルール名を入力してください')
      return false
    }

    if (keywords.length === 0) {
      setError('キーワードを1つ以上登録してください')
      return false
    }

    if (response.type === 'text' && !response.text?.trim()) {
      setError('応答テキストを入力してください')
      return false
    }

    if (response.type === 'template' && !response.templateId) {
      setError('テンプレートを選択してください')
      return false
    }

    if (response.type === 'flex' && !response.flexJson?.trim()) {
      setError('Flex Message JSONを入力してください')
      return false
    }

    if (priority < 1 || priority > 100) {
      setError('優先順位は1-100の範囲で設定してください')
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData: KeywordRuleFormData = {
        name,
        description: description || null,
        priority,
        keywords,
        response,
        timeConditions: timeConditions.length > 0 ? timeConditions : undefined,
        friendConditions,
        limitConditions,
        actions: actions.length > 0 ? actions : undefined,
        isActive,
        validUntil,
      }

      await onSave(formData)
      router.push('/dashboard/auto-response')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>基本設定</CardTitle>
              <CardDescription>ルールの基本情報を設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">ルール名</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: 営業時間案内"
                  className="mt-2"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ルールの説明（任意）"
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">優先順位</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="100"
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value) || 50)}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    1-100（数字が大きいほど優先）
                  </p>
                </div>

                <div>
                  <Label htmlFor="validUntil">有効期限</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil || ''}
                    onChange={(e) => setValidUntil(e.target.value || null)}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    空欄の場合は無期限
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">有効化</Label>
                  <p className="text-sm text-muted-foreground">
                    ルールを有効にする
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle>キーワード設定</CardTitle>
              <CardDescription>
                反応するキーワードを登録
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KeywordInput keywords={keywords} onChange={setKeywords} />
            </CardContent>
          </Card>

          {/* Response */}
          <Card>
            <CardHeader>
              <CardTitle>応答内容</CardTitle>
              <CardDescription>
                キーワードにマッチした時の応答を設定
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponseEditor
                response={response}
                onChange={setResponse}
                templates={templates}
              />
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle>詳細設定</CardTitle>
              <CardDescription>条件とアクションを設定</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="conditions">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="conditions">条件</TabsTrigger>
                  <TabsTrigger value="actions">アクション</TabsTrigger>
                </TabsList>

                <TabsContent value="conditions" className="mt-6">
                  <ConditionBuilder
                    timeConditions={timeConditions}
                    friendConditions={friendConditions}
                    limitConditions={limitConditions}
                    onChange={handleConditionChange}
                    tags={tags}
                    segments={segments}
                  />
                </TabsContent>

                <TabsContent value="actions" className="mt-6">
                  <ActionSelector
                    actions={actions}
                    onChange={setActions}
                    tags={tags}
                    segments={segments}
                    stepCampaigns={stepCampaigns}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            {/* Tester */}
            <KeywordTester keywords={keywords} />

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>設定サマリー</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground">キーワード数</div>
                  <div className="font-medium">{keywords.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">応答タイプ</div>
                  <div className="font-medium capitalize">{response.type}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">優先順位</div>
                  <div className="font-medium">{priority}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">アクション数</div>
                  <div className="font-medium">{actions.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">ステータス</div>
                  <div className="font-medium">
                    {isActive ? '有効' : '無効'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>

        <Button type="button" onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : initialData ? '更新する' : '作成する'}
        </Button>
      </div>
    </div>
  )
}
