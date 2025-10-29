'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createAPIKey } from '@/app/actions/system'
import { useToast } from '@/hooks/use-toast'
import type { APIKey } from '@/types/system'

interface CreateAPIKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onKeyCreated: (apiKey: APIKey & { full_key: string }) => void
}

const availablePermissions = [
  { value: 'read:friends', label: '友だち情報の読み取り' },
  { value: 'write:friends', label: '友だち情報の書き込み' },
  { value: 'read:messages', label: 'メッセージの読み取り' },
  { value: 'write:messages', label: 'メッセージの送信' },
  { value: 'read:forms', label: 'フォームの読み取り' },
  { value: 'write:forms', label: 'フォームの作成・編集' },
  { value: 'read:analytics', label: '分析データの読み取り' },
  { value: 'read:reservations', label: '予約情報の読み取り' },
  { value: 'write:reservations', label: '予約の作成・編集' },
]

export function CreateAPIKeyDialog({
  open,
  onOpenChange,
  onKeyCreated,
}: CreateAPIKeyDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [rateLimit, setRateLimit] = useState('1000')

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: 'APIキー名を入力してください',
        variant: 'destructive',
      })
      return
    }

    if (selectedPermissions.length === 0) {
      toast({
        title: '最低1つの権限を選択してください',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await createAPIKey({
        name,
        permissions: selectedPermissions,
        rate_limit: parseInt(rateLimit),
      })

      onKeyCreated(result)
      onOpenChange(false)

      // Reset form
      setName('')
      setSelectedPermissions([])
      setRateLimit('1000')

      toast({
        title: 'APIキーを作成しました',
        description: 'キーは一度だけ表示されます。安全に保管してください。',
      })
    } catch (error) {
      toast({
        title: 'APIキーの作成に失敗しました',
        description: error instanceof Error ? error.message : '不明なエラー',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新しいAPIキーを作成</DialogTitle>
          <DialogDescription>
            外部アプリケーションからのアクセスに使用するAPIキーを作成します
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">キー名 *</Label>
            <Input
              id="name"
              placeholder="例: 本番環境API"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate-limit">レート制限（1日あたりのリクエスト数）</Label>
            <Input
              id="rate-limit"
              type="number"
              min="100"
              max="100000"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              推奨: 1000 - 10000リクエスト/日
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">権限 *</Label>
            <div className="space-y-3 border rounded-lg p-4">
              {availablePermissions.map((permission) => (
                <div key={permission.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission.value}
                    checked={selectedPermissions.includes(permission.value)}
                    onCheckedChange={() => handlePermissionToggle(permission.value)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor={permission.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {permission.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {selectedPermissions.length}個の権限が選択されています
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? '作成中...' : 'APIキーを作成'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
