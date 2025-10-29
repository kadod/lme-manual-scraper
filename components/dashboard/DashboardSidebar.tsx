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
      { name: 'ホーム', href: '/dashboard', icon: HomeIcon },
      {
        name: 'メッセージ',
        href: '/dashboard/messages',
        icon: DocumentTextIcon,
        subItems: [
          { name: '新規メッセージ', href: '/dashboard/messages/new' },
          { name: 'テンプレート', href: '/dashboard/messages/templates' },
          { name: 'ステップ配信', href: '/dashboard/messages/step-campaigns' },
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
        ]
      },
      {
        name: '予約管理',
        href: '/dashboard/reservations',
        icon: CalendarIcon,
        subItems: [
          { name: '予約一覧', href: '/dashboard/reservations' },
          { name: 'カレンダー', href: '/dashboard/reservations/calendar' },
          { name: '予約タイプ', href: '/dashboard/reservations/types' },
          { name: '設定', href: '/dashboard/reservations/settings' },
        ]
      },
      {
        name: 'フォーム',
        href: '/dashboard/forms',
        icon: ClipboardDocumentListIcon,
        subItems: [
          { name: 'フォーム一覧', href: '/dashboard/forms' },
        ]
      },
      {
        name: 'リッチメニュー',
        href: '/dashboard/rich-menus',
        icon: Squares2X2Icon,
        subItems: [
          { name: 'リッチメニュー一覧', href: '/dashboard/rich-menus' },
          { name: '新規作成', href: '/dashboard/rich-menus/new' },
        ]
      },
      {
        name: '自動応答',
        href: '/dashboard/auto-response',
        icon: ChatBubbleBottomCenterTextIcon,
        subItems: [
          { name: '自動応答一覧', href: '/dashboard/auto-response' },
          { name: 'AI応答', href: '/dashboard/auto-response/ai' },
          { name: '分析', href: '/dashboard/auto-response/analytics' },
        ]
      },
      {
        name: 'データ分析',
        href: '/dashboard/analytics',
        icon: ChartBarIcon,
        subItems: [
          { name: '分析ダッシュボード', href: '/dashboard/analytics' },
          { name: 'レポート', href: '/dashboard/analytics/reports' },
          { name: 'クロス分析', href: '/dashboard/analytics/cross-analysis' },
          { name: 'URL計測', href: '/dashboard/analytics/url-tracking' },
        ]
      },
    ] as NavigationItem[],
  },
  {
    name: 'システム管理関連',
    items: [
      {
        name: 'エルメシステム設定',
        href: '/dashboard/settings',
        icon: CogIcon,
        subItems: [
          { name: 'プロフィール', href: '/dashboard/settings/profile' },
          { name: '組織設定', href: '/dashboard/settings/organization' },
          { name: 'システム設定', href: '/dashboard/settings/system' },
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
    <aside className="w-64 bg-gray-100 border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto overflow-x-visible z-40">
      <nav className="p-4 space-y-6 relative">
        {navigation.map((section) => (
          <div key={section.name}>
            <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">
              {section.name}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const hasSubItems = item.subItems && item.subItems.length > 0

                return (
                  <li
                    key={item.name}
                    className="relative"
                    data-menu-item={item.name}
                    onMouseEnter={() => handleMouseEnter(item.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <Badge className="bg-red-500 text-white text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {hasSubItems && (
                        <ChevronRightIcon className="h-4 w-4 shrink-0" />
                      )}
                    </Link>

                    {hasSubItems && hoveredItem === item.name && (
                      <div
                        className="fixed left-64 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999]"
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
                                'block px-4 py-2.5 text-sm transition-colors',
                                isSubActive
                                  ? 'bg-green-50 text-green-700 font-medium'
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
