'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  RectangleGroupIcon,
  ViewColumnsIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface TemplateCardProps {
  template: {
    id: string
    name: string
    category: string | null
    description: string | null
    type: 'text' | 'image' | 'video' | 'flex' | 'carousel'
    variables: string[]
    created_at: string
    updated_at: string
  }
  onPreview: (templateId: string) => void
  onEdit: (templateId: string) => void
  onDelete: (templateId: string) => void
}

const TYPE_ICONS = {
  text: DocumentTextIcon,
  image: PhotoIcon,
  video: VideoCameraIcon,
  flex: RectangleGroupIcon,
  carousel: ViewColumnsIcon,
}

const TYPE_LABELS = {
  text: 'テキスト',
  image: '画像',
  video: '動画',
  flex: 'Flexメッセージ',
  carousel: 'カルーセル',
}

const CATEGORY_COLORS: Record<string, string> = {
  'プロモーション': 'bg-purple-100 text-purple-800 border-purple-200',
  'お知らせ': 'bg-blue-100 text-blue-800 border-blue-200',
  'あいさつ': 'bg-green-100 text-green-800 border-green-200',
  'フォローアップ': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'イベント': 'bg-pink-100 text-pink-800 border-pink-200',
  'その他': 'bg-gray-100 text-gray-800 border-gray-200',
}

export function TemplateCard({ template, onPreview, onEdit, onDelete }: TemplateCardProps) {
  const TypeIcon = TYPE_ICONS[template.type]
  const categoryColor = template.category ? CATEGORY_COLORS[template.category] || CATEGORY_COLORS['その他'] : CATEGORY_COLORS['その他']

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">{template.name}</CardTitle>
          </div>
          <Badge variant="outline" className={categoryColor}>
            {template.category || 'その他'}
          </Badge>
        </div>
        {template.description && (
          <CardDescription className="line-clamp-2">
            {template.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {TYPE_LABELS[template.type]}
          </Badge>
          {template.variables.length > 0 && (
            <Badge variant="outline" className="text-xs">
              変数: {template.variables.length}個
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <div>作成: {format(new Date(template.created_at), 'yyyy/MM/dd HH:mm')}</div>
          {template.updated_at !== template.created_at && (
            <div>更新: {format(new Date(template.updated_at), 'yyyy/MM/dd HH:mm')}</div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPreview(template.id)}
          className="flex-1"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          プレビュー
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(template.id)}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(template.id)}
          className="text-destructive hover:text-destructive"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
