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
  FolderIcon,
  TrashIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline'

interface EventReservation {
  id: string
  name: string
  eventPageUrl: string
  expectedParticipants: number
  capacity: number
  waitlist: number
  createdAt: string
  folder: string
}

interface Folder {
  id: string
  name: string
  count: number
}

export default function EventReservationsPage() {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>('uncategorized')

  const folders: Folder[] = [
    { id: 'uncategorized', name: '未分類', count: 0 },
  ]

  const events: EventReservation[] = []

  const toggleEvent = (id: string) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    )
  }

  const toggleAllEvents = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([])
    } else {
      setSelectedEvents(events.map((e) => e.id))
    }
  }

  return (
    <div className="flex-1 flex h-screen">
      {/* Left Sidebar - Folders */}
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
              {folder.id !== 'uncategorized' && (
                <button className="p-1 hover:bg-gray-200 rounded">
                  <EllipsisHorizontalIcon className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button className="bg-blue-500 hover:bg-blue-600">
                <PlusIcon className="h-5 w-5 mr-2" />
                新規作成
              </Button>
              <Button variant="outline">
                <ArrowsUpDownIcon className="h-4 w-4 mr-2" />
                並べ替え
              </Button>
              <Button variant="outline">
                <FolderIcon className="h-4 w-4 mr-2" />
                一括フォルダ変更
              </Button>
              <Button
                variant="outline"
                disabled={selectedEvents.length === 0}
                className="text-red-600 hover:text-red-700 disabled:text-gray-400"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                一括削除
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
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border overflow-hidden">
            {/* Table Header - Green Background */}
            <div className="grid grid-cols-12 gap-4 p-3 bg-emerald-500 text-white font-medium text-sm">
              <div className="col-span-1 flex items-center">
                <Checkbox
                  checked={selectedEvents.length === events.length && events.length > 0}
                  onCheckedChange={toggleAllEvents}
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-emerald-500"
                />
              </div>
              <div className="col-span-2">作成日/管理名</div>
              <div className="col-span-2">イベントページ</div>
              <div className="col-span-1 text-center">参加予定</div>
              <div className="col-span-1 text-center">定員</div>
              <div className="col-span-1 text-center">募集待ち</div>
              <div className="col-span-2 text-center">参加済みリスト</div>
              <div className="col-span-2 text-center">予約一覧</div>
            </div>

            {/* Empty State */}
            {events.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">データがありません。</p>
              </div>
            )}

            {/* Table Rows */}
            {events.map((event) => (
              <div
                key={event.id}
                className="grid grid-cols-12 gap-4 p-3 border-b last:border-b-0 hover:bg-gray-50"
              >
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={() => toggleEvent(event.id)}
                  />
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500">{event.createdAt}</div>
                  <div className="font-medium">{event.name}</div>
                </div>
                <div className="col-span-2">
                  <a
                    href={event.eventPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {event.eventPageUrl}
                  </a>
                </div>
                <div className="col-span-1 text-center text-sm">
                  {event.expectedParticipants}
                </div>
                <div className="col-span-1 text-center text-sm">
                  {event.capacity}
                </div>
                <div className="col-span-1 text-center text-sm">
                  {event.waitlist}
                </div>
                <div className="col-span-2 text-center">
                  <Button variant="outline" size="sm">
                    参加済みリスト
                  </Button>
                </div>
                <div className="col-span-2 text-center">
                  <Link href={`/dashboard/reservations/events/${event.id}`}>
                    <Button variant="outline" size="sm">
                      予約一覧
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
