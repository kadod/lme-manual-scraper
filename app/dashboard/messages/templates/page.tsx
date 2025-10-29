'use client'

import { useState, useEffect } from 'react'
import { TemplateList } from '@/components/messages/TemplateList'
import { TemplateDialog, TemplateFormData } from '@/components/messages/TemplateDialog'
import { TemplatePreviewDialog } from '@/components/messages/TemplatePreviewDialog'
import {
  getTemplates,
  getCategories,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateById,
} from '@/app/actions/templates'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
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

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [editFormData, setEditFormData] = useState<TemplateFormData | null>(null)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [templatesResult, categoriesResult] = await Promise.all([
        getTemplates(),
        getCategories(),
      ])

      if (templatesResult.success) {
        setTemplates(templatesResult.data)
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setDialogMode('create')
    setEditFormData(null)
    setDialogOpen(true)
  }

  const handleEdit = async (templateId: string) => {
    const result = await getTemplateById(templateId)
    if (result.success) {
      const template = result.data
      setEditFormData({
        id: template.id,
        name: template.name,
        category: template.category || 'その他',
        description: template.description || '',
        type: template.type,
        content: template.content,
        variables: template.variables || [],
      })
      setDialogMode('edit')
      setDialogOpen(true)
    }
  }

  const handlePreview = async (templateId: string) => {
    const result = await getTemplateById(templateId)
    if (result.success) {
      setSelectedTemplate(result.data)
      setPreviewDialogOpen(true)
    }
  }

  const handleDeleteClick = (templateId: string) => {
    setTemplateToDelete(templateId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (templateToDelete) {
      const result = await deleteTemplate(templateToDelete)
      if (result.success) {
        await loadData()
        setDeleteDialogOpen(false)
        setTemplateToDelete(null)
      }
    }
  }

  const handleSave = async (formData: TemplateFormData) => {
    try {
      if (dialogMode === 'create') {
        const result = await createTemplate({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          type: formData.type,
          content: formData.content,
          variables: formData.variables,
        })

        if (result.success) {
          await loadData()
          setDialogOpen(false)
        }
      } else if (dialogMode === 'edit' && formData.id) {
        const result = await updateTemplate(formData.id, {
          name: formData.name,
          category: formData.category,
          description: formData.description,
          type: formData.type,
          content: formData.content,
          variables: formData.variables,
        })

        if (result.success) {
          await loadData()
          setDialogOpen(false)
        }
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">メッセージテンプレート</h1>
        </div>
        <p className="text-muted-foreground">
          よく使うメッセージをテンプレートとして保存し、効率的に配信できます
        </p>
      </div>

      <TemplateList
        templates={templates}
        categories={categories}
        onPreview={handlePreview}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onCreate={handleCreate}
      />

      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        initialData={editFormData}
        mode={dialogMode}
      />

      <TemplatePreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        template={selectedTemplate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>テンプレートを削除しますか?</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。テンプレートを完全に削除します。
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
