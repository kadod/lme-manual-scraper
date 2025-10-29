'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { updateProfile } from '@/app/actions/profile'

interface ProfileFormProps {
  userId: string
  initialData: {
    full_name: string
    email: string
    phone_number: string
    timezone: string
    locale: string
  }
}

export function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (formData.phone_number && !/^[\d\-+() ]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Invalid phone number format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsLoading(true)

    try {
      const result = await updateProfile({
        full_name: formData.full_name,
        phone_number: formData.phone_number || undefined,
        timezone: formData.timezone,
        locale: formData.locale,
      })

      if (!result.success) {
        toast.error(result.error || 'Failed to update profile')
        return
      }

      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="John Doe"
          aria-invalid={!!errors.full_name}
          aria-describedby={errors.full_name ? 'full_name-error' : undefined}
        />
        {errors.full_name && (
          <p id="full_name-error" className="text-sm text-destructive">
            {errors.full_name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          disabled
          className="bg-muted"
        />
        <p className="text-sm text-muted-foreground">
          Email cannot be changed. Contact support if you need to update your email.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input
          id="phone_number"
          type="tel"
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          placeholder="+81 90-1234-5678"
          aria-invalid={!!errors.phone_number}
          aria-describedby={errors.phone_number ? 'phone_number-error' : undefined}
        />
        {errors.phone_number && (
          <p id="phone_number-error" className="text-sm text-destructive">
            {errors.phone_number}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={formData.timezone}
            onValueChange={(value) => setFormData({ ...formData, timezone: value })}
          >
            <SelectTrigger id="timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
              <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
              <SelectItem value="America/Los_Angeles">America/Los Angeles (PST)</SelectItem>
              <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locale">Language</Label>
          <Select
            value={formData.locale}
            onValueChange={(value) => setFormData({ ...formData, locale: value })}
          >
            <SelectTrigger id="locale">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ja">Japanese (日本語)</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setFormData(initialData)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
