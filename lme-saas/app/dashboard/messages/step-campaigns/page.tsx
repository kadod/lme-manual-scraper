import { Suspense } from 'react'
import Link from 'next/link'
import { BoltIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CampaignList } from '@/components/messages/CampaignList'
import { createClient } from '@/lib/supabase/server'

async function CampaignsContent() {
  const supabase = await createClient()

  // Fetch campaigns with statistics
  const { data: campaigns, error } = await supabase
    .from('step_campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching campaigns:', error)
    throw new Error('キャンペーンの取得に失敗しました')
  }

  return <CampaignList campaigns={campaigns || []} />
}

function CampaignsLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-3/4 mb-4" />
            <div className="h-3 bg-muted rounded w-1/2 mb-6" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function StepCampaignsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BoltIcon className="h-8 w-8" />
            ステップ配信キャンペーン
          </h2>
          <p className="text-muted-foreground mt-1">
            自動配信シナリオを作成・管理します
          </p>
        </div>
        <Link href="/dashboard/messages/step-campaigns/new">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            新規キャンペーン
          </Button>
        </Link>
      </div>

      {/* Campaigns List */}
      <Suspense fallback={<CampaignsLoading />}>
        <CampaignsContent />
      </Suspense>
    </div>
  )
}
