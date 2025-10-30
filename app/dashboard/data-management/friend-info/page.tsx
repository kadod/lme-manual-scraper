'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  PlusIcon,
  FolderIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline'

interface FriendInfo {
  id: string
  createdAt: string
  name: string
  infoType: string
  answerCount: number
  folder: string
}

interface Folder {
  id: string
  name: string
  count: number
}

export default function FriendInfoManagementPage() {
  const [selectedInfos, setSelectedInfos] = useState<string[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [showFolders, setShowFolders] = useState(true)

  const folders: Folder[] = [
    { id: 'uncategorized', name: '未分類', count: 0 },
    { id: 'basic', name: '基本情報', count: 4 },
    { id: 'domestic', name: '国内住所', count: 5 },
    { id: 'basic2', name: '基本情報', count: 4 },
    { id: 'initial-survey', name: '初期アンケート', count: 7 },
  ]

  const friendInfos: FriendInfo[] = []

  const toggleInfo = (id: string) => {
    setSelectedInfos((prev) =>
      prev.includes(id) ? prev.filter((iid) => iid !== id) : [...prev, id]
    )
  }

  const toggleAllInfos = () => {
    if (selectedInfos.length === friendInfos.length) {
      setSelectedInfos([])
    } else {
      setSelectedInfos(friendInfos.map((i) => i.id))
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Folders */}
      {showFolders && (
        <aside className="w-64 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg mb-3">フォルダ</h2>
            <Button variant="outline" className="w-full mb-2">
              <PlusIcon className="h-4 w-4 mr-2" />
              フォルダ追加
            </Button>
            <Button variant="outline" className="w-full">
              <ArrowsUpDownIcon className="h-4 w-4 mr-2" />
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
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2">友だち情報管理</h1>
            <p className="text-sm text-gray-600">
              友だち情報のページ1:1チャットに表示させる情報を追加で登録することができます。
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button className="bg-blue-500 hover:bg-blue-600">
                <PlusIcon className="h-5 w-5 mr-2" />
                新規作成
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline">
                <ArrowsUpDownIcon className="h-4 w-4 mr-2" />
                並べ替え
              </Button>
              <Button variant="outline">一括フォルダ変更</Button>
              <Button variant="outline">一括削除</Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg border">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-green-500 text-white font-medium text-sm">
              <div className="col-span-1 flex items-center">
                <Checkbox
                  checked={selectedInfos.length === friendInfos.length && friendInfos.length > 0}
                  onCheckedChange={toggleAllInfos}
                  className="border-white"
                />
              </div>
              <div className="col-span-2">作成日</div>
              <div className="col-span-3">管理名</div>
              <div className="col-span-2">情報タイプ</div>
              <div className="col-span-2">回答人数</div>
            </div>

            {/* Empty State */}
            {friendInfos.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                データがありません。
              </div>
            )}

            {/* Table Rows */}
            {friendInfos.map((info) => (
              <div
                key={info.id}
                className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50"
              >
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={selectedInfos.includes(info.id)}
                    onCheckedChange={() => toggleInfo(info.id)}
                  />
                </div>
                <div className="col-span-2 text-sm text-gray-600">
                  {info.createdAt}
                </div>
                <div className="col-span-3">
                  <button className="font-medium text-blue-600 hover:text-blue-800">
                    {info.name}
                  </button>
                </div>
                <div className="col-span-2 text-sm text-gray-600">
                  {info.infoType}
                </div>
                <div className="col-span-2 text-sm text-gray-600">
                  {info.answerCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
