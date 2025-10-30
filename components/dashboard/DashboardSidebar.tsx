'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  CalendarIcon,
  SparklesIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  CogIcon,
  LinkIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentListIcon,
  PresentationChartLineIcon,
  TagIcon,
  UserPlusIcon,
  ArrowPathIcon,
  ChatBubbleBottomCenterTextIcon,
  CpuChipIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

interface SubMenuItem {
  name: string
  href: string
}

interface NavigationItem {
  name: string
  href: string
  icon: any
  badge?: number
  subItems?: SubMenuItem[]
}

const navigation = [
  {
    name: 'メインサービス',
    items: [
      {
        name: '1:1チャット',
        href: '/dashboard/chat',
        icon: ChatBubbleLeftRightIcon,
        subItems: [
          { name: '1:1チャット', href: '/dashboard/chat' },
          { name: 'チャット設定', href: '/dashboard/chat/settings' },
        ]
      },
      {
        name: '顧客対応',
        href: '/dashboard/customer-support',
        icon: ChatBubbleBottomCenterTextIcon,
        subItems: [
          { name: 'チャット管理', href: '/dashboard/customer-support/chat-management' },
          { name: '自動応答', href: '/dashboard/auto-response' },
          { name: 'リッチメニュー', href: '/dashboard/rich-menus' },
          { name: '通知設定', href: '/dashboard/customer-support/notifications' },
        ]
      },
      {
        name: 'あいさつメッセージ',
        href: '/dashboard/customer-support/greeting',
        icon: SparklesIcon,
        subItems: [
          { name: '新規友だち用', href: '/dashboard/customer-support/greeting?tab=new' },
          { name: '既存友だち用', href: '/dashboard/customer-support/greeting?tab=existing' },
          { name: 'ブロック解除友だち用', href: '/dashboard/customer-support/greeting?tab=unblock' },
        ]
      },
      {
        name: 'メッセージ',
        href: '/dashboard/messages',
        icon: DocumentTextIcon,
        subItems: [
          { name: '新規メッセージ', href: '/dashboard/messages/new' },
          { name: 'テンプレート', href: '/dashboard/messages/templates' },
          { name: 'ステップ配信', href: '/dashboard/messages/step-campaigns' },
          { name: 'フォーム', href: '/dashboard/forms' },
        ]
      },
      {
        name: '情報管理',
        href: '/dashboard/friends',
        icon: UserGroupIcon,
        subItems: [
          { name: '友だち一覧', href: '/dashboard/friends' },
          { name: 'タグ管理', href: '/dashboard/friends/tags' },
          { name: 'セグメント', href: '/dashboard/friends/segments' },
          { name: 'インポート', href: '/dashboard/friends/import' },
          { name: '友だち情報管理', href: '/dashboard/data-management/friend-info' },
          { name: 'アクションスケジュール実行', href: '/dashboard/data-management/action-schedule' },
          { name: 'QRコードアクション', href: '/dashboard/data-management/qr-actions' },
        ]
      },
      {
        name: '予約管理',
        href: '/dashboard/reservations',
        icon: CalendarIcon,
        subItems: [
          { name: 'レッスン予約', href: '/dashboard/reservations/lessons' },
          { name: 'サロン・面談予約', href: '/dashboard/reservations/salon' },
          { name: 'イベント予約', href: '/dashboard/reservations/events' },
          { name: 'リマインド配信', href: '/dashboard/reservations/reminders' },
        ]
      },
      {
        name: 'データ分析',
        href: '/dashboard/analytics',
        icon: ChartBarIcon,
        subItems: [
          { name: 'クロス分析', href: '/dashboard/analytics/cross-analysis' },
          { name: 'レポート', href: '/dashboard/analytics/reports' },
          { name: 'URL分析', href: '/dashboard/analytics/url-analysis' },
        ]
      },
    ] as NavigationItem[],
  },
  {
    name: 'システム管理関連',
    items: [
      {
        name: 'アカウント設定',
        href: '/dashboard/settings',
        icon: CogIcon,
        subItems: [
          { name: 'アカウント設定', href: '/dashboard/settings' },
          { name: '請求設定', href: '/dashboard/settings/billing' },
        ]
      },
      { name: 'LINE公式アカウント設定', href: '/dashboard/settings/line', icon: Squares2X2Icon },
    ] as NavigationItem[],
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (itemName: string) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
    setHoveredItem(itemName)
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredItem(null)
    }, 200)
    setHideTimeout(timeout)
  }

  return (
    <aside className="w-80 border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto overflow-x-visible z-40" style={{ backgroundColor: '#f4fbf3' }}>
      <nav className="p-4 space-y-6 relative">
        {navigation.map((section) => (
          <div key={section.name}>
            <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">
              {section.name}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))
                const hasSubItems = item.subItems && item.subItems.length > 0

                return (
                  <li
                    key={item.name}
                    className="relative"
                    data-menu-item={item.name}
                    onMouseEnter={() => handleMouseEnter(item.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {hasSubItems ? (
                      <div
                        className={cn(
                          'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-bold transition-colors cursor-pointer',
                          isActive
                            ? 'bg-green-100 text-green-700'
                            : 'text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRightIcon className="h-4 w-4 shrink-0" />
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-bold transition-colors',
                          isActive
                            ? 'bg-green-100 text-green-700'
                            : 'text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    )}

                    {hasSubItems && hoveredItem === item.name && (
                      <div
                        className="fixed left-80 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999]"
                        style={{
                          top: `${(typeof window !== 'undefined' && document.querySelector(`[data-menu-item="${item.name}"]`)
                            ? document.querySelector(`[data-menu-item="${item.name}"]`)!.getBoundingClientRect().top
                            : 0)}px`
                        }}
                        onMouseEnter={() => handleMouseEnter(item.name)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {item.subItems?.map((subItem) => {
                          const isSubActive = pathname === subItem.href

                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                'block px-4 py-2.5 text-base font-semibold transition-colors',
                                isSubActive
                                  ? 'bg-green-50 text-green-700'
                                  : 'text-gray-700 hover:bg-gray-50'
                              )}
                            >
                              {subItem.name}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* メニュー非表示 */}
      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <Squares2X2Icon className="h-4 w-4" />
          <span>メニューを非表示</span>
        </button>
      </div>
    </aside>
  )
}
