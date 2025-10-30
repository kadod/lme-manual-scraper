'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DashboardHeaderProps {
  user: any
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-16 bg-[#00B900] text-white flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
      {/* 左側: ロゴ */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Kado Message</h1>
      </div>

      {/* 中央: ユーザー選択 */}
      <div className="flex-1 max-w-md mx-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-0"
            >
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback>{user?.display_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-left truncate">
                {user?.display_name || user?.email}
              </span>
              <ChevronDownIcon className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-64">
            <DropdownMenuLabel>アカウント</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings/profile')}>
              プロフィール設定
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings/organization')}>
              組織設定
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 右側: 統計情報 */}
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <div className="text-xs opacity-80">配信数</div>
          <div className="font-bold">437/無制限</div>
        </div>
        <div className="text-center">
          <div className="text-xs opacity-80">LINE公式アカウント</div>
          <div className="font-bold">151/5,000 (ライト)</div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
        >
          <QuestionMarkCircleIcon className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          className="bg-white/10 hover:bg-white/20 text-white border-white/30"
          onClick={() => router.push('/dashboard/settings/billing')}
        >
          詳細を見る
        </Button>
      </div>
    </header>
  )
}
