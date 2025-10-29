'use client'

import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { updateAvatar } from '@/app/actions/profile'
import { UserIcon, CameraIcon } from '@heroicons/react/24/outline'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
}

export function AvatarUpload({ userId, currentAvatarUrl }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const result = await updateAvatar(formData)

      if (!result.success) {
        toast.error(result.error || 'Failed to upload avatar')
        setPreviewUrl(currentAvatarUrl || null)
        return
      }

      if (result.avatar_url) {
        setPreviewUrl(result.avatar_url)
      }
      toast.success('Avatar updated successfully')
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('Failed to upload avatar. Please try again.')
      setPreviewUrl(currentAvatarUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={previewUrl || undefined} alt="Profile picture" />
          <AvatarFallback>
            <UserIcon className="h-16 w-16 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload avatar"
      />

      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="w-full"
      >
        <CameraIcon className="h-4 w-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Change Avatar'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Recommended: Square image, at least 200x200px
        <br />
        Max file size: 5MB
      </p>
    </div>
  )
}
