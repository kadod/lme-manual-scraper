'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PlusIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { CreateAPIKeyDialog } from './CreateAPIKeyDialog'
import { APIKeyDetailsDialog } from './APIKeyDetailsDialog'
import { deleteAPIKey, toggleAPIKey } from '@/app/actions/system'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { APIKey } from '@/types/system'

interface APIKeysListProps {
  apiKeys: APIKey[]
}

export function APIKeysList({ apiKeys: initialKeys }: APIKeysListProps) {
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState(initialKeys)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const handleDelete = async (keyId: string) => {
    if (!confirm('このAPIキーを削除してもよろしいですか？')) return

    try {
      await deleteAPIKey(keyId)
      setApiKeys((prev) => prev.filter((k) => k.id !== keyId))
      toast({
        title: 'APIキーを削除しました',
      })
    } catch (error) {
      toast({
        title: 'APIキーの削除に失敗しました',
        description: error instanceof Error ? error.message : '不明なエラー',
        variant: 'destructive',
      })
    }
  }

  const handleToggle = async (keyId: string, isActive: boolean) => {
    try {
      await toggleAPIKey(keyId, !isActive)
      setApiKeys((prev) =>
        prev.map((k) => (k.id === keyId ? { ...k, is_active: !isActive } : k))
      )
      toast({
        title: isActive ? 'APIキーを無効化しました' : 'APIキーを有効化しました',
      })
    } catch (error) {
      toast({
        title: 'APIキーの状態変更に失敗しました',
        description: error instanceof Error ? error.message : '不明なエラー',
        variant: 'destructive',
      })
    }
  }

  const handleKeyCreated = (newKey: APIKey & { full_key: string }) => {
    setApiKeys((prev) => [newKey, ...prev])
    setSelectedKey({ ...newKey, key_hash: newKey.full_key })
    setIsDetailsDialogOpen(true)
  }

  const formatPermissions = (permissions: string[]) => {
    if (permissions.length === 0) return 'なし'
    if (permissions.includes('*')) return 'すべて'
    return `${permissions.length}個`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {apiKeys.length}個のAPIキー
        </p>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          新しいAPIキーを作成
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>キー</TableHead>
              <TableHead>権限</TableHead>
              <TableHead>レート制限</TableHead>
              <TableHead>最終使用</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  APIキーが作成されていません
                </TableCell>
              </TableRow>
            ) : (
              apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {apiKey.key_prefix}...
                    </code>
                  </TableCell>
                  <TableCell>{formatPermissions(apiKey.permissions)}</TableCell>
                  <TableCell>{apiKey.rate_limit}/日</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {apiKey.last_used_at
                      ? formatDistanceToNow(new Date(apiKey.last_used_at), {
                          addSuffix: true,
                          locale: ja,
                        })
                      : '未使用'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
                      {apiKey.is_active ? '有効' : '無効'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedKey(apiKey)
                          setIsDetailsDialogOpen(true)
                        }}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(apiKey.id, apiKey.is_active)}
                      >
                        {apiKey.is_active ? '無効化' : '有効化'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(apiKey.id)}
                      >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateAPIKeyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onKeyCreated={handleKeyCreated}
      />

      <APIKeyDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        apiKey={selectedKey}
      />
    </div>
  )
}
