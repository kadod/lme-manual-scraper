'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ConditionBuilder } from './ConditionBuilder'
import { SegmentPreview } from './SegmentPreview'
import { createSegment, updateSegment } from '@/app/actions/segments'
import { SegmentCondition, SegmentWithCount } from '@/lib/supabase/queries/segments'

interface SegmentDialogProps {
  open: boolean
  onClose: (refresh?: boolean) => void
  segment?: SegmentWithCount | null
}

export function SegmentDialog({ open, onClose, segment }: SegmentDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [conditions, setConditions] = useState<SegmentCondition[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (segment) {
      setName(segment.name)
      setDescription(segment.description || '')
      setConditions((segment.conditions as any) || [])
    } else {
      setName('')
      setDescription('')
      setConditions([])
    }
    setError(null)
  }, [segment, open])

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('セグメント名を入力してください')
      return
    }

    if (conditions.length === 0) {
      setError('少なくとも1つの条件を追加してください')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const segmentData = {
        name: name.trim(),
        description: description.trim() || null,
        conditions: conditions as any,
      }

      const result = segment
        ? await updateSegment(segment.id, segmentData)
        : await createSegment(segmentData)

      if (result.success) {
        onClose(true)
      } else {
        setError(result.error?.message || '保存に失敗しました')
      }
    } catch (err: any) {
      setError(err.message || '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleConditionsChange = (newConditions: SegmentCondition[]) => {
    setConditions(newConditions)
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {segment ? 'セグメント編集' : '新規セグメント作成'}
          </DialogTitle>
          <DialogDescription>
            条件を組み合わせて友だちグループを定義します
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">セグメント名 *</Label>
              <Input
                id="name"
                placeholder="例: アクティブユーザー"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                placeholder="セグメントの説明を入力..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Condition Builder */}
          <div className="space-y-2">
            <Label>条件設定</Label>
            <ConditionBuilder
              conditions={conditions}
              onChange={handleConditionsChange}
            />
          </div>

          {/* Preview */}
          {conditions.length > 0 && (
            <div className="space-y-2">
              <Label>プレビュー</Label>
              <SegmentPreview conditions={conditions} />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onClose()}
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '保存中...' : segment ? '更新' : '作成'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
