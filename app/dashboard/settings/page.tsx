import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '設定 | L Message',
  description: 'アカウント設定と管理',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const settingsCategories = [
    {
      title: 'プロフィール設定',
      description: '個人情報、セキュリティ、通知設定',
      icon: UserCircleIcon,
      href: '/dashboard/settings/profile',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '組織設定',
      description: '組織の基本情報、ブランディング、スタッフ管理',
      icon: BuildingOfficeIcon,
      href: '/dashboard/settings/organization',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'LINE設定',
      description: 'LINE連携、チャネル設定、Webhook設定',
      icon: ChatBubbleLeftIcon,
      href: '/dashboard/settings/line',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: '請求・支払い',
      description: 'プラン管理、支払い方法、請求履歴',
      icon: CreditCardIcon,
      href: '/dashboard/settings/billing',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'システム管理',
      description: 'データベース管理、ユーティリティ、監査ログ',
      icon: WrenchScrewdriverIcon,
      href: '/dashboard/settings/system',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">設定</h1>
        <p className="text-muted-foreground mt-2">
          アカウント、組織、システムの設定を管理
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((category) => (
          <Link key={category.title} href={category.href}>
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${category.bgColor}`}>
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {category.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>クイックアクセス</CardTitle>
          <CardDescription>よく使う設定項目</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Link
              href="/dashboard/settings/profile"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <UserCircleIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">パスワード変更</p>
                <p className="text-xs text-gray-500">セキュリティ設定</p>
              </div>
            </Link>
            <Link
              href="/dashboard/settings/line"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
            >
              <ChatBubbleLeftIcon className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-sm">LINE連携</p>
                <p className="text-xs text-gray-500">チャネル設定</p>
              </div>
            </Link>
            <Link
              href="/dashboard/settings/organization"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <BuildingOfficeIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">スタッフ管理</p>
                <p className="text-xs text-gray-500">チームメンバー追加</p>
              </div>
            </Link>
            <Link
              href="/dashboard/settings/billing"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <CreditCardIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-sm">プラン変更</p>
                <p className="text-xs text-gray-500">料金プラン管理</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
