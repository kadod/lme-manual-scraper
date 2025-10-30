'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { updateNotificationSettings } from '@/app/actions/profile'

interface NotificationSettingsData {
  email: {
    message_sent: boolean
    form_submitted: boolean
    reservation_created: boolean
    weekly_report: boolean
  }
  push: {
    message_failed: boolean
    reservation_reminder: boolean
  }
}

interface NotificationSettingsProps {
  userId: string
  currentSettings?: NotificationSettingsData
}

const DEFAULT_SETTINGS: NotificationSettingsData = {
  email: {
    message_sent: true,
    form_submitted: true,
    reservation_created: true,
    weekly_report: true,
  },
  push: {
    message_failed: true,
    reservation_reminder: true,
  },
}

export function NotificationSettings({ userId, currentSettings }: NotificationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState(currentSettings || DEFAULT_SETTINGS)

  const handleToggle = (category: 'email' | 'push', key: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !(prev[category] as any)[key],
      },
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const result = await updateNotificationSettings(settings)

      if (!result.success) {
        toast.error(result.error || 'Failed to update settings')
        return
      }

      toast.success('Notification settings updated successfully')
    } catch (error) {
      console.error('Notification settings update error:', error)
      toast.error('Failed to update settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Email Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Receive email notifications for important events
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_message_sent">Message Sent</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when a message is successfully sent
              </p>
            </div>
            <Switch
              id="email_message_sent"
              checked={settings.email.message_sent}
              onCheckedChange={() => handleToggle('email', 'message_sent')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_form_submitted">Form Submitted</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone submits a form
              </p>
            </div>
            <Switch
              id="email_form_submitted"
              checked={settings.email.form_submitted}
              onCheckedChange={() => handleToggle('email', 'form_submitted')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_reservation_created">Reservation Created</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when a new reservation is made
              </p>
            </div>
            <Switch
              id="email_reservation_created"
              checked={settings.email.reservation_created}
              onCheckedChange={() => handleToggle('email', 'reservation_created')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_weekly_report">Weekly Report</Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of your account activity
              </p>
            </div>
            <Switch
              id="email_weekly_report"
              checked={settings.email.weekly_report}
              onCheckedChange={() => handleToggle('email', 'weekly_report')}
            />
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Push Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Receive push notifications for urgent events
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push_message_failed">Message Failed</Label>
              <p className="text-sm text-muted-foreground">
                Get notified immediately when a message fails to send
              </p>
            </div>
            <Switch
              id="push_message_failed"
              checked={settings.push.message_failed}
              onCheckedChange={() => handleToggle('push', 'message_failed')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push_reservation_reminder">Reservation Reminder</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded of upcoming reservations
              </p>
            </div>
            <Switch
              id="push_reservation_reminder"
              checked={settings.push.reservation_reminder}
              onCheckedChange={() => handleToggle('push', 'reservation_reminder')}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
