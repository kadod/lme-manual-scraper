'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StaffMemberCard } from './StaffMemberCard'
import { StaffInviteDialog } from './StaffInviteDialog'

interface StaffMember {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  role: 'owner' | 'admin' | 'member' | 'readonly'
  status: 'active' | 'pending'
  invitedAt?: string
}

interface StaffMembersListProps {
  members: StaffMember[]
  currentUserRole: string
  onInvite: (data: { email: string; role: string }) => Promise<void>
  onResendInvite: (memberId: string) => Promise<void>
  onRemove: (memberId: string) => Promise<void>
  onChangeRole: (memberId: string, role: string) => Promise<void>
}

export function StaffMembersList({
  members,
  currentUserRole,
  onInvite,
  onResendInvite,
  onRemove,
  onChangeRole,
}: StaffMembersListProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const canInvite = ['owner', 'admin'].includes(currentUserRole)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>スタッフ管理</CardTitle>
            <CardDescription>
              組織のメンバーを管理し、権限を設定します
            </CardDescription>
          </div>
          {canInvite && (
            <Button onClick={() => setInviteDialogOpen(true)}>
              スタッフを招待
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {members.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              スタッフメンバーがいません
            </p>
          ) : (
            members.map((member) => (
              <StaffMemberCard
                key={member.id}
                member={member}
                currentUserRole={currentUserRole}
                onResendInvite={currentUserRole === 'owner' ? onResendInvite : undefined}
                onRemove={currentUserRole === 'owner' ? onRemove : undefined}
                onChangeRole={currentUserRole === 'owner' ? onChangeRole : undefined}
              />
            ))
          )}
        </div>
      </CardContent>

      <StaffInviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={onInvite}
      />
    </Card>
  )
}
