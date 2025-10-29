'use client'

import { Handle, Position } from 'reactflow'
import { StopIcon } from '@heroicons/react/24/outline'

export function EndNode() {
  return (
    <div className="bg-red-50 border-2 border-red-500 rounded-lg shadow-md p-4 min-w-[120px]">
      <Handle type="target" position={Position.Top} className="!bg-red-500" />
      <div className="flex items-center gap-2">
        <StopIcon className="size-5 text-red-600" />
        <div className="font-semibold text-red-900">終了</div>
      </div>
    </div>
  )
}
