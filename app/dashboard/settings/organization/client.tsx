'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrganizationForm } from '@/components/settings/OrganizationForm'
import { LogoUpload } from '@/components/settings/LogoUpload'
import { ColorPicker } from '@/components/settings/ColorPicker'
import { StaffMembersList } from '@/components/settings/StaffMembersList'
import { DeleteOrganizationDialog } from '@/components/settings/DeleteOrganizationDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'

interface Organization {
  id: string
  name: string
  slug: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  websiteUrl?: string
  contactEmail?: string
}

interface Member {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  role: 'owner' | 'admin' | 'member' | 'readonly'
  status: 'active' | 'pending'
  invitedAt?: string
}

interface OrganizationSettingsClientProps {
  organization: Organization
  currentUserRole: string
  members: Member[]
}

export function OrganizationSettingsClient({
  organization,
  currentUserRole,
  members,
}: OrganizationSettingsClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const canManageOrg = ['owner', 'admin'].includes(currentUserRole)
  const isOwner = currentUserRole === 'owner'

  const handleUpdateOrganization = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update organization')
      }

      toast({
        title: '保存しました',
        description: '組織情報を更新しました',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'エラー',
        description: '組織情報の更新に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadLogo = async (file: File) => {
    const formData = new FormData()
    formData.append('logo', file)

    try {
      const response = await fetch('/api/organization/logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload logo')
      }

      toast({
        title: 'アップロードしました',
        description: 'ロゴ画像を更新しました',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ロゴのアップロードに失敗しました',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateColors = async (colors: { primaryColor: string; secondaryColor: string }) => {
    await handleUpdateOrganization(colors)
  }

  const handleInviteStaff = async (data: { email: string; role: string }) => {
    try {
      const response = await fetch('/api/organization/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to invite staff')
      }

      toast({
        title: '招待を送信しました',
        description: `${data.email} に招待メールを送信しました`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'スタッフの招待に失敗しました',
        variant: 'destructive',
      })
    }
  }

  const handleResendInvite = async (memberId: string) => {
    try {
      const response = await fetch(`/api/organization/staff/invite/${memberId}/resend`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to resend invitation')
      }

      toast({
        title: '招待を再送信しました',
        description: '招待メールを再送信しました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: '招待の再送信に失敗しました',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveStaff = async (memberId: string) => {
    try {
      const response = await fetch(`/api/organization/staff/${memberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove staff')
      }

      toast({
        title: '削除しました',
        description: 'スタッフメンバーを削除しました',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'スタッフの削除に失敗しました',
        variant: 'destructive',
      })
    }
  }

  const handleChangeRole = async (memberId: string, role: string) => {
    try {
      const response = await fetch(`/api/organization/staff/${memberId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        throw new Error('Failed to change role')
      }

      toast({
        title: '変更しました',
        description: 'スタッフの役割を変更しました',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'エラー',
        description: '役割の変更に失敗しました',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteOrganization = async () => {
    try {
      const response = await fetch('/api/organization', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete organization')
      }

      toast({
        title: '削除しました',
        description: '組織を完全に削除しました',
      })

      router.push('/dashboard')
    } catch (error) {
      toast({
        title: 'エラー',
        description: '組織の削除に失敗しました',
        variant: 'destructive',
      })
      throw error
    }
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">組織設定</h1>
        <p className="text-gray-600 mt-2">
          組織の基本情報、ブランディング、スタッフを管理します
        </p>
      </div>

      {!canManageOrg && (
        <Alert>
          <AlertDescription>
            この設定を変更するには、管理者権限が必要です
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {canManageOrg && (
          <>
            <OrganizationForm
              initialData={{
                name: organization.name,
                websiteUrl: organization.websiteUrl,
                contactEmail: organization.contactEmail,
              }}
              onSubmit={handleUpdateOrganization}
            />

            <LogoUpload currentLogoUrl={organization.logoUrl} onUpload={handleUploadLogo} />

            <ColorPicker
              primaryColor={organization.primaryColor}
              secondaryColor={organization.secondaryColor}
              onUpdate={handleUpdateColors}
            />
          </>
        )}

        <StaffMembersList
          members={members}
          currentUserRole={currentUserRole}
          onInvite={handleInviteStaff}
          onResendInvite={handleResendInvite}
          onRemove={handleRemoveStaff}
          onChangeRole={handleChangeRole}
        />

        {isOwner && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">危険な操作</CardTitle>
              <CardDescription>
                以下の操作は取り消すことができません。注意して実行してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertDescription>
                    組織を削除すると、すべてのデータ（友だち、メッセージ、フォーム、予約、分析データなど）が完全に削除されます。
                    この操作は取り消すことができません。
                  </AlertDescription>
                </Alert>

                <DeleteOrganizationDialog
                  organizationName={organization.name}
                  onDelete={handleDeleteOrganization}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
