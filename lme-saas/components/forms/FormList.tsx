'use client'

import { Form } from '@/app/actions/forms'
import { FormCard } from './FormCard'
import { DocumentTextIcon, ChartBarIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'
import { useState } from 'react'

type FormListProps = {
  forms: Form[]
  viewMode: 'grid' | 'list'
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onShowQR: (id: string) => void
}

export function FormList({ forms, viewMode, onDelete, onDuplicate, onShowQR }: FormListProps) {
  if (forms.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">フォームがありません</h3>
        <p className="text-muted-foreground mb-4">最初のフォームを作成しましょう</p>
        <Button asChild>
          <Link href="/dashboard/forms/new">新規作成</Link>
        </Button>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <FormCard
            key={form.id}
            form={form}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onShowQR={onShowQR}
          />
        ))}
      </div>
    )
  }

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

  return (
    <div className="space-y-2">
      {forms.map((form) => (
        <div
          key={form.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-4 flex-1">
            <DocumentTextIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/dashboard/forms/${form.id}`}
                  className="font-medium hover:underline truncate"
                >
                  {form.title}
                </Link>
                {getStatusBadge(form.status)}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {form.description || 'フォームの説明がありません'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ChartBarIcon className="h-4 w-4" />
                <span>{form.total_responses}件</span>
              </div>
              <span>{form.response_rate}%</span>
            </div>
            <div className="text-xs text-muted-foreground min-w-[100px] text-right">
              {formatDistanceToNow(new Date(form.created_at), { addSuffix: true, locale: ja })}
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
                  onClick={() => onDelete(form.id)}
                  disabled={form.status !== 'draft'}
                  className="text-destructive"
                >
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}
