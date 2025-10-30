'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ReservationType } from '@/app/actions/reservation-types'
import { CalendarIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline'
import { Switch } from '@/components/ui/switch'

interface ReservationTypeFormProps {
  type?: ReservationType | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormData) => Promise<void>
}

type Category = 'event' | 'lesson' | 'salon'

interface FormData {
  name: string
  description: string
  category: Category
  duration_minutes: number
  buffer_minutes: number
  color: string
  settings: {
    category: Category
    color: string
    enableWaitlist?: boolean
    repeatPattern?: 'daily' | 'weekly' | 'monthly'
    staffRequired?: boolean
  }
}

const COLORS = [
  { value: '#3B82F6', label: 'ブルー' },
  { value: '#10B981', label: 'グリーン' },
  { value: '#F59E0B', label: 'オレンジ' },
  { value: '#EF4444', label: 'レッド' },
  { value: '#8B5CF6', label: 'パープル' },
  { value: '#EC4899', label: 'ピンク' },
]

export function ReservationTypeForm({
  type,
  isOpen,
  onClose,
  onSubmit,
}: ReservationTypeFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: 'event',
    duration_minutes: 60,
    buffer_minutes: 0,
    color: '#3B82F6',
    settings: {
      category: 'event',
      color: '#3B82F6',
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (type) {
      setFormData({
        name: type.name,
        description: type.description || '',
        category: 'event' as Category,
        duration_minutes: type.duration_minutes,
        buffer_minutes: 0,
        color: type.color || '#3B82F6',
        settings: {
          category: 'event',
          color: type.color || '#3B82F6',
        },
      })
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'event',
        duration_minutes: 60,
        buffer_minutes: 0,
        color: '#3B82F6',
        settings: {
          category: 'event',
          color: '#3B82F6',
        },
      })
    }
  }, [type, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({
        ...formData,
        settings: {
          ...formData.settings,
          category: formData.category,
          color: formData.color,
        },
      })
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCategoryChange = (category: Category) => {
    setFormData((prev) => ({
      ...prev,
      category,
      settings: {
        ...prev.settings,
        category,
      },
    }))
  }

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'event':
        return CalendarIcon
      case 'lesson':
        return ClockIcon
      case 'salon':
        return UserGroupIcon
    }
  }

  const Icon = getCategoryIcon(formData.category)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {type ? '予約タイプを編集' : '新規予約タイプ'}
            </DialogTitle>
            <DialogDescription>
              予約タイプの詳細情報を入力してください
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="name">タイプ名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="例: 個別相談会"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="予約タイプの説明を入力してください"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="size-4" />
                      <span>イベント予約</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="lesson">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="size-4" />
                      <span>レッスン予約</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="salon">
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="size-4" />
                      <span>サロン予約</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">所要時間（分）</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration_minutes: parseInt(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buffer">準備時間（分）</Label>
                <Input
                  id="buffer"
                  type="number"
                  min="0"
                  value={formData.buffer_minutes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      buffer_minutes: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">カラー</Label>
              <Select
                value={formData.color}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, color: value }))
                }
              >
                <SelectTrigger id="color">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-4 rounded-full"
                      style={{ backgroundColor: formData.color }}
                    />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="size-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.category === 'event' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium text-sm">イベント設定</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableWaitlist" className="cursor-pointer">
                    キャンセル待ちを有効化
                  </Label>
                  <Switch
                    id="enableWaitlist"
                    checked={formData.settings.enableWaitlist || false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          enableWaitlist: checked,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {formData.category === 'lesson' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium text-sm">レッスン設定</h4>
                <div className="space-y-2">
                  <Label htmlFor="repeatPattern">繰り返しパターン</Label>
                  <Select
                    value={formData.settings.repeatPattern || 'weekly'}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          repeatPattern: value,
                        },
                      }))
                    }
                  >
                    <SelectTrigger id="repeatPattern">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">毎日</SelectItem>
                      <SelectItem value="weekly">毎週</SelectItem>
                      <SelectItem value="monthly">毎月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {formData.category === 'salon' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium text-sm">サロン設定</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="staffRequired" className="cursor-pointer">
                    スタッフ選択を必須にする
                  </Label>
                  <Switch
                    id="staffRequired"
                    checked={formData.settings.staffRequired || false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          staffRequired: checked,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : type ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
