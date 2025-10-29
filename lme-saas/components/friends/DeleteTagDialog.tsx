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
import { deleteTag } from '@/lib/actions/tags'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Tag {
  id: string
  name: string
  color: string
  friend_count?: number
}

interface DeleteTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag: Tag | null
  onSuccess?: () => void
}

export function DeleteTagDialog({ open, onOpenChange, tag, onSuccess }: DeleteTagDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!tag) return

    setIsLoading(true)
    setError(null)

    try {
      await deleteTag(tag.id)
      onOpenChange(false)
      onSuccess?.()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('予期しないエラーが発生しました')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!tag) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>タグを削除</DialogTitle>
              <DialogDescription>この操作は取り消せません</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-700">
            以下のタグを削除してもよろしいですか？
          </p>
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 rounded"
                style={{ backgroundColor: tag.color }}
              />
              <span className="font-medium">{tag.name}</span>
            </div>
            {tag.friend_count !== undefined && tag.friend_count > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                このタグは {tag.friend_count} 人の友だちに紐付けられています。
              </p>
            )}
          </div>

          {error && (
            <div className="mt-3 rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? '削除中...' : '削除する'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
