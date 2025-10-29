import { Suspense } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { URLList } from '@/components/analytics/URLList'
import { URLCreateButton } from '@/components/analytics/URLCreateButton'
import { getUrlTrackingList } from '@/app/actions/url-tracking'

export default async function URLTrackingPage() {
  let urls: any[] = []
  let error: string | null = null

  try {
    urls = await getUrlTrackingList()
  } catch (e) {
    error = e instanceof Error ? e.message : 'URLの取得に失敗しました'
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">エラーが発生しました: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalClicks = urls.reduce((sum, url) => sum + (url.total_clicks || 0), 0)
  const totalUrls = urls.length

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">URL計測</h1>
          <p className="text-muted-foreground mt-2">
            短縮URLを作成して、クリック数を計測・分析します
          </p>
        </div>
        <URLCreateButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">作成済みURL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUrls}</div>
            <p className="text-xs text-muted-foreground mt-1">
              短縮URL総数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総クリック数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              全URL合計
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>URL一覧</CardTitle>
          <CardDescription>
            作成した短縮URLとクリック数を確認できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="py-8 text-center">読み込み中...</div>}>
            <URLList
              urls={urls.map(url => ({
                id: url.id,
                organization_id: url.organization_id,
                original_url: url.original_url,
                short_code: url.short_code,
                message_id: url.message_id,
                click_count: url.total_clicks || 0,
                unique_click_count: url.unique_clicks || 0,
                expires_at: url.expires_at,
                created_at: url.created_at,
                updated_at: url.updated_at,
              }))}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
