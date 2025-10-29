'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface OrganizationFormProps {
  initialData: {
    name: string
    websiteUrl?: string
    contactEmail?: string
  }
  onSubmit: (data: any) => Promise<void>
}

export function OrganizationForm({ initialData, onSubmit }: OrganizationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(initialData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>基本情報</CardTitle>
        <CardDescription>組織の基本的な情報を管理します</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">組織名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="株式会社サンプル"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">ウェブサイト</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={formData.websiteUrl || ''}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">連絡先メール</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail || ''}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="contact@example.com"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
