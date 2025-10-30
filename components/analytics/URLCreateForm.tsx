'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createShortUrl } from '@/app/actions/url-tracking'
import { toast } from 'sonner'

interface URLCreateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function URLCreateForm({ open, onOpenChange }: URLCreateFormProps) {
  const [originalUrl, setOriginalUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!originalUrl) {
      toast.error('オリジナルURLを入力してください')
      return
    }

    // Validate URL
    try {
      new URL(originalUrl)
    } catch {
      toast.error('有効なURLを入力してください')
      return
    }

    // Validate custom slug (alphanumeric and hyphen only)
    if (customSlug && !/^[a-zA-Z0-9-]+$/.test(customSlug)) {
      toast.error('スラッグは英数字とハイフンのみ使用できます')
      return
    }

    setIsSubmitting(true)

    try {
      await createShortUrl({
        originalUrl: originalUrl,
        customSlug: customSlug || undefined,
      })
      toast.success('短縮URLを作成しました')
      setOriginalUrl('')
      setCustomSlug('')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '短縮URLの作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>短縮URL作成</DialogTitle>
            <DialogDescription>
              オリジナルURLを入力して、短縮URLを作成します
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="original-url">
                オリジナルURL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="original-url"
                type="url"
                placeholder="https://example.com/long-url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-slug">
                カスタムスラッグ <span className="text-muted-foreground">(オプション)</span>
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/u/</span>
                <Input
                  id="custom-slug"
                  type="text"
                  placeholder="my-link"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                空欄の場合、ランダムな文字列が生成されます
              </p>
            </div>

          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '作成中...' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
