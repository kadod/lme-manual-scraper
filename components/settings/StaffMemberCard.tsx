'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface StaffMember {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  role: 'owner' | 'admin' | 'member' | 'readonly'
  status: 'active' | 'pending'
  invitedAt?: string
}

interface StaffMemberCardProps {
  member: StaffMember
  currentUserRole: string
  onResendInvite?: (memberId: string) => Promise<void>
  onRemove?: (memberId: string) => Promise<void>
  onChangeRole?: (memberId: string, role: string) => Promise<void>
}

const ROLE_LABELS = {
  owner: 'オーナー',
  admin: '管理者',
  member: 'メンバー',
  readonly: '閲覧のみ',
}

const STATUS_VARIANTS = {
  active: 'default' as const,
  pending: 'secondary' as const,
}

export function StaffMemberCard({
  member,
  currentUserRole,
  onResendInvite,
  onRemove,
  onChangeRole,
}: StaffMemberCardProps) {
  const canManage = currentUserRole === 'owner' && member.role !== 'owner'
  const initials = member.fullName?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={member.avatarUrl} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{member.fullName || member.email}</p>
            <Badge variant={STATUS_VARIANTS[member.status]}>
              {member.status === 'active' ? 'アクティブ' : '招待中'}
            </Badge>
          </div>
          {member.fullName && (
            <p className="text-sm text-gray-500">{member.email}</p>
          )}
          <p className="text-sm text-gray-500">
            {ROLE_LABELS[member.role]}
          </p>
        </div>
      </div>

      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              操作
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {member.status === 'pending' && onResendInvite && (
              <DropdownMenuItem onClick={() => onResendInvite(member.id)}>
                招待を再送信
              </DropdownMenuItem>
            )}
            {onChangeRole && (
              <>
                <DropdownMenuItem onClick={() => onChangeRole(member.id, 'admin')}>
                  管理者に変更
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeRole(member.id, 'member')}>
                  メンバーに変更
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeRole(member.id, 'readonly')}>
                  閲覧のみに変更
                </DropdownMenuItem>
              </>
            )}
            {onRemove && (
              <DropdownMenuItem
                onClick={() => onRemove(member.id)}
                className="text-red-600"
              >
                削除
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {member.role === 'owner' && (
        <Badge variant="outline">変更不可</Badge>
      )}
    </div>
  )
}
