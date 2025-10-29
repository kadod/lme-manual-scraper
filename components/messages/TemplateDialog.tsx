'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface TemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (template: TemplateFormData) => Promise<void>
  initialData?: TemplateFormData | null
  mode: 'create' | 'edit'
}

export interface TemplateFormData {
  id?: string
  name: string
  category: string
  description: string
  type: 'text' | 'image' | 'video' | 'flex' | 'carousel'
  content: any
  variables: string[]
}

const CATEGORIES = [
  'プロモーション',
  'お知らせ',
  'あいさつ',
  'フォローアップ',
  'イベント',
  'その他',
]

const MESSAGE_TYPES = [
  { value: 'text', label: 'テキスト' },
  { value: 'image', label: '画像' },
  { value: 'video', label: '動画' },
  { value: 'flex', label: 'Flexメッセージ' },
  { value: 'carousel', label: 'カルーセル' },
]

const AVAILABLE_VARIABLES = [
  { key: 'name', label: '友だち名', description: '友だちの表示名' },
  { key: 'line_user_id', label: 'LINE ID', description: 'LINEユーザーID' },
]

export function TemplateDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  mode,
}: TemplateDialogProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    category: 'その他',
    description: '',
    type: 'text',
    content: { text: '' },
    variables: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [variableInput, setVariableInput] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        name: '',
        category: 'その他',
        description: '',
        type: 'text',
        content: { text: '' },
        variables: [],
      })
    }
  }, [initialData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save template:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const insertVariable = (variable: string) => {
    if (formData.type === 'text' && formData.content.text !== undefined) {
      const textarea = document.getElementById('content-text') as HTMLTextAreaElement
      const start = textarea?.selectionStart || 0
      const end = textarea?.selectionEnd || 0
      const text = formData.content.text || ''
      const before = text.substring(0, start)
      const after = text.substring(end)
      const newText = before + `{${variable}}` + after

      setFormData({
        ...formData,
        content: { ...formData.content, text: newText },
      })

      if (!formData.variables.includes(variable)) {
        setFormData((prev) => ({
          ...prev,
          variables: [...prev.variables, variable],
        }))
      }

      setTimeout(() => {
        if (textarea) {
          textarea.focus()
          textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2)
        }
      }, 0)
    }
  }

  const addCustomVariable = () => {
    if (variableInput && !formData.variables.includes(variableInput)) {
      setFormData({
        ...formData,
        variables: [...formData.variables, variableInput],
      })
      setVariableInput('')
    }
  }

  const removeVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((v) => v !== variable),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'テンプレート作成' : 'テンプレート編集'}
          </DialogTitle>
          <DialogDescription>
            メッセージテンプレートを{mode === 'create' ? '作成' : '編集'}します
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">テンプレート名</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例: 新規登録ありがとうメッセージ"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">メッセージタイプ</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => {
                  let newContent = {}
                  if (value === 'text') newContent = { text: '' }
                  else if (value === 'image') newContent = { originalContentUrl: '', previewImageUrl: '' }
                  else if (value === 'video') newContent = { originalContentUrl: '', previewImageUrl: '' }
                  else if (value === 'flex') newContent = { altText: '', contents: {} }
                  else if (value === 'carousel') newContent = { altText: '', contents: [] }

                  setFormData({ ...formData, type: value, content: newContent })
                }}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明 (任意)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="このテンプレートの用途や説明を入力"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>変数挿入</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_VARIABLES.map((variable) => (
                <Button
                  key={variable.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable(variable.key)}
                  title={variable.description}
                >
                  {`{${variable.key}}`}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={variableInput}
                onChange={(e) => setVariableInput(e.target.value)}
                placeholder="カスタム変数名 (例: custom_field1)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomVariable()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addCustomVariable}>
                追加
              </Button>
            </div>
          </div>

          {formData.variables.length > 0 && (
            <div className="space-y-2">
              <Label>使用中の変数</Label>
              <div className="flex flex-wrap gap-2">
                {formData.variables.map((variable) => (
                  <Badge key={variable} variant="secondary" className="pr-1">
                    {`{${variable}}`}
                    <button
                      type="button"
                      onClick={() => removeVariable(variable)}
                      className="ml-1 hover:text-destructive"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content-text">メッセージ内容</Label>
            {formData.type === 'text' && (
              <Textarea
                id="content-text"
                value={formData.content.text || ''}
                onChange={(e) =>
                  setFormData({ ...formData, content: { text: e.target.value } })
                }
                placeholder="メッセージ本文を入力してください。変数ボタンをクリックして挿入できます。"
                rows={6}
                required
              />
            )}
            {formData.type === 'image' && (
              <div className="space-y-2">
                <Input
                  value={formData.content.originalContentUrl || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      content: { ...formData.content, originalContentUrl: e.target.value },
                    })
                  }
                  placeholder="画像URL"
                  required
                />
                <Input
                  value={formData.content.previewImageUrl || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      content: { ...formData.content, previewImageUrl: e.target.value },
                    })
                  }
                  placeholder="プレビュー画像URL"
                  required
                />
              </div>
            )}
            {formData.type === 'video' && (
              <div className="space-y-2">
                <Input
                  value={formData.content.originalContentUrl || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      content: { ...formData.content, originalContentUrl: e.target.value },
                    })
                  }
                  placeholder="動画URL"
                  required
                />
                <Input
                  value={formData.content.previewImageUrl || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      content: { ...formData.content, previewImageUrl: e.target.value },
                    })
                  }
                  placeholder="プレビュー画像URL"
                  required
                />
              </div>
            )}
            {(formData.type === 'flex' || formData.type === 'carousel') && (
              <Textarea
                value={JSON.stringify(formData.content, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    setFormData({ ...formData, content: parsed })
                  } catch (error) {
                    // Invalid JSON, keep as is
                  }
                }}
                placeholder="JSON形式で入力"
                rows={10}
                className="font-mono text-sm"
                required
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
