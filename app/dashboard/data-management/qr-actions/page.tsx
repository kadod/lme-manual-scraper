'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import {
  PlusIcon,
  FolderIcon,
  ArrowsUpDownIcon,
  QrCodeIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline'

interface QRAction {
  id: string
  enabled: boolean
  name: string
  targetAudience: string
  actionStatus: string
  urlReadCount: number
  qrCode: string
  folder: string
}

interface Folder {
  id: string
  name: string
  count: number
}

export default function QRCodeActionsPage() {
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [showFolders, setShowFolders] = useState(true)

  const folders: Folder[] = [
    { id: 'uncategorized', name: '未分類', count: 8 },
  ]

  const qrActions: QRAction[] = [
    {
      id: '1',
      enabled: true,
      name: '嘉島さん',
      targetAudience: '新規友だちのみ',
      actionStatus: 'アクション未設定',
      urlReadCount: 0,
      qrCode: '表示',
      folder: 'uncategorized',
    },
    {
      id: '2',
      enabled: true,
      name: 'meta広告【新規Ver._...',
      targetAudience: '新規友だちのみ',
      actionStatus: 'アクション確認',
      urlReadCount: 107,
      qrCode: '表示',
      folder: 'uncategorized',
    },
    {
      id: '3',
      enabled: true,
      name: '広告【meta_直Ver. ...',
      targetAudience: '新規友だちのみ',
      actionStatus: 'アクション未設定',
      urlReadCount: 1029,
      qrCode: '表示',
      folder: 'uncategorized',
    },
    {
      id: '4',
      enabled: true,
      name: 'HP',
      targetAudience: '新規友だちのみ',
      actionStatus: 'アクション確認',
      urlReadCount: 14,
      qrCode: '表示',
      folder: 'uncategorized',
    },
    {
      id: '5',
      enabled: true,
      name: '株式会社バトンタッチ（やめ ...',
      targetAudience: '新規友だちのみ',
      actionStatus: 'アクション確認',
      urlReadCount: 79,
      qrCode: '表示',
      folder: 'uncategorized',
    },
    {
      id: '6',
      enabled: true,
      name: '株式会社2Peace経由',
      targetAudience: '新規友だちのみ',
      actionStatus: 'アクション確認',
      urlReadCount: 69,
      qrCode: '表示',
      folder: 'uncategorized',
    },
    {
      id: '7',
      enabled: true,
      name: '高橋さん',
      targetAudience: '新規友だちのみ',
      actionStatus: 'アクション確認',
      urlReadCount: 0,
      qrCode: '表示',
      folder: 'uncategorized',
    },
    {
      id: '8',
      enabled: true,
      name: 'meta広告',
      targetAudience: '新規友だちのみ',
      actionStatus: 'アクション確認',
      urlReadCount: 557,
      qrCode: '表示',
      folder: 'uncategorized',
    },
  ]

  const toggleAction = (id: string) => {
    setSelectedActions((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    )
  }

  const toggleAllActions = () => {
    if (selectedActions.length === qrActions.length) {
      setSelectedActions([])
    } else {
      setSelectedActions(qrActions.map((a) => a.id))
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Folders */}
      {showFolders && (
        <aside className="w-64 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
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

          <div className="p-4 border-t">
            <button
              onClick={() => setShowFolders(false)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
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
            <h1 className="text-2xl font-bold mb-2">QRコードアクション（流入経路分析）</h1>
            <p className="text-sm text-gray-600">
              個別の友だち追加URLを発行し、流入経路の分析やそのURLから登録した友だちに対して個別のアクション稼働ができる機能です。
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
              <select className="border rounded px-3 py-2 text-sm">
                <option>全件表示</option>
                <option>50件表示</option>
                <option>100件表示</option>
              </select>
              <Button variant="outline">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Button>
              <Button variant="outline">
                <EllipsisHorizontalIcon className="h-5 w-5" />
              </Button>
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
                  checked={selectedActions.length === qrActions.length && qrActions.length > 0}
                  onCheckedChange={toggleAllActions}
                />
              </div>
              <div className="col-span-1 flex items-center justify-center">
                稼働状況
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <div className="col-span-2">管理名</div>
              <div className="col-span-2 flex items-center">
                稼働対象
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <div className="col-span-2">設定済みアクション</div>
              <div className="col-span-2 text-center">URL読み込み人♯</div>
              <div className="col-span-1 text-center">QRコード表示</div>
              <div className="col-span-1 text-center">データ詳細</div>
            </div>

            {/* Table Rows */}
            {qrActions.map((action) => (
              <div
                key={action.id}
                className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50"
              >
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={selectedActions.includes(action.id)}
                    onCheckedChange={() => toggleAction(action.id)}
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    action.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {action.enabled ? 'ON' : 'OFF'}
                  </div>
                </div>
                <div className="col-span-2">
                  <Link
                    href={`/dashboard/data-management/qr-actions/${action.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {action.name}
                  </Link>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-600">{action.targetAudience}</span>
                </div>
                <div className="col-span-2">
                  <Link
                    href={`/dashboard/data-management/qr-actions/${action.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {action.actionStatus}
                  </Link>
                </div>
                <div className="col-span-2 text-center text-sm text-gray-600">
                  {action.urlReadCount}
                </div>
                <div className="col-span-1 text-center">
                  <Button variant="outline" size="sm" className="text-green-600 border-green-600">
                    <QrCodeIcon className="h-4 w-4 mr-1" />
                    {action.qrCode}
                  </Button>
                </div>
                <div className="col-span-1 text-center">
                  <Button variant="outline" size="sm">
                    データ詳細
                  </Button>
                  <button className="ml-2 p-1 hover:bg-gray-200 rounded">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
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
              <Button variant="outline" disabled={selectedActions.length === 0}>
                <FolderIcon className="h-4 w-4 mr-2" />
                一括フォルダ変更
              </Button>
              <Button variant="outline" disabled={selectedActions.length === 0}>
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                一括削除
              </Button>
              <Link href="#" className="text-sm text-blue-600 hover:underline">
                削除したQRコードアクション
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
