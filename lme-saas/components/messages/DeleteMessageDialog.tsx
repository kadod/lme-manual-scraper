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
import { deleteMessage } from '@/app/actions/messages'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface DeleteMessageDialogProps {
  messageId: string
  messageTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteMessageDialog({
  messageId,
  messageTitle,
  open,
  onOpenChange,
  onSuccess,
}: DeleteMessageDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      await deleteMessage(messageId)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle>メッセージの削除</DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            <span className="font-medium">{messageTitle}</span>{' '}
            を削除してもよろしいですか？
            <br />
            <span className="text-red-600">この操作は取り消せません。</span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? '削除中...' : '削除する'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
