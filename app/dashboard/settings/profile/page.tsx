import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { AvatarUpload } from '@/components/settings/AvatarUpload'
import { PasswordChangeForm } from '@/components/settings/PasswordChangeForm'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { TwoFactorSetup } from '@/components/settings/TwoFactorSetup'
import { ActiveSessionsList } from '@/components/settings/ActiveSessionsList'

export const metadata = {
  title: 'Profile Settings - L Message SaaS',
  description: 'Manage your profile and account settings',
}

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile data
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information, security, and notification preferences
        </p>
      </div>

      {/* Avatar and Basic Info Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload a profile picture to personalize your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUpload
              userId={user.id}
              currentAvatarUrl={profile?.avatar_url}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              userId={user.id}
              initialData={{
                full_name: profile?.full_name || '',
                email: user.email || '',
                phone_number: profile?.phone_number || '',
                timezone: profile?.timezone || 'Asia/Tokyo',
                locale: profile?.locale || 'ja',
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>

      <Separator />

      {/* Notification Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationSettings
            userId={user.id}
            currentSettings={profile?.notification_settings as any}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Two-Factor Authentication Section */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TwoFactorSetup
            userId={user.id}
            isEnabled={profile?.two_factor_enabled || false}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Active Sessions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage your active login sessions across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActiveSessionsList
            userId={user.id}
            lastLoginAt={profile?.last_login_at}
            lastLoginIp={profile?.last_login_ip}
          />
        </CardContent>
      </Card>
    </div>
  )
}
