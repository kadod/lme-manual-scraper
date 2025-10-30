'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  CalendarIcon,
  ArrowLeftIcon,
  ClockIcon,
  PlusIcon,
  Bars3Icon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import { ReservationOverallSettings } from '@/components/reservations/ReservationOverallSettings'

type TabKey = 'today' | 'calendar' | 'courses' | 'settings' | 'payment' | 'unused'

interface TodayReservation {
  id: string
  operationDateTime: string
  visitDateTime: string
  status: string
  customerName: string
  course: string
  paymentAmount: number
}

interface Course {
  id: string
  enabled: boolean
  imageUrl: string | null
  name: string
  price: number
  duration: number
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'today', label: '本日/新着の予約' },
  { key: 'calendar', label: '予約カレンダー' },
  { key: 'courses', label: 'コース設定' },
  { key: 'settings', label: '全体設定' },
  { key: 'payment', label: '決済連携' },
  { key: 'unused', label: '利用なし' },
]

const TIME_SLOTS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00',
]

const CALENDAR_VIEWS = ['日', '週', '月', '一覧']

export default function LessonReservationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('today')
  const [calendarView, setCalendarView] = useState('日')
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Sample data
  const todayReservations: TodayReservation[] = []

  const courses: Course[] = [
    {
      id: '1',
      enabled: true,
      imageUrl: null,
      name: '無料相談',
      price: 0,
      duration: 30,
    },
  ]

  const formatDate = (date: Date) => {
    const days = ['日', '月', '火', '水', '木', '金', '土']
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = days[date.getDay()]
    return `${year}年${month}月${day}日(${dayOfWeek})`
  }

  const renderTodayTab = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        本日の予約と、7日間以内の新着予約を確認できます
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="border-b px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{formatDate(selectedDate)}</h3>
            <span className="text-sm text-gray-600">新着予約: 0件</span>
          </div>
        </div>

        {todayReservations.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">7日間以内の新着予約はありません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">操作が行われた日時</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">来店予定日時</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">ステータス</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">お名前</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">コース</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">決済金額</th>
                </tr>
              </thead>
              <tbody>
                {todayReservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{reservation.operationDateTime}</td>
                    <td className="px-4 py-3 text-sm">{reservation.visitDateTime}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{reservation.customerName}</td>
                    <td className="px-4 py-3 text-sm">{reservation.course}</td>
                    <td className="px-4 py-3 text-sm">¥{reservation.paymentAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  const renderCalendarTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">{formatDate(selectedDate)}</div>
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 rotate-180" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {CALENDAR_VIEWS.map((view) => (
            <Button
              key={view}
              variant={calendarView === view ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalendarView(view)}
              className={calendarView === view ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {view}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-600 w-32">
                  時間
                </th>
                {courses.map((course) => (
                  <th key={course.id} className="border px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-600">
                    {course.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time}>
                  <td className="border px-4 py-3 text-sm text-gray-600 bg-gray-50">
                    {time}
                  </td>
                  {courses.map((course) => (
                    <td key={course.id} className="border px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="min-h-[60px]"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          受付枠追加
        </Button>
      </div>
    </div>
  )

  const renderCoursesTab = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        コースの表示順を変更したり、有効/無効を切り替えることができます
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-center w-16">
                  <Bars3Icon className="h-5 w-5 text-gray-400 mx-auto" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 w-24">ON/OFF</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 w-32">画像</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">コース名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 w-32">料金</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 w-32">基本所要時間</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr key={course.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-center cursor-move">
                    <Bars3Icon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="px-4 py-3">
                    <div className={`w-12 h-6 rounded-full ${course.enabled ? 'bg-green-500' : 'bg-gray-300'} flex items-center px-0.5 cursor-pointer`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${course.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {course.imageUrl ? (
                      <img src={course.imageUrl} alt={course.name} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a href="#" className="text-blue-600 hover:underline font-medium">
                      {course.name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    ¥{course.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {course.duration}分
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          新しいコースを追加
        </Button>
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <ReservationOverallSettings
      reservationId={params.id as string}
      reservationName="無料相談受付フォーム"
    />
  )

  const renderPaymentTab = () => (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-12 text-center">
        <div className="text-gray-400 mb-3">
          <ClockIcon className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium mb-2">決済連携</h3>
        <p className="text-gray-600 mb-6">
          オンライン決済システムと連携して、予約時の事前決済を有効化できます
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700">
          決済連携を設定
        </Button>
      </div>
    </div>
  )

  const renderUnusedTab = () => (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-12 text-center">
        <div className="text-gray-400 mb-3">
          <CalendarIcon className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-600">
          この機能は現在利用できません
        </p>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return renderTodayTab()
      case 'calendar':
        return renderCalendarTab()
      case 'courses':
        return renderCoursesTab()
      case 'settings':
        return renderSettingsTab()
      case 'payment':
        return renderPaymentTab()
      case 'unused':
        return renderUnusedTab()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/reservations/lessons')}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                一覧ページに戻る
              </Button>
              <h1 className="text-xl font-bold">無料相談受付フォーム</h1>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <CalendarIcon className="h-4 w-4 mr-2" />
              予約カレンダーを見る
            </Button>
          </div>

          <div className="flex gap-8 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {renderTabContent()}
      </div>
    </div>
  )
}
