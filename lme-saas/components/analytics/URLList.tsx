'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LinkIcon, QrCodeIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { QRCodeDisplay } from './QRCodeDisplay'
import { deleteShortUrl } from '@/app/actions/url-tracking'
import { toast } from 'sonner'

interface ShortenedURL {
  id: string
  organization_id: string
  original_url: string
  short_code: string
  message_id?: string
  click_count: number
  unique_click_count: number
  expires_at?: string
  created_at: string
  updated_at: string
}

interface URLListProps {
  urls: ShortenedURL[]
}

export function URLList({ urls }: URLListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteShortUrl(deleteId)
      toast.success('URLを削除しました')
    } catch (error) {
      toast.error('削除に失敗しました')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleCopy = async (shortCode: string) => {
    const fullUrl = `${window.location.origin}/u/${shortCode}`
    await navigator.clipboard.writeText(fullUrl)
    toast.success('URLをコピーしました')
  }

  const getShortUrl = (shortCode: string) => {
    return `${window.location.origin}/u/${shortCode}`
  }

  if (urls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">短縮URLがありません</h3>
        <p className="text-sm text-muted-foreground mt-2">
          新しい短縮URLを作成して、クリック数を計測しましょう
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>短縮URL</TableHead>
              <TableHead>オリジナルURL</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">クリック数</TableHead>
              <TableHead className="text-right">ユニーク</TableHead>
              <TableHead>最終クリック</TableHead>
              <TableHead className="text-right">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {urls.map((url) => {
              const isExpired = url.expires_at && new Date(url.expires_at) < new Date()

              return (
                <TableRow key={url.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/analytics/url-tracking/${url.id}`}
                      className="font-mono text-sm text-primary hover:underline"
                    >
                      /u/{url.short_code}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    <a
                      href={url.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {url.original_url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {isExpired ? (
                        <Badge variant="destructive">期限切れ</Badge>
                      ) : (
                        <Badge variant="default">アクティブ</Badge>
                      )}
                      {url.message_id && (
                        <Badge variant="secondary">メッセージ</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {url.click_count.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {url.unique_click_count.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {url.updated_at && url.click_count > 0
                      ? new Date(url.updated_at).toLocaleString('ja-JP')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(url.short_code)}
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setQrUrl(getShortUrl(url.short_code))}
                      >
                        <QrCodeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(url.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>URLを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。クリックデータも削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? '削除中...' : '削除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {qrUrl && <QRCodeDisplay url={qrUrl} onClose={() => setQrUrl(null)} />}
    </>
  )
}
