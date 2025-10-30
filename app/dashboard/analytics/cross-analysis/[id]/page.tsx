'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronDownIcon,
  FunnelIcon,
  Bars3Icon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface AnalysisItem {
  id: string
  name: string
  count: number
  columns: { [key: string]: string }
}

export default function CrossAnalysisEditPage() {
  const params = useParams()
  const router = useRouter()
  const [managementName, setManagementName] = useState('日計管理【流入】')
  const [selectedFolder, setSelectedFolder] = useState('未分類')

  const columns = [
    { id: '1', name: '広告（meta）', status: '有効' },
    { id: '2', name: 'HP', status: '有効' },
    { id: '3', name: '高橋さん経由', status: '有効' },
    { id: '4', name: '株式会社バト...', status: '有効' },
    { id: '5', name: '株式会社2Peace', status: '有効' },
  ]

  const rows = [
    { id: '1', name: '非購入アカウント', count: 0 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/dashboard/analytics/cross-analysis" className="hover:text-gray-900">
            TOP
          </Link>
          <span>&gt;</span>
          <Link href="/dashboard/analytics/cross-analysis" className="hover:text-gray-900">
            クロス分析
          </Link>
          <span>&gt;</span>
          <span>編集</span>
        </div>

        <h1 className="text-2xl font-bold mb-6">クロス分析 編集</h1>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              管理名
              <span className="ml-2 text-gray-500">8/50</span>
            </label>
            <Input
              value={managementName}
              onChange={(e) => setManagementName(e.target.value)}
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">フォルダ</label>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="未分類">未分類</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="p-6">
        <div className="bg-white rounded-lg border">
          {/* Analysis Header */}
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">分析項目</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-blue-600">
                  <span className="text-lg mr-1">+</span>
                  分析項目の追加
                </Button>
                <Button variant="ghost" size="sm">
                  <FunnelIcon className="h-4 w-4 mr-1" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Bars3Icon className="h-4 w-4" />
                  表示する条だち
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">分析対象人数</span>
                <Link href="#" className="ml-2 text-blue-600 underline">
                  1421
                </Link>
                <span className="ml-1">人 (友だち全員)</span>
              </div>
              <Button variant="ghost" size="sm">
                <FunnelIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Analysis Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left min-w-[200px] sticky left-0 bg-gray-50 z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">タグ</span>
                      <button>
                        <EllipsisHorizontalIcon className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center min-w-[80px]">
                    <div className="text-sm font-medium">対象人数</div>
                  </th>
                  {columns.map((col, index) => (
                    <th key={col.id} className="px-4 py-3 min-w-[180px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-500 text-white text-xs">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium truncate mx-2 flex-1">
                            {col.name}
                          </span>
                          <button>
                            <EllipsisHorizontalIcon className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-600">{col.status}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-8 sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-2">
                        <Bars3Icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-8 text-center text-sm">{row.count}</td>
                    {columns.map((col) => (
                      <td key={col.id} className="px-4 py-8 bg-gray-200">
                        <div className="flex items-center justify-center min-h-[100px]">
                          {/* Empty cell - will show data or "分析リストから数値を確認" message */}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Center Message */}
          <div className="p-12 text-center border-t">
            <div className="inline-flex flex-col items-center justify-center bg-white rounded-lg border-2 border-dashed p-8">
              <Bars3Icon className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-blue-600 font-medium mb-1">分析リスト</p>
              <p className="text-sm text-gray-600">から数値を確認</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 px-8">
            この内容で分析リストを作成・更新
          </Button>
          <Button variant="outline">戻る</Button>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              2025/10/20 15:37
            </span>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">100/page</span>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
