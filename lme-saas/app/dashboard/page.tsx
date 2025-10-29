import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const stats = [
    {
      title: '友だち数',
      value: '1,234',
      icon: UserGroupIcon,
      trend: '+12.5%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '配信メッセージ',
      value: '567',
      icon: ChatBubbleLeftRightIcon,
      trend: '+8.2%',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '予約件数',
      value: '89',
      icon: CalendarIcon,
      trend: '+15.3%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '開封率',
      value: '64.2%',
      icon: ChartBarIcon,
      trend: '+2.1%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">L Message SaaS管理画面へようこそ</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">
                {stat.trend} 前月比
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近のアクティビティ</CardTitle>
            <CardDescription>直近7日間のアクション</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">新規友だち追加</p>
                  <p className="text-xs text-gray-500">2時間前</p>
                </div>
                <span className="text-sm font-semibold">+12</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">メッセージ配信完了</p>
                  <p className="text-xs text-gray-500">5時間前</p>
                </div>
                <span className="text-sm font-semibold">1,234件</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">予約受付</p>
                  <p className="text-xs text-gray-500">1日前</p>
                </div>
                <span className="text-sm font-semibold">+8</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>よく使う機能へのショートカット</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <a
                href="/messages/new"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">新規メッセージ作成</p>
                  <p className="text-xs text-gray-500">一斉配信を作成</p>
                </div>
              </a>
              <a
                href="/dashboard/friends"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <UserGroupIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">友だち管理</p>
                  <p className="text-xs text-gray-500">友だちリストを表示</p>
                </div>
              </a>
              <a
                href="/reservations"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <CalendarIcon className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">予約管理</p>
                  <p className="text-xs text-gray-500">予約状況を確認</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
