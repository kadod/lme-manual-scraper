'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface LogoUploadProps {
  currentLogoUrl?: string
  onUpload: (file: File) => Promise<void>
}

export function LogoUpload({ currentLogoUrl, onUpload }: LogoUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsLoading(true)
    try {
      await onUpload(file)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ロゴ画像</CardTitle>
        <CardDescription>推奨サイズ: 200x200px (PNG/JPG, 最大2MB)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="h-32 w-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
              {preview ? (
                <Image
                  src={preview}
                  alt="Logo preview"
                  width={128}
                  height={128}
                  className="object-contain"
                />
              ) : (
                <span className="text-sm text-gray-400">ロゴなし</span>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Label>ロゴファイル</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                {isLoading ? 'アップロード中...' : 'ファイルを選択'}
              </Button>
              {preview && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setPreview(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                >
                  削除
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              PNG、JPG形式のファイルをアップロードしてください
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
