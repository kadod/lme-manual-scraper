'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  PlayIcon,
  FolderIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

interface Template {
  id: string
  name: string
  content: string
  preview: string
  createdAt: string
  folder: string
}

interface Folder {
  id: string
  name: string
  count: number
}

export default function TemplatesListPage() {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  const folders: Folder[] = [
    { id: 'uncategorized', name: '未分類', count: 0 },
    { id: 'initial-survey', name: '初期アンケート', count: 8 },
    { id: 'initial-survey-result', name: '初期アンケート_結果', count: 8 },
    { id: 'reminder', name: 'リマインド', count: 8 },
  ]

  const templates: Template[] = [
    {
      id: '1',
      name: '初期アンケート_開始',
      content: '{name}さん、友達追加ありがとうございます...',
      preview: 'パネル',
      createdAt: '2025.07.30',
      folder: 'initial-survey',
    },
    {
      id: '2',
      name: '初期アンケート_質問①',
      content: '退職予定は　パネル / 退職時期はお決まり...',
      preview: 'パネル',
      createdAt: '2025.07.30',
      folder: 'initial-survey',
    },
    {
      id: '3',
      name: '初期アンケート_質問②',
      content: '年齢は？　パネル / 現在おいくつですか...',
      preview: 'パネル',
      createdAt: '2025.07.30',
      folder: 'initial-survey',
    },
    {
      id: '4',
      name: '初期アンケート_質問③',
      content: '無期雇用か期間 / 雇用保険の合計加入...',
      preview: 'パネル',
      createdAt: '2025.07.30',
      folder: 'initial-survey',
    },
    {
      id: '5',
      name: '初期アンケート_質問④',
      content: '失業の場合は？　パネル / 月給は？...',
      preview: 'パネル',
      createdAt: '2025.07.30',
      folder: 'initial-survey',
    },
    {
      id: '6',
      name: '初期アンケート_質問⑤',
      content: '数値明記は　パネル / 再就職先は決まって...',
      preview: 'パネル',
      createdAt: '2025.07.30',
      folder: 'initial-survey',
    },
    {
      id: '7',
      name: '初期アンケート_質問5.5',
      content: 'パネル / 再就職先から内定を...',
      preview: 'パネル',
      createdAt: '2025.07.30',
      folder: 'initial-survey',
    },
  ]

  const toggleTemplate = (id: string) => {
    setSelectedTemplates((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    )
  }

  const toggleAllTemplates = () => {
    if (selectedTemplates.length === templates.length) {
      setSelectedTemplates([])
    } else {
      setSelectedTemplates(templates.map((t) => t.id))
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Folders */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-3">テンプレート</h2>
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
              }`}
              onClick={() => setSelectedFolder(folder.id)}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{folder.name}</span>
                <span className="text-sm text-gray-500">({folder.count})</span>
              </div>
              {folder.id !== 'uncategorized' && (
                <button className="p-1 hover:bg-gray-200 rounded">
                  <EllipsisHorizontalIcon className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <FolderIcon className="h-4 w-4" />
            <span>フォルダを非表示</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/messages/templates/new">
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  新規作成
                </Button>
              </Link>
              <Button variant="outline">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                並べ替え
              </Button>
            </div>

            <div className="relative w-96">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="管理名を入力"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button variant="outline">
              マニュアル
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-medium text-sm">
              <div className="col-span-1 flex items-center">
                <Checkbox
                  checked={selectedTemplates.length === templates.length && templates.length > 0}
                  onCheckedChange={toggleAllTemplates}
                />
              </div>
              <div className="col-span-3">管理名</div>
              <div className="col-span-4">内容</div>
              <div className="col-span-2">作成日</div>
              <div className="col-span-2 text-center">操作</div>
            </div>

            {/* Table Rows */}
            {templates.map((template) => (
              <div
                key={template.id}
                className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50"
              >
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={selectedTemplates.includes(template.id)}
                    onCheckedChange={() => toggleTemplate(template.id)}
                  />
                </div>
                <div className="col-span-3">
                  <Link href={`/dashboard/messages/templates/${template.id}`} className="font-medium hover:text-blue-600">
                    {template.name}
                  </Link>
                </div>
                <div className="col-span-4">
                  <div className="flex items-center gap-2">
                    {template.preview === 'パネル' && (
                      <div className="flex gap-1">
                        <div className="w-8 h-2 bg-yellow-400 rounded"></div>
                        <div className="w-8 h-2 bg-yellow-400 rounded"></div>
                        <div className="w-8 h-2 bg-yellow-400 rounded"></div>
                      </div>
                    )}
                    <span className="text-sm text-gray-600 truncate">{template.content}</span>
                  </div>
                </div>
                <div className="col-span-2 text-sm text-gray-600">{template.createdAt}</div>
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <Link href={`/dashboard/messages/templates/${template.id}`}>
                    <Button variant="outline" size="sm">
                      <PlayIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              disabled={selectedTemplates.length === 0}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              一括フォルダ変更
            </Button>
            <Button
              variant="outline"
              disabled={selectedTemplates.length === 0}
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              一括削除
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
