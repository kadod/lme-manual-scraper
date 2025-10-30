'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import {
  PlusIcon,
  EllipsisHorizontalIcon,
  FolderIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

interface ReminderDelivery {
  id: string
  createdAt: string
  name: string
  isActive: boolean
  folder: string
}

interface Folder {
  id: string
  name: string
  count: number
}

export default function ReminderDeliveriesPage() {
  const [selectedReminders, setSelectedReminders] = useState<string[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  const folders: Folder[] = [
    { id: 'uncategorized', name: '未分類', count: 0 },
  ]

  const reminders: ReminderDelivery[] = []

  const toggleReminder = (id: string) => {
    setSelectedReminders((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    )
  }

  const toggleAllReminders = () => {
    if (selectedReminders.length === reminders.length) {
      setSelectedReminders([])
    } else {
      setSelectedReminders(reminders.map((r) => r.id))
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Folders */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg mb-3">フォルダ</h2>
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
          <div className="flex items-center gap-3">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <PlusIcon className="h-5 w-5 mr-2" />
              新規作成
            </Button>
            <Button variant="outline">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              並べ替え
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border">
            {/* Table Header with Green Background */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-green-600 text-white border-b font-medium text-sm">
              <div className="col-span-1 flex items-center">
                <Checkbox
                  checked={selectedReminders.length === reminders.length && reminders.length > 0}
                  onCheckedChange={toggleAllReminders}
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-green-600"
                />
              </div>
              <div className="col-span-5">作成日／管理名</div>
              <div className="col-span-5">配信中</div>
              <div className="col-span-1"></div>
            </div>

            {/* Empty State */}
            {reminders.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-500">データがありません。</p>
              </div>
            )}

            {/* Table Rows */}
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50"
              >
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={selectedReminders.includes(reminder.id)}
                    onCheckedChange={() => toggleReminder(reminder.id)}
                  />
                </div>
                <div className="col-span-5">
                  <div className="text-xs text-gray-500 mb-1">{reminder.createdAt}</div>
                  <Link
                    href={`/dashboard/reservations/reminders/${reminder.id}`}
                    className="font-medium hover:text-blue-600"
                  >
                    {reminder.name}
                  </Link>
                </div>
                <div className="col-span-5 flex items-center">
                  <span className={reminder.isActive ? 'text-green-600' : 'text-gray-400'}>
                    {reminder.isActive ? '配信中' : '停止中'}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-center">
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
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              disabled={selectedReminders.length === 0}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              一括フォルダ変更
            </Button>
            <Button
              variant="outline"
              disabled={selectedReminders.length === 0}
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
