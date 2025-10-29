'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { deleteSegment } from '@/app/actions/segments'
import { SegmentWithCount } from '@/lib/supabase/queries/segments'

interface DeleteSegmentDialogProps {
  open: boolean
  onClose: (refresh?: boolean) => void
  segment: SegmentWithCount
}

export function DeleteSegmentDialog({ open, onClose, segment }: DeleteSegmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await deleteSegment(segment.id)

      if (result.success) {
        onClose(true)
      } else {
        setError(result.error?.message || '削除に失敗しました')
      }
    } catch (err: any) {
      setError(err.message || '削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
              <ExclamationTriangleIcon className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle>セグメントを削除</DialogTitle>
              <DialogDescription>
                この操作は取り消せません
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm">
            以下のセグメントを削除してもよろしいですか？
          </p>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium">{segment.name}</p>
            {segment.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {segment.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              該当友だち数: {segment.friendCount || 0}人
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            注: セグメント自体は削除されますが、友だちデータは削除されません。
          </p>

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
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? '削除中...' : '削除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
