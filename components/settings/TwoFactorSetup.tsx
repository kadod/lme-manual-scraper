'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import { enable2FA, verify2FA, disable2FA } from '@/app/actions/profile'

interface TwoFactorSetupProps {
  userId: string
  isEnabled: boolean
}

export function TwoFactorSetup({ userId, isEnabled }: TwoFactorSetupProps) {
  const [showSetup, setShowSetup] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [secret, setSecret] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEnable2FA = async () => {
    setIsLoading(true)

    try {
      const result = await enable2FA()

      if (!result.success) {
        toast.error(result.error || 'Failed to enable 2FA')
        return
      }

      if (result.qr_code_url && result.secret) {
        setQrCodeUrl(result.qr_code_url)
        setSecret(result.secret)
        setShowSetup(true)
      }
    } catch (error) {
      console.error('2FA setup error:', error)
      toast.error('Failed to generate 2FA setup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    if (!secret) {
      toast.error('2FA setup incomplete. Please try again.')
      return
    }

    setIsLoading(true)

    try {
      const result = await verify2FA({
        code: verificationCode,
        secret: secret,
      })

      if (!result.success) {
        toast.error(result.error || 'Invalid verification code')
        return
      }

      toast.success('Two-factor authentication enabled successfully')
      setShowSetup(false)
      setVerificationCode('')
      window.location.reload()
    } catch (error) {
      console.error('2FA verification error:', error)
      toast.error('Invalid verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return
    }

    setIsLoading(true)

    try {
      const result = await disable2FA()

      if (!result.success) {
        toast.error(result.error || 'Failed to disable 2FA')
        return
      }

      toast.success('Two-factor authentication disabled')
      window.location.reload()
    } catch (error) {
      console.error('2FA disable error:', error)
      toast.error('Failed to disable 2FA. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 rounded-lg border p-4">
        <div className="flex-shrink-0">
          <ShieldCheckIcon className={`h-6 w-6 ${isEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-medium">
            Two-factor authentication is {isEnabled ? 'enabled' : 'disabled'}
          </p>
          <p className="text-sm text-muted-foreground">
            {isEnabled
              ? 'Your account is protected with two-factor authentication.'
              : 'Add an extra layer of security by requiring a verification code in addition to your password.'}
          </p>
        </div>
        <Button
          variant={isEnabled ? 'outline' : 'default'}
          onClick={isEnabled ? handleDisable2FA : handleEnable2FA}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : isEnabled ? 'Disable' : 'Enable'}
        </Button>
      </div>

      {/* Setup Dialog */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app, then enter the verification code.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* QR Code */}
            {qrCodeUrl && (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-lg border p-4 bg-white">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="h-48 w-48" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">Manual Entry</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {secret}
                  </code>
                </div>
              </div>
            )}

            {/* Verification Code */}
            <div className="space-y-2">
              <Label htmlFor="verification_code">Verification Code</Label>
              <Input
                id="verification_code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSetup(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleVerify} disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
