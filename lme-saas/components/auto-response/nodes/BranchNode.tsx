'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { BranchNodeData } from '@/types/scenario'

function BranchNodeComponent({ data, selected }: NodeProps<BranchNodeData>) {
  const conditionTypeLabel = {
    keyword: 'キーワード',
    numeric_range: '数値範囲',
    custom_field: 'カスタムフィールド',
  }

  return (
    <div
      className={`bg-white border-2 ${
        selected ? 'border-orange-500' : 'border-gray-300'
      } rounded-lg shadow-md p-4 min-w-[200px] max-w-[300px]`}
    >
      <Handle type="target" position={Position.Top} className="!bg-orange-500" />
      <div className="flex items-start gap-2 mb-2">
        <ArrowPathIcon className="size-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="font-semibold text-gray-900">分岐</div>
      </div>
      <div className="text-sm text-gray-700 mb-2">
        {data.conditions.length > 0 ? (
          <div className="space-y-1">
            {data.conditions.slice(0, 2).map((condition) => (
              <div key={condition.id} className="text-xs text-gray-600">
                {conditionTypeLabel[condition.type]}
                {condition.keywords && `: ${condition.keywords.join(', ')}`}
              </div>
            ))}
            {data.conditions.length > 2 && (
              <div className="text-xs text-gray-500">
                他 {data.conditions.length - 2} 件
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400">条件を設定してください</span>
        )}
      </div>
      {data.defaultBranch && (
        <div className="text-xs text-orange-600">デフォルト分岐あり</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
    </div>
  )
}

export const BranchNode = memo(BranchNodeComponent)
