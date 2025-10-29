'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { AuditLog } from '@/types/system'

interface AuditLogDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: AuditLog | null
}

export function AuditLogDetailDialog({
  open,
  onOpenChange,
  log,
}: AuditLogDetailDialogProps) {
  if (!log) return null

  const formatJson = (obj: any): string => {
    return JSON.stringify(obj, null, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>監査ログ詳細</DialogTitle>
          <DialogDescription>
            {format(new Date(log.created_at), 'yyyy年MM月dd日 HH:mm:ss', { locale: ja })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">ユーザー</label>
              <p className="text-sm">
                {log.user_id ? log.user_email || 'ユーザー' : 'システム'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">アクション</label>
              <div>
                <Badge>{log.action}</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">リソースタイプ</label>
              <p className="text-sm">{log.resource_type}</p>
            </div>

            {log.resource_id && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">リソースID</label>
                <p className="text-sm font-mono text-gray-600">{log.resource_id}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">IPアドレス</label>
              <p className="text-sm font-mono">{log.ip_address || '-'}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">日時</label>
              <p className="text-sm">
                {format(new Date(log.created_at), 'yyyy/MM/dd HH:mm:ss', { locale: ja })}
              </p>
            </div>
          </div>

          {log.user_agent && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">User Agent</label>
              <p className="text-xs text-gray-600 break-all">{log.user_agent}</p>
            </div>
          )}

          {log.details && Object.keys(log.details).length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">詳細情報</label>
              <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                {formatJson(log.details)}
              </pre>
            </div>
          )}

          {log.details?.changes && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">変更内容</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">変更前</p>
                  <pre className="bg-red-50 p-3 rounded-lg text-xs overflow-x-auto border border-red-200">
                    {formatJson(log.details.changes.before)}
                  </pre>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">変更後</p>
                  <pre className="bg-green-50 p-3 rounded-lg text-xs overflow-x-auto border border-green-200">
                    {formatJson(log.details.changes.after)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
