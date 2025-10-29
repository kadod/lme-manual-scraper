'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline'
import { MessageNodeData } from '@/types/scenario'

function MessageNodeComponent({ data, selected }: NodeProps<MessageNodeData>) {
  return (
    <div
      className={`bg-white border-2 ${
        selected ? 'border-blue-500' : 'border-gray-300'
      } rounded-lg shadow-md p-4 min-w-[200px] max-w-[300px]`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <div className="flex items-start gap-2 mb-2">
        <ChatBubbleBottomCenterTextIcon className="size-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="font-semibold text-gray-900">メッセージ</div>
      </div>
      <div className="text-sm text-gray-700 line-clamp-3 mb-2">
        {data.text || 'メッセージを入力してください'}
      </div>
      {data.delay > 0 && (
        <div className="text-xs text-gray-500">遅延: {data.delay}秒</div>
      )}
      {data.richMessageId && (
        <div className="text-xs text-blue-600 mt-1">リッチメッセージ使用</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  )
}

export const MessageNode = memo(MessageNodeComponent)
