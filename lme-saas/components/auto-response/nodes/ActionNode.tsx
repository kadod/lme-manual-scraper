'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { BoltIcon } from '@heroicons/react/24/outline'
import { ActionNodeData } from '@/types/scenario'

function ActionNodeComponent({ data, selected }: NodeProps<ActionNodeData>) {
  const actionTypeLabel = {
    add_tag: 'タグ追加',
    remove_tag: 'タグ削除',
    add_segment: 'セグメント追加',
    remove_segment: 'セグメント削除',
    update_field: 'フィールド更新',
    start_step: 'ステップ配信開始',
  }

  return (
    <div
      className={`bg-white border-2 ${
        selected ? 'border-indigo-500' : 'border-gray-300'
      } rounded-lg shadow-md p-4 min-w-[200px] max-w-[300px]`}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-500" />
      <div className="flex items-start gap-2 mb-2">
        <BoltIcon className="size-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="font-semibold text-gray-900">アクション</div>
      </div>
      <div className="text-sm text-gray-700">
        {data.actions.length > 0 ? (
          <div className="space-y-1">
            {data.actions.slice(0, 3).map((action) => (
              <div key={action.id} className="text-xs text-gray-600">
                {actionTypeLabel[action.actionType]}
              </div>
            ))}
            {data.actions.length > 3 && (
              <div className="text-xs text-gray-500">
                他 {data.actions.length - 3} 件
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400">アクションを設定してください</span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500" />
    </div>
  )
}

export const ActionNode = memo(ActionNodeComponent)
