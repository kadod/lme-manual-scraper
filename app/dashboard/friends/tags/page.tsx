'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  FolderIcon,
} from '@heroicons/react/24/outline'
import { TagEditModal } from '@/components/friends/TagEditModal'

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

export default function TagsPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [showFolders, setShowFolders] = useState(true)

  const folders: Folder[] = [
    { id: 'uncategorized', name: '未分類', count: 2 },
    { id: 'daily-acquisition', name: '==日計取得タグ==', count: 0 },
    { id: 'inflow', name: '流入経路', count: 6 },
    { id: 'diagnosis', name: '診断計測', count: 5 },
    { id: 'reminder', name: 'リマインド配信', count: 7 },
    { id: 'consultation', name: '無料相談予約管理', count: 2 },
    { id: 'separator', name: '===========', count: 0 },
    { id: 'initial-survey', name: '初期アンケート', count: 26 },
  ]

  const tags: Tag[] = [
    {
      id: '1',
      name: '診断未回答',
      actionSet: false,
      limitSet: false,
      createdAt: '2025/10/20',
      friendCount: 5,
      folder: 'uncategorized',
    },
    {
      id: '2',
      name: '診断開始',
      actionSet: false,
      limitSet: false,
      createdAt: '2025/07/30',
      friendCount: 23,
      folder: 'diagnosis',
    },
    {
      id: '3',
      name: '診断終了',
      actionSet: false,
      limitSet: false,
      createdAt: '2025/07/30',
      friendCount: 23,
      folder: 'diagnosis',
    },
    {
      id: '4',
      name: '給付対象',
      actionSet: false,
      limitSet: false,
      createdAt: '2025/10/20',
      friendCount: 17,
      folder: 'diagnosis',
    },
    {
      id: '5',
      name: '給付対象外',
      actionSet: false,
      limitSet: false,
      createdAt: '2025/10/20',
      friendCount: 5,
      folder: 'diagnosis',
    },
  ]

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    )
  }

  const toggleAllTags = () => {
    if (selectedTags.length === tags.length) {
      setSelectedTags([])
    } else {
      setSelectedTags(tags.map((t) => t.id))
    }
  }

  return (
    <>
      <div className="flex h-screen">
        {/* Left Sidebar - Folders */}
        {showFolders && (
          <aside className="w-64 bg-white border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg mb-3">タグ管理</h2>
              <Button variant="outline" className="w-full mb-2">
                <PlusIcon className="h-4 w-4 mr-2" />
                フォルダ追加
              </Button>
              <Button variant="outline" className="w-full">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                並べ替え
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer mb-1 ${
                    selectedFolder === folder.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                  } ${folder.name.startsWith('==') ? 'pointer-events-none' : ''}`}
                  onClick={() => !folder.name.startsWith('==') && setSelectedFolder(folder.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`${folder.name.startsWith('==') ? 'text-gray-400 text-xs' : 'font-medium'}`}>
                      {folder.name}
                    </span>
                    {!folder.name.startsWith('==') && (
                      <span className="text-sm text-gray-500">({folder.count})</span>
                    )}
                  </div>
                  {folder.id !== 'uncategorized' && !folder.name.startsWith('==') && (
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <EllipsisHorizontalIcon className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => setShowFolders(false)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <FolderIcon className="h-4 w-4" />
                <span>フォルダを非表示</span>
              </button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold mb-2">タグ管理</h1>
              <p className="text-sm text-gray-600">
                様々なトリガーによって友だちにタグ付けを行い、タグごとに絞り込むことでセグメント配信などが可能となる機能です。
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!showFolders && (
                  <Button variant="outline" onClick={() => setShowFolders(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    フォルダ追加
                  </Button>
                )}
                <Button variant="outline">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  並べ替え
                </Button>
                <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => setEditingTag({
                  id: 'new',
                  name: '',
                  actionSet: false,
                  limitSet: false,
                  createdAt: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
                  friendCount: 0,
                  folder: 'uncategorized',
                })}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  新規作成
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  CSV一括追加
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  並べ替え
                </Button>
                <div className="relative w-64">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="検索"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-lg border">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-medium text-sm">
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={selectedTags.length === tags.length && tags.length > 0}
                    onCheckedChange={toggleAllTags}
                  />
                </div>
                <div className="col-span-3 flex items-center">
                  管理名
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <div className="col-span-2 text-center">アクション設定</div>
                <div className="col-span-2 text-center">人数制限</div>
                <div className="col-span-2 flex items-center justify-center">
                  作成日
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <div className="col-span-2 text-center">友だち数</div>
              </div>

              {/* Table Rows */}
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <div className="col-span-1 flex items-center">
                    <Checkbox
                      checked={selectedTags.includes(tag.id)}
                      onCheckedChange={() => toggleTag(tag.id)}
                    />
                  </div>
                  <div className="col-span-3">
                    <button
                      onClick={() => setEditingTag(tag)}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {tag.name}
                    </button>
                  </div>
                  <div className="col-span-2 text-center text-sm text-gray-600">
                    {tag.actionSet ? 'アクション設定あり' : 'アクション設定なし'}
                  </div>
                  <div className="col-span-2 text-center text-sm text-gray-600">
                    {tag.limitSet ? '人数制限あり' : '人数制限なし'}
                  </div>
                  <div className="col-span-2 text-center text-sm text-gray-600">
                    {tag.createdAt}
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <span className="text-sm">{tag.friendCount}人</span>
                    <Button variant="outline" size="sm">
                      表示
                    </Button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white border-t p-4">
            <div className="flex items-center justify-between">
              <div>
                {!showFolders && (
                  <button
                    onClick={() => setShowFolders(true)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>フォルダを表示</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" disabled={selectedTags.length === 0}>
                  <FolderIcon className="h-4 w-4 mr-2" />
                  一括フォルダ変更
                </Button>
                <Button variant="outline" disabled={selectedTags.length === 0}>
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  一括削除
                </Button>
                <select className="border rounded px-3 py-2 text-sm">
                  <option>100/page</option>
                  <option>50/page</option>
                  <option>200/page</option>
                </select>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Tag Edit Modal */}
      {editingTag && (
        <TagEditModal
          tag={editingTag}
          folders={folders.filter(f => !f.name.startsWith('=='))}
          onClose={() => setEditingTag(null)}
          onSave={(updatedTag) => {
            // Handle save
            setEditingTag(null)
          }}
        />
      )}
    </>
  )
}
