'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  EllipsisVerticalIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import {
  deleteRichMenu,
  duplicateRichMenu,
  publishRichMenu,
  unpublishRichMenu,
  setDefaultRichMenu,
} from '@/app/actions/rich-menus'
import { DeployDialog } from './DeployDialog'

type RichMenuCardProps = {
  richMenu: {
    id: string
    rich_menu_id: string
    name: string
    chat_bar_text: string
    status?: 'draft' | 'published' | 'unpublished'
    is_default: boolean
    thumbnail_url?: string | null
    created_at: string
    size: {
      width: number
      height: number
    }
    areas: Array<{
      bounds: { x: number; y: number; width: number; height: number }
      action: { type: string; uri?: string; text?: string; data?: string }
    }>
  }
}

export function RichMenuCard({ richMenu }: RichMenuCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isUnpublishing, setIsUnpublishing] = useState(false)
  const [isSettingDefault, setIsSettingDefault] = useState(false)
  const [showDeployDialog, setShowDeployDialog] = useState(false)

  const status = richMenu.status || 'draft'

  const getStatusBadge = () => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Published</Badge>
      case 'unpublished':
        return <Badge variant="outline">Unpublished</Badge>
      case 'draft':
      default:
        return <Badge variant="secondary">Draft</Badge>
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this rich menu?')) return

    setIsDeleting(true)
    try {
      const result = await deleteRichMenu(richMenu.rich_menu_id)
      if (!result.success) {
        alert(result.error || 'Failed to delete')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      const result = await duplicateRichMenu(richMenu.rich_menu_id)
      if (!result.success) {
        alert(result.error || 'Failed to duplicate')
      }
    } catch (error) {
      console.error('Duplicate error:', error)
      alert('Failed to duplicate')
    } finally {
      setIsDuplicating(false)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const result = await publishRichMenu(richMenu.rich_menu_id)
      if (!result.success) {
        alert(result.error || 'Failed to publish')
      }
    } catch (error) {
      console.error('Publish error:', error)
      alert('Failed to publish')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (richMenu.is_default) {
      alert('Cannot unpublish default menu')
      return
    }

    setIsUnpublishing(true)
    try {
      const result = await unpublishRichMenu(richMenu.rich_menu_id)
      if (!result.success) {
        alert(result.error || 'Failed to unpublish')
      }
    } catch (error) {
      console.error('Unpublish error:', error)
      alert('Failed to unpublish')
    } finally {
      setIsUnpublishing(false)
    }
  }

  const handleSetDefault = async () => {
    if (status !== 'published') {
      alert('Only published menus can be set as default')
      return
    }

    setIsSettingDefault(true)
    try {
      const result = await setDefaultRichMenu(richMenu.rich_menu_id)
      if (!result.success) {
        alert(result.error || 'Failed to set as default')
      }
    } catch (error) {
      console.error('Set default error:', error)
      alert('Failed to set as default')
    } finally {
      setIsSettingDefault(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-semibold">{richMenu.name}</span>
                {richMenu.is_default && (
                  <StarIconSolid className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                {richMenu.is_default && <Badge variant="outline">Default</Badge>}
              </div>
            </div>
          </CardTitle>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/rich-menus/${richMenu.rich_menu_id}`}>
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  {isDuplicating ? 'Duplicating...' : 'Duplicate'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {status === 'draft' || status === 'unpublished' ? (
                  <DropdownMenuItem onClick={handlePublish} disabled={isPublishing}>
                    <EyeIcon className="w-4 h-4 mr-2" />
                    {isPublishing ? 'Publishing...' : 'Publish'}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleUnpublish} disabled={isUnpublishing || richMenu.is_default}>
                    <EyeSlashIcon className="w-4 h-4 mr-2" />
                    {isUnpublishing ? 'Unpublishing...' : 'Unpublish'}
                  </DropdownMenuItem>
                )}
                {!richMenu.is_default && status === 'published' && (
                  <DropdownMenuItem onClick={handleSetDefault} disabled={isSettingDefault}>
                    <StarIcon className="w-4 h-4 mr-2" />
                    {isSettingDefault ? 'Setting Default...' : 'Set as Default'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowDeployDialog(true)} disabled={status !== 'published'}>
                  Deploy to Friends
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} disabled={isDeleting || status !== 'draft'} className="text-red-600">
                  <TrashIcon className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="aspect-[2/1] bg-gray-100 rounded-lg overflow-hidden">
              {richMenu.thumbnail_url ? (
                <img src={richMenu.thumbnail_url} alt={richMenu.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-sm">No thumbnail</div>
                    <div className="text-xs mt-1">{richMenu.size.width} x {richMenu.size.height}</div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Chat Bar Text</div>
              <div className="text-sm">{richMenu.chat_bar_text}</div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Action areas: {richMenu.areas.length}</span>
              <span>Created: {new Date(richMenu.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeployDialog open={showDeployDialog} onOpenChange={setShowDeployDialog} richMenuId={richMenu.rich_menu_id} richMenuName={richMenu.name} />
    </>
  )
}
