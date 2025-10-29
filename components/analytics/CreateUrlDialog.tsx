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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UtmBuilder, type UtmParameters } from './UtmBuilder'
import { createShortUrl } from '@/app/actions/url-tracking'
import { toast } from 'sonner'

interface CreateUrlDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUrlDialog({ open, onOpenChange }: CreateUrlDialogProps) {
  const [originalUrl, setOriginalUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [utmParams, setUtmParams] = useState<UtmParameters>({})
  const [expiresAt, setExpiresAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!originalUrl) {
      toast.error('オリジナルURLを入力してください')
      return
    }

    // Validate URL
    let validatedUrl = originalUrl
    try {
      const urlObj = new URL(originalUrl)

      // Add UTM parameters to URL
      if (Object.keys(utmParams).length > 0) {
        Object.entries(utmParams).forEach(([key, value]) => {
          if (value) {
            urlObj.searchParams.set(key, value)
          }
        })
        validatedUrl = urlObj.toString()
      }
    } catch {
      toast.error('有効なURLを入力してください')
      return
    }

    // Validate custom slug (alphanumeric and hyphen only)
    if (customSlug && !/^[a-zA-Z0-9-]+$/.test(customSlug)) {
      toast.error('スラッグは英数字とハイフンのみ使用できます')
      return
    }

    // Validate expiration date
    if (expiresAt) {
      const expirationDate = new Date(expiresAt)
      if (expirationDate <= new Date()) {
        toast.error('有効期限は未来の日時を指定してください')
        return
      }
    }

    setIsSubmitting(true)

    try {
      await createShortUrl({
        originalUrl: validatedUrl,
        customSlug: customSlug || undefined,
        expiresAt: expiresAt || undefined,
      })

      toast.success('短縮URLを作成しました')
      setOriginalUrl('')
      setCustomSlug('')
      setUtmParams({})
      setExpiresAt('')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '短縮URLの作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate preview URL with UTM parameters
  const getPreviewUrl = () => {
    if (!originalUrl) return ''

    try {
      const url = new URL(originalUrl)
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, value)
        }
      })
      return url.toString()
    } catch {
      return originalUrl
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>短縮URL作成</DialogTitle>
            <DialogDescription>
              計測用の短縮URLを作成します
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="py-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本設定</TabsTrigger>
              <TabsTrigger value="utm">UTMパラメータ</TabsTrigger>
              <TabsTrigger value="advanced">詳細設定</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
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
                  <span className="text-sm text-muted-foreground whitespace-nowrap">/u/</span>
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

              {getPreviewUrl() && getPreviewUrl() !== originalUrl && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs font-medium mb-1">プレビュー（UTMパラメータ付き）:</p>
                  <p className="text-xs text-muted-foreground break-all">
                    {getPreviewUrl()}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="utm">
              <UtmBuilder onUtmChange={setUtmParams} initialUtm={utmParams} />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expires-at">
                  有効期限 <span className="text-muted-foreground">(オプション)</span>
                </Label>
                <Input
                  id="expires-at"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  期限後はアクセスできなくなります
                </p>
              </div>

              <div className="rounded-md bg-muted p-4 space-y-2">
                <h4 className="text-sm font-medium">QRコード</h4>
                <p className="text-xs text-muted-foreground">
                  URLの作成後、一覧からQRコードを生成・ダウンロードできます
                </p>
              </div>
            </TabsContent>
          </Tabs>

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
