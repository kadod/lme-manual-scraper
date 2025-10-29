'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@heroicons/react/24/outline'
import { ReservationTypeList } from '@/components/reservations/ReservationTypeList'
import { ReservationTypeForm } from '@/components/reservations/ReservationTypeForm'
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
import {
  getReservationTypes,
  createReservationType,
  updateReservationType,
  deleteReservationType,
  duplicateReservationType,
  toggleReservationTypeStatus,
  ReservationType,
} from '@/app/actions/reservation-types'
import { toast } from 'sonner'

export default function ReservationTypesPage() {
  const [types, setTypes] = useState<ReservationType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<ReservationType | null>(null)
  const [typeToDelete, setTypeToDelete] = useState<ReservationType | null>(null)

  useEffect(() => {
    loadTypes()
  }, [])

  const loadTypes = async () => {
    try {
      setIsLoading(true)
      const data = await getReservationTypes()
      setTypes(data)
    } catch (error) {
      console.error('Error loading types:', error)
      toast.error('予約タイプの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedType(null)
    setIsFormOpen(true)
  }

  const handleEdit = (type: ReservationType) => {
    setSelectedType(type)
    setIsFormOpen(true)
  }

  const handleDelete = (type: ReservationType) => {
    setTypeToDelete(type)
  }

  const confirmDelete = async () => {
    if (!typeToDelete) return

    try {
      await deleteReservationType(typeToDelete.id)
      toast.success('予約タイプを削除しました')
      loadTypes()
    } catch (error: any) {
      console.error('Error deleting type:', error)
      toast.error(error.message || '予約タイプの削除に失敗しました')
    } finally {
      setTypeToDelete(null)
    }
  }

  const handleDuplicate = async (type: ReservationType) => {
    try {
      await duplicateReservationType(type.id)
      toast.success('予約タイプを複製しました')
      loadTypes()
    } catch (error) {
      console.error('Error duplicating type:', error)
      toast.error('予約タイプの複製に失敗しました')
    }
  }

  const handleToggleStatus = async (type: ReservationType) => {
    try {
      await toggleReservationTypeStatus(type.id)
      toast.success(
        type.status === 'active' ? '予約タイプを無効化しました' : '予約タイプを有効化しました'
      )
      loadTypes()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('ステータスの変更に失敗しました')
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      if (selectedType) {
        await updateReservationType(selectedType.id, formData)
        toast.success('予約タイプを更新しました')
      } else {
        await createReservationType(formData)
        toast.success('予約タイプを作成しました')
      }
      setIsFormOpen(false)
      loadTypes()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('予約タイプの保存に失敗しました')
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">予約タイプ管理</h1>
          <p className="text-muted-foreground mt-2">
            予約タイプを作成・管理します
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusIcon className="size-4" />
          新規作成
        </Button>
      </div>

      <ReservationTypeList
        types={types}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onToggleStatus={handleToggleStatus}
      />

      <ReservationTypeForm
        type={selectedType}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedType(null)
        }}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={!!typeToDelete}
        onOpenChange={(open) => !open && setTypeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>予約タイプを削除</AlertDialogTitle>
            <AlertDialogDescription>
              「{typeToDelete?.name}」を削除してもよろしいですか？この操作は取り消せません。
              {typeToDelete && (
                <div className="mt-2 text-sm text-muted-foreground">
                  アクティブな予約が存在する場合は削除できません。
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
