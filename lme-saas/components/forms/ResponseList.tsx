'use client'

import { useState } from 'react'
import { FormResponse } from '@/app/actions/forms'
import { ResponseTable } from './ResponseTable'
import { ResponseFilters } from './ResponseFilters'
import { ExportButton } from './ExportButton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ResponseListProps {
  formId: string
  responses: FormResponse[]
  onFilterChange: (filters: any) => void
  onDelete: (responseId: string) => Promise<void>
}

export function ResponseList({
  formId,
  responses,
  onFilterChange,
  onDelete,
}: ResponseListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null)

  const handleDeleteClick = (responseId: string) => {
    setResponseToDelete(responseId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (responseToDelete) {
      await onDelete(responseToDelete)
      setDeleteDialogOpen(false)
      setResponseToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <ResponseFilters onFilterChange={onFilterChange} />
        <ExportButton formId={formId} />
      </div>

      <ResponseTable
        formId={formId}
        responses={responses}
        onDelete={handleDeleteClick}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>回答を削除しますか?</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。回答データを完全に削除します。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
