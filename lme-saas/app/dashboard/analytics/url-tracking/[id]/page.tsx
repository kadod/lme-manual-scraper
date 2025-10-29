import Link from 'next/link'
import { ArrowLeftIcon, LinkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UrlStats } from '@/components/analytics/UrlStats'
import { QRCodeGenerator } from '@/components/analytics/QRCodeGenerator'
import { getUrlStats } from '@/app/actions/url-tracking'

interface URLDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function URLDetailPage({ params }: URLDetailPageProps) {
  const { id } = await params

  let url: any = null
  let analytics: any = null
  let error: string | null = null

  try {
    // Get URL stats which includes the URL data
    const stats = await getUrlStats(id)
    url = {
      id: stats.id,
      short_code: stats.short_code,
      original_url: stats.original_url,
      click_count: stats.total_clicks,
      unique_click_count: stats.unique_clicks,
      created_at: stats.created_at,
      updated_at: stats.last_clicked_at,
      expires_at: null, // Add this field if needed
      message_id: null, // Add this field if needed
    }

    // Process analytics data
    if (stats.click_data && stats.click_data.length > 0) {
      analytics = {
        clicksByDate: stats.click_data.map(d => ({ date: d.date, clicks: d.clicks })),
        clicksByDevice: stats.device_data || [],
        clicksByReferrer: stats.referrer_data || [],
        clicksByHour: [],
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'URLの取得に失敗しました'
  }

  if (error || !url) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">エラーが発生しました: {error || 'URLが見つかりません'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/u/${url.short_code}`

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/analytics/url-tracking">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">/u/{url.short_code}</h1>
            {url.message_id && (
              <Badge variant="secondary">メッセージ連携</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2 break-all">
            {url.original_url}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総クリック数</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {url.click_count.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              累計クリック数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">作成日</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(url.created_at).toLocaleDateString('ja-JP')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(url.created_at).toLocaleTimeString('ja-JP')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最終クリック</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {url.updated_at && url.click_count > 0
                ? new Date(url.updated_at).toLocaleDateString('ja-JP')
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {url.updated_at && url.click_count > 0
                ? new Date(url.updated_at).toLocaleTimeString('ja-JP')
                : '未使用'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {analytics && (
            <UrlStats
              clicksByDate={analytics.clicksByDate}
              clicksByDevice={analytics.clicksByDevice}
              clicksByReferrer={analytics.clicksByReferrer}
              clicksByHour={analytics.clicksByHour}
            />
          )}

          {!analytics && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                まだクリックデータがありません
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <QRCodeGenerator url={shortUrl} />

          {url.expires_at && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">有効期限</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {new Date(url.expires_at).toLocaleString('ja-JP')}
                  </p>
                  {new Date(url.expires_at) < new Date() && (
                    <Badge variant="destructive">期限切れ</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
