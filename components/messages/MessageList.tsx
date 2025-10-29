'use client'

import { useState, useTransition } from 'react'
import { Message, MessageFilters as Filters, duplicateMessage, cancelMessage } from '@/app/actions/messages'
import { MessageFilters } from './MessageFilters'
import { MessageTable } from './MessageTable'
import { MessagePreviewDialog } from './MessagePreviewDialog'
import { DeleteMessageDialog } from './DeleteMessageDialog'
import { useRouter } from 'next/navigation'

interface MessageListProps {
  initialMessages: Message[]
}

export function MessageList({ initialMessages }: MessageListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [filters, setFilters] = useState<Filters>({})
  const [previewMessage, setPreviewMessage] = useState<Message | null>(null)
  const [deleteMessage, setDeleteMessage] = useState<Message | null>(null)

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters)
    // In a real app, this would trigger a server-side filter
    // For now, we'll filter client-side
    filterMessages(newFilters)
  }

  const filterMessages = (filters: Filters) => {
    let filtered = initialMessages

    if (filters.status) {
      filtered = filtered.filter((m) => m.status === filters.status)
    }

    if (filters.type) {
      filtered = filtered.filter((m) => m.type === filters.type)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter((m) => m.title.toLowerCase().includes(searchLower))
    }

    setMessages(filtered)
  }

  const handleDuplicate = async (messageId: string) => {
    startTransition(async () => {
      try {
        await duplicateMessage(messageId)
        router.refresh()
      } catch (error) {
        console.error('Failed to duplicate message:', error)
        alert('メッセージの複製に失敗しました')
      }
    })
  }

  const handleCancel = async (messageId: string) => {
    if (!confirm('配信をキャンセルしてもよろしいですか？')) return

    startTransition(async () => {
      try {
        await cancelMessage(messageId)
        router.refresh()
      } catch (error) {
        console.error('Failed to cancel message:', error)
        alert('配信のキャンセルに失敗しました')
      }
    })
  }

  const handleDeleteSuccess = () => {
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <MessageFilters filters={filters} onFilterChange={handleFilterChange} />

      {isPending ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      ) : (
        <MessageTable
          messages={messages}
          onPreview={setPreviewMessage}
          onDelete={setDeleteMessage}
          onDuplicate={handleDuplicate}
          onCancel={handleCancel}
        />
      )}

      <MessagePreviewDialog
        message={previewMessage}
        open={!!previewMessage}
        onOpenChange={(open) => !open && setPreviewMessage(null)}
      />

      {deleteMessage && (
        <DeleteMessageDialog
          messageId={deleteMessage.id}
          messageTitle={deleteMessage.title}
          open={!!deleteMessage}
          onOpenChange={(open) => !open && setDeleteMessage(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  )
}
