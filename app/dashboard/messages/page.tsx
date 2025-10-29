import { Suspense } from 'react'
import { getMessages } from '@/app/actions/messages'
import { MessageList } from '@/components/messages/MessageList'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function MessageListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
      <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
    </div>
  )
}

async function MessagesContent() {
  try {
    const messages = await getMessages()
    return <MessageList initialMessages={messages} />
  } catch (error) {
    console.error('Failed to load messages:', error)
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-red-500 mb-4">メッセージの読み込みに失敗しました</p>
        <Button onClick={() => window.location.reload()}>再読み込み</Button>
      </div>
    )
  }
}

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">一斉配信メッセージ</h1>
          <p className="text-gray-500 mt-1">友だちに一斉配信するメッセージを管理</p>
        </div>
        <Link href="/dashboard/messages/new">
          <Button size="lg">
            <PlusIcon className="w-5 h-5 mr-2" />
            新規メッセージ作成
          </Button>
        </Link>
      </div>

      {/* Message List */}
      <Suspense fallback={<MessageListSkeleton />}>
        <MessagesContent />
      </Suspense>
    </div>
  )
}
