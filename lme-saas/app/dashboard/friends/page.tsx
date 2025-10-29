import { Suspense } from 'react'
import { UserGroupIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchBar } from '@/components/friends/SearchBar'
import { FilterPanel } from '@/components/friends/FilterPanel'
import { FriendsTable } from '@/components/friends/FriendsTable'
import { FriendsTableSkeleton } from '@/components/friends/FriendsTableSkeleton'
import { Pagination } from '@/components/friends/Pagination'
import { createClient } from '@/lib/supabase/server'
import { LineFriend } from '@/types/friends'

interface FriendsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    lastInteractionDays?: string
    page?: string
  }>
}

async function FriendsContent({
  search,
  status,
  lastInteractionDays,
  page,
}: {
  search?: string
  status?: string
  lastInteractionDays?: string
  page?: string
}) {
  const supabase = await createClient()
  const currentPage = parseInt(page || '1', 10)
  const pageSize = 20

  // Build query
  let query = supabase
    .from('line_friends')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Search filter
  if (search) {
    query = query.or(`display_name.ilike.%${search}%,line_user_id.ilike.%${search}%`)
  }

  // Status filter
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  // Last interaction filter
  if (lastInteractionDays && lastInteractionDays !== 'all') {
    const days = parseInt(lastInteractionDays, 10)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    query = query.gte('last_interaction_at', cutoffDate.toISOString())
  }

  // Pagination
  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  // Execute query
  const { data: friends, error, count } = await query

  if (error) {
    console.error('Error fetching friends:', error)
    throw new Error('友だちの取得に失敗しました')
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <>
      <FriendsTable friends={(friends as LineFriend[]) || []} />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
        />
      )}
    </>
  )
}

export default async function FriendsPage({ searchParams }: FriendsPageProps) {
  const params = await searchParams

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserGroupIcon className="h-8 w-8" />
            友だちリスト
          </h2>
          <p className="text-muted-foreground mt-1">
            LINE公式アカウントの友だちを管理します
          </p>
        </div>
        <Button>
          <UserPlusIcon className="h-5 w-5 mr-2" />
          友だちを追加
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総友だち数</CardTitle>
            <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              読み込み中...
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">フォロー中</CardTitle>
            <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              読み込み中...
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の新規</CardTitle>
            <UserPlusIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              読み込み中...
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchBar />
        <FilterPanel />
      </div>

      {/* Friends Table */}
      <Suspense fallback={<FriendsTableSkeleton />}>
        <FriendsContent
          search={params.search}
          status={params.status}
          lastInteractionDays={params.lastInteractionDays}
          page={params.page}
        />
      </Suspense>
    </div>
  )
}
