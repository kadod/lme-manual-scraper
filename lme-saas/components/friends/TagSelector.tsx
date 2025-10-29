'use client'

import { useState } from 'react'
import { TagIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { addTagToFriend, removeTagFromFriend } from '@/app/actions/friends'
import { useRouter } from 'next/navigation'

interface Tag {
  id: string
  name: string
  color: string | null
}

interface TagSelectorProps {
  friend: {
    id: string
    tags: Tag[]
  }
  availableTags: Tag[]
}

export function TagSelector({ friend, availableTags }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const currentTagIds = new Set(friend.tags.map((t) => t.id))
  const availableTagsToAdd = availableTags.filter((t) => !currentTagIds.has(t.id))

  const handleAddTag = async (tagId: string) => {
    setIsLoading(true)
    try {
      await addTagToFriend(friend.id, tagId)
      router.refresh()
    } catch (error) {
      console.error('Failed to add tag:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveTag = async (tagId: string) => {
    setIsLoading(true)
    try {
      await removeTagFromFriend(friend.id, tagId)
      router.refresh()
    } catch (error) {
      console.error('Failed to remove tag:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTagColor = (color: string | null) => {
    return color || '#6B7280'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TagIcon className="h-5 w-5" />
          タグ
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              追加
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>タグを追加</DialogTitle>
              <DialogDescription>
                友だちに関連するタグを追加できます
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {availableTagsToAdd.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  追加可能なタグがありません
                </p>
              ) : (
                availableTagsToAdd.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getTagColor(tag.color) }}
                      />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                    <PlusIcon className="h-4 w-4" />
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {friend.tags.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            タグはまだ設定されていません
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {friend.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="px-3 py-1 flex items-center gap-2"
                style={{
                  backgroundColor: getTagColor(tag.color) + '20',
                  borderColor: getTagColor(tag.color),
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getTagColor(tag.color) }}
                />
                <span>{tag.name}</span>
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  disabled={isLoading}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
