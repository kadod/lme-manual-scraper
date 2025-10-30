'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'

interface LessonReservation {
  id: string
  name: string
  enabled: boolean
  imageUrl: string | null
  reservationPageUrl: string
  historyPageUrl: string
}

export default function LessonReservationsPage() {
  const [reservations, setReservations] = useState<LessonReservation[]>([
    {
      id: '1',
      name: '無料相談受付フォーム',
      enabled: true,
      imageUrl: null,
      reservationPageUrl: 'https://liff.line.me/2007836384',
      historyPageUrl: 'https://liff.line.me/2007836384',
    },
    {
      id: '2',
      name: '無料相談予約',
      enabled: false,
      imageUrl: null,
      reservationPageUrl: 'https://liff.line.me/2007836384',
      historyPageUrl: 'https://liff.line.me/2007836384',
    },
  ])

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">レッスン予約（一覧）</h1>
          <Button variant="outline" className="text-blue-600">
            <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
            並び替え
          </Button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded p-4 flex items-center justify-between">
          <p className="text-sm">
            新規作成をクリックして、はじめてのレッスン予約を作成しましょう。
          </p>
          <button className="text-green-600 hover:text-green-700">
            ✕
          </button>
        </div>
      </div>

      <div className="mb-4">
        <Button className="bg-blue-500 hover:bg-blue-600">
          <PlusIcon className="h-5 w-5 mr-2" />
          新規作成
        </Button>
        <span className="ml-4 text-sm text-gray-600">
          登録カレンダー数：{reservations.length} / 3
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="bg-white border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">スタッフ</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {reservation.enabled ? '有効' : '無効'}
                  </span>
                  <div className={`w-10 h-5 rounded-full ${reservation.enabled ? 'bg-green-500' : 'bg-gray-300'} flex items-center px-0.5`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${reservation.enabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="px-4 py-2 bg-gray-50">
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <h3 className="font-medium">{reservation.name}</h3>
              </div>
            </div>

            {/* Image Placeholder */}
            <div className="p-4">
              <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                {reservation.imageUrl ? (
                  <img src={reservation.imageUrl} alt={reservation.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Button */}
            <div className="px-4 pb-4">
              <Link href={`/dashboard/reservations/lessons/${reservation.id}`}>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  予約管理ページを開く
                </Button>
              </Link>
            </div>

            {/* URLs */}
            <div className="px-4 pb-4 space-y-2">
              <div>
                <label className="text-xs text-gray-600">予約ページURL</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={reservation.reservationPageUrl}
                    readOnly
                    className="flex-1 text-sm border rounded px-2 py-1 bg-gray-50"
                  />
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <DocumentDuplicateIcon className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">予約履歴ページURL</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={reservation.historyPageUrl}
                    readOnly
                    className="flex-1 text-sm border rounded px-2 py-1 bg-gray-50"
                  />
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <DocumentDuplicateIcon className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
