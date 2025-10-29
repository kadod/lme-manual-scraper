'use client'

import { useState } from 'react'
import { TemplateCard } from './TemplateCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'

interface Template {
  id: string
  name: string
  category: string | null
  description: string | null
  type: 'text' | 'image' | 'video' | 'flex' | 'carousel'
  content: any
  variables: string[]
  created_at: string
  updated_at: string
}

interface TemplateListProps {
  templates: Template[]
  categories: string[]
  onPreview: (templateId: string) => void
  onEdit: (templateId: string) => void
  onDelete: (templateId: string) => void
  onCreate: () => void
}

export function TemplateList({
  templates,
  categories,
  onPreview,
  onEdit,
  onDelete,
  onCreate,
}: TemplateListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === 'all' || template.category === categoryFilter

    const matchesType = typeFilter === 'all' || template.type === typeFilter

    return matchesSearch && matchesCategory && matchesType
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="テンプレートを検索..."
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのカテゴリ</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="タイプ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのタイプ</SelectItem>
              <SelectItem value="text">テキスト</SelectItem>
              <SelectItem value="image">画像</SelectItem>
              <SelectItem value="video">動画</SelectItem>
              <SelectItem value="flex">Flex</SelectItem>
              <SelectItem value="carousel">カルーセル</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onCreate}>
            <PlusIcon className="h-4 w-4 mr-1" />
            新規作成
          </Button>
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {searchQuery || categoryFilter !== 'all' || typeFilter !== 'all'
              ? '条件に一致するテンプレートが見つかりません'
              : 'テンプレートがまだありません'}
          </p>
          {!searchQuery && categoryFilter === 'all' && typeFilter === 'all' && (
            <Button onClick={onCreate}>
              <PlusIcon className="h-4 w-4 mr-1" />
              最初のテンプレートを作成
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={onPreview}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <div className="text-sm text-muted-foreground text-center">
        {filteredTemplates.length} / {templates.length} テンプレート
      </div>
    </div>
  )
}
