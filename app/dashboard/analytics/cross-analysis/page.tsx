'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'

interface CrossAnalysis {
  id: string
  name: string
  createdDate: string
  lastConditionDate: string
  folder: string
}

export default function CrossAnalysisPage() {
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [analyses, setAnalyses] = useState<CrossAnalysis[]>([
    {
      id: '1',
      name: '日計管理【流入】',
      createdDate: '2025.10.17',
      lastConditionDate: '2025.10.20',
      folder: '未分類',
    },
  ])

  const folders = [
    { id: 'all', name: '未分類', count: 1 },
  ]

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Folders */}
      <div className="w-64 border-r bg-white p-4">
        <Button variant="outline" className="w-full mb-4 justify-start">
          <PlusIcon className="h-4 w-4 mr-2" />
          フォルダ追加
        </Button>
        <Button variant="outline" className="w-full mb-6 justify-start">
          <ChevronDownIcon className="h-4 w-4 mr-2" />
          並べ替え
        </Button>

        <div className="space-y-1">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-gray-100 font-medium'
                  : 'hover:bg-gray-50'
              }`}
            >
              {folder.name} ({folder.count})
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <h1 className="text-2xl font-bold mb-4">クロス分析</h1>

          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              新規作成
            </Button>
            <Button variant="outline">
              <ChevronDownIcon className="h-4 w-4 mr-2" />
              並べ替え
            </Button>

            <div className="ml-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="検索"
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg border">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    管理名
                    <ChevronDownIcon className="inline h-4 w-4 ml-1" />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    作成日
                    <ChevronDownIcon className="inline h-4 w-4 ml-1" />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    最終条件設定日
                    <ChevronDownIcon className="inline h-4 w-4 ml-1" />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    分析リスト
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((analysis) => (
                  <tr key={analysis.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {analysis.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {analysis.createdDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {analysis.lastConditionDate}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/analytics/cross-analysis/${analysis.id}`}>
                        <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                          リストを表示
                        </Button>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-gray-400 hover:text-gray-600">
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <FolderIcon className="h-4 w-4 mr-2" />
              フォルダを非表示
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400">
              一括フォルダ変更
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400">
              一括削除
            </Button>
            <button className="text-sm text-gray-700 underline">
              削除したアイテム
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">100/page</span>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
