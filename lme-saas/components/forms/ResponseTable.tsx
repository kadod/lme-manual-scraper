'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FormResponse } from '@/app/actions/forms'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface ResponseTableProps {
  formId: string
  responses: FormResponse[]
  onDelete?: (responseId: string) => void
}

export function ResponseTable({ formId, responses, onDelete }: ResponseTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (responseId: string) => {
    if (deletingId) return

    setDeletingId(responseId)
    try {
      await onDelete?.(responseId)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getAnswerPreview = (answers: Record<string, any>) => {
    const values = Object.values(answers).filter(Boolean)
    if (values.length === 0) return '回答なし'

    const preview = values.slice(0, 2).map(v => {
      if (Array.isArray(v)) return v.join(', ')
      return String(v)
    }).join(' / ')

    return preview.length > 50 ? preview.substring(0, 50) + '...' : preview
  }

  if (responses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">まだ回答がありません</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">回答者</TableHead>
            <TableHead>回答内容</TableHead>
            <TableHead className="w-[180px]">回答日時</TableHead>
            <TableHead className="w-[100px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <TableRow key={response.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={response.friend?.picture_url || undefined} />
                    <AvatarFallback>
                      {response.friend?.display_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {response.friend?.display_name || 'Unknown'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {response.friend?.line_user_id}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-md">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {getAnswerPreview(response.answers)}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDate(response.submitted_at)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/forms/${formId}/responses/${response.id}`}>
                        詳細を表示
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(response.id)}
                      disabled={deletingId === response.id}
                    >
                      {deletingId === response.id ? '削除中...' : '削除'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
