'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StaffInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (data: { email: string; role: string }) => Promise<void>
}

const ROLE_DESCRIPTIONS = {
  admin: '組織の設定変更、スタッフ管理が可能',
  member: '通常の機能利用が可能',
  readonly: '閲覧のみ可能',
}

export function StaffInviteDialog({ open, onOpenChange, onInvite }: StaffInviteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onInvite({ email, role })
      setEmail('')
      setRole('member')
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>スタッフを招待</DialogTitle>
          <DialogDescription>
            新しいスタッフメンバーをメールで招待します
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">役割 *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">管理者</SelectItem>
                <SelectItem value="member">メンバー</SelectItem>
                <SelectItem value="readonly">閲覧のみ</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS]}
            </p>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '招待中...' : '招待を送信'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
