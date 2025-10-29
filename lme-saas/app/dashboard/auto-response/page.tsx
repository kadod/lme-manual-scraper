import { Suspense } from 'react'
import { getAutoResponseRules, getAutoResponseStats } from '@/app/actions/auto-response'
import { RuleStats } from '@/components/auto-response/RuleStats'
import { RuleList } from '@/components/auto-response/RuleList'
import { RuleFilters } from '@/components/auto-response/RuleFilters'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface PageProps {
  searchParams: {
    type?: string
    status?: string
    search?: string
  }
}

export default async function AutoResponsePage({ searchParams }: PageProps) {
  const filters = {
    type: searchParams.type as any,
    status: searchParams.status as any,
    search: searchParams.search,
  }

  const [rules, stats] = await Promise.all([
    getAutoResponseRules(filters),
    getAutoResponseStats(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">自動応答ルール</h1>
          <p className="text-muted-foreground mt-2">
            キーワード、シナリオ、AIを使った自動応答を管理します
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/auto-response/new">
            <PlusIcon className="h-5 w-5 mr-2" />
            新規作成
          </Link>
        </Button>
      </div>

      <RuleStats stats={stats} />

      <div className="space-y-4">
        <RuleFilters />
        <Suspense fallback={<div>読み込み中...</div>}>
          <RuleList rules={rules} />
        </Suspense>
      </div>
    </div>
  )
}
