import { ChatLayout } from '@/components/chat/ChatLayout'
import { ChatArea } from '@/components/chat/ChatArea'
import { FriendDetailSidebar } from '@/components/chat/FriendDetailSidebar'
import { getConversations, getMessages } from '@/app/actions/chat'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrganizationId } from '@/lib/utils/organization'

interface ChatDetailPageProps {
  params: Promise<{
    friendId: string
  }>
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { friendId } = await params
  const conversationId = friendId // URL still uses friendId for backward compatibility

  try {
    const [conversations, messages] = await Promise.all([
      getConversations(),
      getMessages(conversationId),
    ])

    // Get friend details via conversation
    const supabase = await createClient()
    const organizationId = await getCurrentUserOrganizationId()

    if (!organizationId) {
      console.error('Organization not found')
      notFound()
    }

    const { data: conversation, error } = await supabase
      .from('conversations')
      .select(`
        id,
        line_friends (
          id,
          display_name,
          picture_url,
          follow_status,
          line_user_id,
          status_message,
          tags,
          notes,
          custom_fields,
          first_followed_at,
          last_followed_at,
          last_interaction_at,
          created_at,
          updated_at
        )
      `)
      .eq('id', conversationId)
      .eq('organization_id', organizationId)
      .single()

    if (error || !conversation) {
      console.error('Error loading conversation:', error)
      notFound()
    }

    const friend = conversation.line_friends as any

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
              friendId={conversationId}
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
