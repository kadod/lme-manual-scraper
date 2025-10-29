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
} from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui/badge'

const navigation = [
  {
    name: 'メインサービス',
    items: [
      { name: 'ホーム', href: '/dashboard', icon: HomeIcon },
      { name: '1:1チャット', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon, badge: 2 },
      { name: '顧客対応', href: '/dashboard/customer-service', icon: UserGroupIcon },
      { name: 'あいさつメッセージ', href: '/dashboard/greetings', icon: ChatBubbleLeftRightIcon },
      { name: 'メッセージ', href: '/dashboard/messages', icon: DocumentTextIcon },
      { name: '情報管理', href: '/dashboard/friends', icon: UserGroupIcon },
      { name: '予約管理', href: '/dashboard/reservations', icon: CalendarIcon },
      { name: '商品販売', href: '/dashboard/shop', icon: ShoppingCartIcon },
      { name: 'データ分析', href: '/dashboard/analytics', icon: ChartBarIcon },
      { name: 'ASP管理', href: '/dashboard/asp', icon: LinkIcon },
      { name: 'エルメ紹介プログラム', href: '/dashboard/referral', icon: SparklesIcon },
    ],
  },
  {
    name: 'システム管理関連',
    items: [
      { name: 'エルメシステム設定', href: '/dashboard/settings', icon: CogIcon },
      { name: 'LINE公式アカウント設定', href: '/dashboard/settings/line', icon: Squares2X2Icon },
    ],
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-100 border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4 space-y-6">
        {navigation.map((section) => (
          <div key={section.name}>
            <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">
              {section.name}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <li key={item.name}>
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
                    </Link>
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
