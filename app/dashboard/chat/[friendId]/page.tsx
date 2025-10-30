import { ChatLayout } from '@/components/chat/ChatLayout'
import { ChatArea } from '@/components/chat/ChatArea'
import { FriendDetailSidebar } from '@/components/chat/FriendDetailSidebar'
import { getConversations, getMessages, getFriendDetails } from '@/app/actions/chat'
import { notFound } from 'next/navigation'

interface ChatDetailPageProps {
  params: Promise<{
    friendId: string
  }>
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { friendId } = await params

  try {
    const [conversations, messages, friend] = await Promise.all([
      getConversations(),
      getMessages(friendId),
      getFriendDetails(friendId),
    ])

    // Transform friend data to ensure custom_fields is properly typed
    const friendData = {
      ...friend,
      custom_fields: friend.custom_fields as Record<string, any> | null,
    }

    return (
      <div className="flex-1">
        <ChatLayout conversations={conversations}>
          <div className="flex-1">
            <ChatArea
              friendId={friendId}
              friendName={friend.display_name || '名前なし'}
              friendAvatar={friend.picture_url}
              initialMessages={messages}
            />
          </div>
          <FriendDetailSidebar friend={friendData} />
        </ChatLayout>
      </div>
    )
  } catch (error) {
    console.error('Error loading chat:', error)
    notFound()
  }
}
