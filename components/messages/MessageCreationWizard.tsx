'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { MessageTypeSelector, MessageType } from './MessageTypeSelector'
import { MessageEditor } from './MessageEditor'
import { MessagePreview } from './MessagePreview'
import { TargetSelector, TargetType } from './TargetSelector'
import { ScheduleSelector } from './ScheduleSelector'
import { createMessage, MessageFormData } from '@/lib/actions/messages'

interface MessageCreationWizardProps {
  segments?: Array<{ id: string; name: string }>
  tags?: Array<{ id: string; name: string; color: string }>
}

type Step = 1 | 2 | 3

export function MessageCreationWizard({ segments = [], tags = [] }: MessageCreationWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('text')
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [flexJson, setFlexJson] = useState<string | null>(null)
  const [targetType, setTargetType] = useState<TargetType>('all')
  const [targetIds, setTargetIds] = useState<string[]>([])
  const [excludeBlocked, setExcludeBlocked] = useState(true)
  const [excludeUnsubscribed, setExcludeUnsubscribed] = useState(true)
  const [scheduledAt, setScheduledAt] = useState<string | null>(null)

  const steps = [
    { number: 1, title: 'メッセージ作成', description: '内容を入力' },
    { number: 2, title: 'ターゲット選択', description: '配信先を設定' },
    { number: 3, title: '確認・送信', description: '最終確認' },
  ]

  const progress = (currentStep / steps.length) * 100

  const handleFieldChange = (field: string, value: any) => {
    switch (field) {
      case 'title':
        setTitle(value)
        break
      case 'content':
        setContent(value)
        break
      case 'mediaUrl':
        setMediaUrl(value)
        break
      case 'flexJson':
        setFlexJson(value)
        break
      case 'targetType':
        setTargetType(value)
        break
      case 'targetIds':
        setTargetIds(value)
        break
      case 'excludeBlocked':
        setExcludeBlocked(value)
        break
      case 'excludeUnsubscribed':
        setExcludeUnsubscribed(value)
        break
      case 'scheduledAt':
        setScheduledAt(value)
        break
    }
  }

  const validateStep = (step: Step): boolean => {
    setError(null)

    if (step === 1) {
      if (!title.trim()) {
        setError('タイトルを入力してください')
        return false
      }
      if (!content.trim() && messageType === 'text') {
        setError('メッセージ内容を入力してください')
        return false
      }
      if ((messageType === 'image' || messageType === 'video') && !mediaUrl) {
        setError(`${messageType === 'image' ? '画像' : '動画'}をアップロードしてください`)
        return false
      }
      if (messageType === 'flex' && !flexJson) {
        setError('Flex Message JSONを入力してください')
        return false
      }
    }

    if (step === 2) {
      if ((targetType === 'segments' || targetType === 'tags' || targetType === 'manual') && targetIds.length === 0) {
        setError('配信先を選択してください')
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3) as Step)
    }
  }

  const handleBack = () => {
    setError(null)
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step)
  }

  const handleSaveDraft = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const formData: MessageFormData = {
        title,
        type: messageType,
        content,
        media_url: mediaUrl,
        flex_json: flexJson,
        scheduled_at: null, // 下書きは予約なし
        target_type: targetType,
        target_ids: targetIds,
        exclude_blocked: excludeBlocked,
        exclude_unsubscribed: excludeUnsubscribed,
      }

      await createMessage(formData)
      router.push('/dashboard/messages')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData: MessageFormData = {
        title,
        type: messageType,
        content,
        media_url: mediaUrl,
        flex_json: flexJson,
        scheduled_at: scheduledAt,
        target_type: targetType,
        target_ids: targetIds,
        exclude_blocked: excludeBlocked,
        exclude_unsubscribed: excludeUnsubscribed,
      }

      await createMessage(formData)
      router.push('/dashboard/messages?success=created')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    transition-colors
                    ${
                      currentStep === step.number
                        ? 'bg-primary text-primary-foreground'
                        : currentStep > step.number
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {currentStep > step.number ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4 transition-colors
                    ${currentStep > step.number ? 'bg-primary' : 'bg-muted'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Message Creation */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">タイトル</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="メッセージのタイトル"
                      className="mt-2"
                      maxLength={100}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      管理用のタイトルです（顧客には表示されません）
                    </p>
                  </div>

                  <MessageTypeSelector
                    value={messageType}
                    onChange={(value) => setMessageType(value)}
                  />

                  <MessageEditor
                    type={messageType}
                    content={content}
                    mediaUrl={mediaUrl}
                    flexJson={flexJson}
                    onChange={handleFieldChange}
                  />
                </div>
              )}

              {/* Step 2: Target Selection */}
              {currentStep === 2 && (
                <TargetSelector
                  targetType={targetType}
                  targetIds={targetIds}
                  excludeBlocked={excludeBlocked}
                  excludeUnsubscribed={excludeUnsubscribed}
                  onChange={handleFieldChange}
                  segments={segments}
                  tags={tags}
                />
              )}

              {/* Step 3: Confirmation & Schedule */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">タイトル</Label>
                      <div className="mt-1 font-medium">{title}</div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground">メッセージタイプ</Label>
                      <div className="mt-1 font-medium capitalize">{messageType}</div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground">配信先</Label>
                      <div className="mt-1 font-medium">
                        {targetType === 'all' && '全員'}
                        {targetType === 'segments' && `セグメント ${targetIds.length}件`}
                        {targetType === 'tags' && `タグ ${targetIds.length}件`}
                        {targetType === 'manual' && `手動選択 ${targetIds.length}人`}
                      </div>
                    </div>
                  </div>

                  <ScheduleSelector
                    scheduledAt={scheduledAt}
                    onChange={(value) => setScheduledAt(value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <MessagePreview
              type={messageType}
              content={content}
              mediaUrl={mediaUrl}
              title={title}
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              戻る
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting || !title.trim()}
          >
            下書き保存
          </Button>

          {currentStep < 3 ? (
            <Button type="button" onClick={handleNext} disabled={isSubmitting}>
              次へ
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '送信中...' : scheduledAt ? '予約配信' : '配信する'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
