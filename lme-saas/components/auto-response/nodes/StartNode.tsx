'use client'

import { Handle, Position } from 'reactflow'
import { PlayIcon } from '@heroicons/react/24/outline'

export function StartNode() {
  return (
    <div className="bg-green-50 border-2 border-green-500 rounded-lg shadow-md p-4 min-w-[120px]">
      <div className="flex items-center gap-2">
        <PlayIcon className="size-5 text-green-600" />
        <div className="font-semibold text-green-900">開始</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </div>
  )
}
