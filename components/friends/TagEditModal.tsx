'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { ActionSelectionModal } from './ActionSelectionModal'

interface Tag {
  id: string
  name: string
  actionSet: boolean
  limitSet: boolean
  createdAt: string
  friendCount: number
  folder: string
}

interface Folder {
  id: string
  name: string
  count: number
}

interface TagAction {
  id: string
  type: 'step' | 'template' | 'text' | 'reminder' | 'tag' | 'rich-menu' | 'bookmark' | 'friend-info' | 'response-status' | 'block'
  name: string
}

interface TagEditModalProps {
  tag: Tag
  folders: Folder[]
  onClose: () => void
  onSave: (tag: Tag) => void
}

export function TagEditModal({ tag, folders, onClose, onSave }: TagEditModalProps) {
  const [name, setName] = useState(tag.name)
  const [selectedFolder, setSelectedFolder] = useState(tag.folder)
  const [actions, setActions] = useState<TagAction[]>([])
  const [showActionSettings, setShowActionSettings] = useState(false)
  const [showActionSelector, setShowActionSelector] = useState(false)
  const [actionFrequency, setActionFrequency] = useState<'always' | 'once'>('once')

  const handleSave = () => {
    onSave({
      ...tag,
      name,
      folder: selectedFolder,
      actionSet: actions.length > 0,
    })
  }

  const addAction = (action: TagAction) => {
    setActions([...actions, action])
    setShowActionSelector(false)
  }

  const removeAction = (actionId: string) => {
    setActions(actions.filter(a => a.id !== actionId))
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
            <div>
              <h2 className="text-xl font-bold">タグ編集</h2>
              <p className="text-sm text-gray-500">タグ一覧 &gt; タグ編集</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  管理名
                  <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded">5/50</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="タグの管理名を入力"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">フォルダ</label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Settings */}
            <Card>
              <div className="divide-y">
                {/* Action Settings */}
                <div className="p-4">
                  <button
                    onClick={() => setShowActionSettings(!showActionSettings)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="text-lg font-bold flex items-center gap-2">
                      アクション設定
                      <ChevronRightIcon className={`h-5 w-5 transition-transform ${showActionSettings ? 'rotate-90' : ''}`} />
                    </span>
                  </button>

                  {showActionSettings && (
                    <div className="mt-4 space-y-4">
                      {/* Action Frequency */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-3">タグ追加時アクション設定</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          自動返答や回答フォームなどでタグが追加された時に行うアクションを設定します。
                        </p>

                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">アクションの稼働回数</p>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="frequency"
                                value="always"
                                checked={actionFrequency === 'always'}
                                onChange={() => setActionFrequency('always')}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">何度でもアクション稼働</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="frequency"
                                value="once"
                                checked={actionFrequency === 'once'}
                                onChange={() => setActionFrequency('once')}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-blue-600">1度のみアクション稼働</span>
                            </label>
                          </div>
                        </div>

                        {/* Action Type Icons */}
                        <div className="flex items-center gap-4 mb-4">
                          <button className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded">
                            <div className="w-12 h-12 bg-white border rounded flex items-center justify-center">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <span className="text-xs">テンプレート</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded">
                            <div className="w-12 h-12 bg-white border rounded flex items-center justify-center">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </div>
                            <span className="text-xs">タグ</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded">
                            <div className="w-12 h-12 bg-white border rounded flex items-center justify-center">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <span className="text-xs">友だち情報</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded">
                            <div className="w-12 h-12 bg-white border rounded flex items-center justify-center">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                              </svg>
                            </div>
                            <span className="text-xs">友だち情報</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded">
                            <div className="w-12 h-12 bg-white border rounded flex items-center justify-center">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <span className="text-xs">その他</span>
                          </button>
                        </div>

                        {/* Add Action Button */}
                        <Button
                          onClick={() => setShowActionSelector(true)}
                          className="w-full bg-blue-500 hover:bg-blue-600"
                        >
                          アクション追加・編集
                        </Button>

                        {/* Actions List */}
                        {actions.length > 0 ? (
                          <div className="mt-4 space-y-2">
                            {actions.map((action) => (
                              <div
                                key={action.id}
                                className="flex items-center justify-between p-3 bg-white border rounded"
                              >
                                <span className="text-sm">{action.name}</span>
                                <button
                                  onClick={() => removeAction(action.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  削除
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-sm text-gray-500 mt-4">
                            エルメアクションは登録されていません
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Limit Settings */}
                <div className="p-4">
                  <button className="w-full flex items-center justify-between text-left">
                    <span className="text-lg font-bold flex items-center gap-2">
                      人数制限
                      <ChevronRightIcon className="h-5 w-5" />
                    </span>
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-3 p-4 border-t sticky bottom-0 bg-white">
            <Button variant="outline" onClick={onClose} className="w-32">
              戻る
            </Button>
            <Button onClick={handleSave} className="w-32 bg-blue-500 hover:bg-blue-600">
              保存
            </Button>
          </div>
        </div>
      </div>

      {/* Action Selection Modal */}
      {showActionSelector && (
        <ActionSelectionModal
          onClose={() => setShowActionSelector(false)}
          onSelect={addAction}
        />
      )}
    </>
  )
}
