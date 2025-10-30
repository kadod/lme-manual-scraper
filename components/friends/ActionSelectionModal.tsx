'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { XMarkIcon, PlusCircleIcon } from '@heroicons/react/24/outline'

interface TagAction {
  id: string
  type: 'step' | 'template' | 'text' | 'reminder' | 'tag' | 'rich-menu' | 'bookmark' | 'friend-info' | 'response-status' | 'block'
  name: string
}

interface ActionSelectionModalProps {
  onClose: () => void
  onSelect: (action: TagAction) => void
}

const actionTypes = [
  { id: 'step', name: 'ステップ', icon: '📊' },
  { id: 'template', name: 'テンプレート', icon: '📄' },
  { id: 'text', name: 'テキスト', icon: '💬', highlighted: true },
  { id: 'reminder', name: 'リマインド', icon: '⏰' },
  { id: 'tag', name: 'タグ', icon: '🏷️' },
  { id: 'rich-menu', name: 'リッチメニュー', icon: '📱' },
  { id: 'bookmark', name: 'ブックマーク', icon: '🔖' },
  { id: 'friend-info', name: '友だち情報', icon: '👤' },
  { id: 'response-status', name: '対応ステータス', icon: '📋' },
  { id: 'block', name: 'ブロック', icon: '🚫' },
]

export function ActionSelectionModal({ onClose, onSelect }: ActionSelectionModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const handleSelect = (type: typeof actionTypes[0]) => {
    const action: TagAction = {
      id: Date.now().toString(),
      type: type.id as TagAction['type'],
      name: type.name,
    }
    onSelect(action)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">アクション</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-2">
            {actionTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelect(type)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  type.highlighted
                    ? 'bg-green-50 border-green-300 hover:bg-green-100'
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
              >
                <PlusCircleIcon className={`h-5 w-5 ${type.highlighted ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${type.highlighted ? 'text-green-900' : 'text-gray-700'}`}>
                  {type.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center p-4 border-t">
          <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
            保存
          </Button>
        </div>
      </div>
    </div>
  )
}
