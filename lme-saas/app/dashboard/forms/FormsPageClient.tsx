'use client'

import { useState, useTransition } from 'react'
import { Form, deleteForm, duplicateForm } from '@/app/actions/forms'
import { FormList } from '@/components/forms/FormList'
import { FormFilters } from '@/components/forms/FormFilters'
import { QRCodeDialog } from '@/components/forms/QRCodeDialog'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type FormsPageClientProps = {
  initialForms: Form[]
  initialStatus: string
  initialSearch: string
}

export function FormsPageClient({ initialForms, initialStatus, initialSearch }: FormsPageClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [selectedFormForQR, setSelectedFormForQR] = useState<{ id: string; title: string } | null>(null)

  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    startTransition(() => {
      const params = new URLSearchParams()
      if (status !== 'all') params.set('status', status)
      if (searchQuery) params.set('search', searchQuery)
      router.push(`/dashboard/forms?${params.toString()}`)
    })
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    startTransition(() => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (query) params.set('search', query)
      router.push(`/dashboard/forms?${params.toString()}`)
    })
  }

  const handleDelete = async (formId: string) => {
    try {
      await deleteForm(formId)
      toast.success('フォームを削除しました')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'フォームの削除に失敗しました')
    }
  }

  const handleDuplicate = async (formId: string) => {
    try {
      const duplicated = await duplicateForm(formId)
      toast.success('フォームを複製しました')
      router.push(`/dashboard/forms/${duplicated.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'フォームの複製に失敗しました')
    }
  }

  const handleShowQR = (formId: string) => {
    const form = initialForms.find((f) => f.id === formId)
    if (form) {
      setSelectedFormForQR({ id: form.id, title: form.title })
      setQrDialogOpen(true)
    }
  }

  return (
    <>
      <FormFilters
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        viewMode={viewMode}
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
        onViewModeChange={setViewMode}
      />

      <FormList
        forms={initialForms}
        viewMode={viewMode}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onShowQR={handleShowQR}
      />

      {selectedFormForQR && (
        <QRCodeDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          formId={selectedFormForQR.id}
          formTitle={selectedFormForQR.title}
        />
      )}
    </>
  )
}
