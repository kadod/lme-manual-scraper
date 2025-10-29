import { Suspense } from 'react'
import { getForms } from '@/app/actions/forms'
import { FormsPageClient } from './FormsPageClient'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'フォーム一覧',
  description: 'アンケートフォームの管理',
}

export default async function FormsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string }
}) {
  const status = searchParams.status || 'all'
  const search = searchParams.search || ''

  const forms = await getForms({ status, search })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">フォーム</h1>
          <p className="text-muted-foreground mt-2">
            アンケートフォームを作成・管理します
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/forms/new">
            <PlusIcon className="h-5 w-5 mr-2" />
            新規作成
          </Link>
        </Button>
      </div>

      <Suspense fallback={<FormsPageSkeleton />}>
        <FormsPageClient initialForms={forms} initialStatus={status} initialSearch={search} />
      </Suspense>
    </div>
  )
}

function FormsPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6">
        <div className="h-10 flex-1 bg-muted rounded-md animate-pulse" />
        <div className="h-10 w-[180px] bg-muted rounded-md animate-pulse" />
        <div className="h-10 w-[100px] bg-muted rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[200px] bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
