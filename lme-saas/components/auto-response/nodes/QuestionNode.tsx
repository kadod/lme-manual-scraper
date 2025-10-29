'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { QuestionNodeData } from '@/types/scenario'

function QuestionNodeComponent({ data, selected }: NodeProps<QuestionNodeData>) {
  const answerTypeLabel = {
    free_text: '自由入力',
    single_choice: '単一選択',
    multiple_choice: '複数選択',
  }

  return (
    <div
      className={`bg-white border-2 ${
        selected ? 'border-purple-500' : 'border-gray-300'
      } rounded-lg shadow-md p-4 min-w-[200px] max-w-[300px]`}
    >
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      <div className="flex items-start gap-2 mb-2">
        <QuestionMarkCircleIcon className="size-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="font-semibold text-gray-900">質問</div>
      </div>
      <div className="text-sm text-gray-700 line-clamp-2 mb-2">
        {data.questionText || '質問を入力してください'}
      </div>
      <div className="text-xs text-gray-600 mb-1">
        回答タイプ: {answerTypeLabel[data.answerType]}
      </div>
      {data.choices && data.choices.length > 0 && (
        <div className="text-xs text-gray-500 mb-1">
          選択肢: {data.choices.length}個
        </div>
      )}
      <div className="text-xs text-gray-500">
        タイムアウト: {data.timeoutMinutes}分
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
    </div>
  )
}

export const QuestionNode = memo(QuestionNodeComponent)
