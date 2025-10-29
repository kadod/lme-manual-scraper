'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TagDialog } from './TagDialog'
import { DeleteTagDialog } from './DeleteTagDialog'
import {
  TagIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'

interface Tag {
  id: string
  name: string
  color: string
  description?: string | null
  friend_count?: number
  created_at: string
}

interface TagListProps {
  initialTags: Tag[]
}

export function TagList({ initialTags }: TagListProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined)
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('tags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tags',
        },
        () => {
          window.location.reload()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleCreate = () => {
    setSelectedTag(undefined)
    setIsDialogOpen(true)
  }

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (tag: Tag) => {
    setTagToDelete(tag)
    setIsDeleteDialogOpen(true)
  }

  const handleSuccess = () => {
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">タグ管理</h2>
          <p className="text-gray-600 mt-1">友だちを分類するためのタグを管理します</p>
        </div>
        <Button onClick={handleCreate}>
          <PlusIcon className="h-5 w-5 mr-2" />
          新規作成
        </Button>
      </div>

      {tags.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">タグがありません</h3>
            <p className="text-gray-600 mb-4">
              まずは最初のタグを作成しましょう
            </p>
            <Button onClick={handleCreate}>
              <PlusIcon className="h-5 w-5 mr-2" />
              タグを作成
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <Card key={tag.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: tag.color }}
                  >
                    <TagIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>{tag.friend_count || 0} 人</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(tag)}
                    aria-label="編集"
                  >
                    <PencilIcon className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteClick(tag)}
                    aria-label="削除"
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>

              {tag.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {tag.description}
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.color}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TagDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        tag={selectedTag}
        onSuccess={handleSuccess}
      />

      <DeleteTagDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        tag={tagToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
