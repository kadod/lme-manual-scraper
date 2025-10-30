import { ChatLayout } from '@/components/chat/ChatLayout'
import { getConversations } from '@/app/actions/chat'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

export default async function ChatPage() {
  const conversations = await getConversations()

  return (
    <div className="flex-1">
      <ChatLayout conversations={conversations}>
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
          <ChatBubbleLeftRightIcon className="h-20 w-20 mb-4" />
          <h2 className="text-xl font-semibold mb-2">1:1チャット</h2>
          <p className="text-sm">左側から会話を選択してください</p>
        </div>
      </ChatLayout>
    </div>
  )
}
