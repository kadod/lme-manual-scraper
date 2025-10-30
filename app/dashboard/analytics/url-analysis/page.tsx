'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  PlusCircleIcon,
  Bars3Icon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

interface URLAnalysis {
  id: string
  registrationDate: string
  page: string
  deliveryCount: number
  openCount: number
  uniqueClickCount: number
}

export default function URLAnalysisPage() {
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [analyses, setAnalyses] = useState<URLAnalysis[]>([])

  const folders = [
    { id: 'all', name: '未分類', count: 0 },
  ]

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Folders */}
      <div className="w-64 border-r bg-white p-4">
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">フォルダ</h3>
          <div className="flex items-center gap-2 mb-3">
            <button className="p-2 hover:bg-gray-100 rounded">
              <PlusCircleIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Bars3Icon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

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
          <h1 className="text-2xl font-bold mb-4">URL分析</h1>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-gray-500 text-white hover:bg-gray-600">
              並び替え
            </Button>
            <Button variant="outline" className="bg-gray-500 text-white hover:bg-gray-600">
              一括フォルダ変更
            </Button>
            <Button variant="outline" className="bg-gray-500 text-white hover:bg-gray-600">
              一括削除
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg border">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    登録日
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    ページ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    配信数
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    開封数/率
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    ユニーククリック数/率
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      データがありません
                    </td>
                  </tr>
                ) : (
                  analyses.map((analysis) => (
                    <tr key={analysis.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {analysis.registrationDate}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {analysis.page}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {analysis.deliveryCount}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {analysis.openCount}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {analysis.uniqueClickCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
