'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { ComputerDesktopIcon, DevicePhoneMobileIcon, ClockIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { revokeAllSessions } from '@/app/actions/profile'

interface ActiveSessionsListProps {
  userId: string
  lastLoginAt?: string | null
  lastLoginIp?: string | null
}

export function ActiveSessionsList({ userId, lastLoginAt, lastLoginIp }: ActiveSessionsListProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogoutAllSessions = async () => {
    if (!confirm('This will log you out of all devices except this one. Continue?')) {
      return
    }

    setIsLoading(true)

    try {
      const result = await revokeAllSessions()

      if (!result.success) {
        toast.error(result.error || 'Failed to logout sessions')
        return
      }

      toast.success('All other sessions have been logged out')
    } catch (error) {
      console.error('Logout all sessions error:', error)
      toast.error('Failed to logout all sessions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Last Login Info */}
      {lastLoginAt && (
        <Alert>
          <ClockIcon className="h-4 w-4" />
          <AlertDescription>
            Last login: {formatDistanceToNow(new Date(lastLoginAt), { addSuffix: true })}
            {lastLoginIp && ` from ${lastLoginIp}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Active Sessions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <ComputerDesktopIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Current Session</p>
              <p className="text-sm text-muted-foreground">
                Web Browser - Active now
              </p>
              {lastLoginIp && (
                <p className="text-xs text-muted-foreground">
                  IP: {lastLoginIp}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">Active</span>
          </div>
        </div>

        {/* Example additional session - in production this would come from the database */}
        <div className="flex items-center justify-between rounded-lg border p-4 opacity-60">
          <div className="flex items-start gap-3">
            <DevicePhoneMobileIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Mobile Device</p>
              <p className="text-sm text-muted-foreground">
                iOS - 2 hours ago
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.info('Session management coming soon')}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Logout All Button */}
      <div className="flex justify-between items-center pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Logout from all devices except this one
        </p>
        <Button
          variant="destructive"
          onClick={handleLogoutAllSessions}
          disabled={isLoading}
        >
          {isLoading ? 'Logging out...' : 'Logout All Sessions'}
        </Button>
      </div>
    </div>
  )
}
