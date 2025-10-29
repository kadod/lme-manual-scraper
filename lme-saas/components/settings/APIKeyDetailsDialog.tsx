'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { APIKey } from '@/types/system'

interface APIKeyDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKey: APIKey | null
}

export function APIKeyDetailsDialog({
  open,
  onOpenChange,
  apiKey,
}: APIKeyDetailsDialogProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  if (!apiKey) return null

  const isNewKey = apiKey.key_hash.startsWith('lm_')
  const displayKey = isNewKey ? apiKey.key_hash : `${apiKey.key_prefix}${'*'.repeat(32)}`

  const handleCopy = async () => {
    if (!isNewKey) {
      toast({
        title: 'このキーはコピーできません',
        description: 'セキュリティ上の理由により、既存のキーは表示されません',
        variant: 'destructive',
      })
      return
    }

    try {
      await navigator.clipboard.writeText(displayKey)
      setCopied(true)
      toast({
        title: 'APIキーをコピーしました',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: 'コピーに失敗しました',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>APIキー詳細</DialogTitle>
          <DialogDescription>
            {isNewKey
              ? 'このAPIキーは一度だけ表示されます。安全に保管してください。'
              : 'セキュリティ上の理由により、APIキーの全体は表示されません。'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isNewKey && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                重要: このキーは一度だけ表示されます
              </p>
              <p className="text-xs text-yellow-700">
                今すぐコピーして安全な場所に保管してください。この画面を閉じると、二度と表示されません。
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">キー名</label>
            <p className="text-lg font-semibold">{apiKey.name}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">APIキー</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg font-mono text-sm break-all">
                {displayKey}
              </code>
              {isNewKey && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">ステータス</label>
              <div>
                <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
                  {apiKey.is_active ? '有効' : '無効'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">レート制限</label>
              <p className="text-sm">{apiKey.rate_limit} リクエスト/日</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">権限</label>
            <div className="flex flex-wrap gap-2">
              {apiKey.permissions.length === 0 ? (
                <Badge variant="secondary">なし</Badge>
              ) : apiKey.permissions.includes('*') ? (
                <Badge>すべての権限</Badge>
              ) : (
                apiKey.permissions.map((permission) => (
                  <Badge key={permission} variant="outline">
                    {permission}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {apiKey.allowed_ips && apiKey.allowed_ips.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">許可されたIPアドレス</label>
              <div className="flex flex-wrap gap-2">
                {apiKey.allowed_ips.map((ip, index) => (
                  <Badge key={index} variant="outline">
                    {ip}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <label className="text-gray-600">作成日</label>
              <p>
                {formatDistanceToNow(new Date(apiKey.created_at), {
                  addSuffix: true,
                  locale: ja,
                })}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-gray-600">最終使用</label>
              <p>
                {apiKey.last_used_at
                  ? formatDistanceToNow(new Date(apiKey.last_used_at), {
                      addSuffix: true,
                      locale: ja,
                    })
                  : '未使用'}
              </p>
            </div>
          </div>

          {apiKey.expires_at && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                有効期限:{' '}
                {formatDistanceToNow(new Date(apiKey.expires_at), {
                  addSuffix: true,
                  locale: ja,
                })}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
