'use client'

import { DocumentTextIcon, ChartBarIcon, EllipsisVerticalIcon, QrCodeIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Form } from '@/app/actions/forms'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'
import { useState } from 'react'

type FormCardProps = {
  form: Form
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onShowQR: (id: string) => void
}

export function FormCard({ form, onDelete, onDuplicate, onShowQR }: FormCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">下書き</Badge>
      case 'published':
        return <Badge variant="default" className="bg-green-600">公開中</Badge>
      case 'closed':
        return <Badge variant="outline">終了</Badge>
      default:
        return null
    }
  }

  const handleDelete = async () => {
    if (confirm('本当にこのフォームを削除しますか？')) {
      setIsDeleting(true)
      try {
        await onDelete(form.id)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <DocumentTextIcon className="h-5 w-5 text-muted-foreground" />
              {getStatusBadge(form.status)}
            </div>
            <CardTitle className="text-lg mb-1">{form.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {form.description || 'フォームの説明がありません'}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/forms/${form.id}`}>編集</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/forms/${form.id}/responses`}>回答を見る</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShowQR(form.id)}>
                QRコード表示
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(form.id)}>
                複製
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={form.status !== 'draft' || isDeleting}
                className="text-destructive"
              >
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ChartBarIcon className="h-4 w-4" />
            <span>{form.total_responses}件の回答</span>
          </div>
          <div>
            <span>回答率: {form.response_rate}%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(form.created_at), { addSuffix: true, locale: ja })}に作成
      </CardFooter>
    </Card>
  )
}
