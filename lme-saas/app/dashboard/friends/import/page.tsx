import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ArrowLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImportWizard } from '@/components/friends/ImportWizard'
import { createClient } from '@/lib/supabase/server'

async function getOrganizationAndChannel() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Get user's organization
  const { data: userOrg, error: orgError } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (orgError || !userOrg) {
    console.error('Organization not found:', orgError)
    return null
  }

  // Get active LINE channel
  const { data: channel, error: channelError } = await supabase
    .from('line_channels')
    .select('id, channel_name')
    .eq('organization_id', userOrg.organization_id)
    .eq('is_active', true)
    .single()

  if (channelError || !channel) {
    console.error('Active channel not found:', channelError)
    return null
  }

  return {
    organizationId: userOrg.organization_id,
    channelId: channel.id,
    channelName: channel.channel_name,
  }
}

export default async function ImportPage() {
  const data = await getOrganizationAndChannel()

  if (!data) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/friends">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              友だちリストに戻る
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                LINEチャネルが設定されていません
              </h3>
              <p className="text-muted-foreground mb-6">
                友だちをインポートするには、まずLINEチャネルを設定してください。
              </p>
              <Link href="/dashboard/settings">
                <Button>設定に移動</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/friends">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                友だちリストに戻る
              </Button>
            </Link>
          </div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2 mt-4">
            <UserGroupIcon className="h-8 w-8" />
            友だちインポート
          </h2>
          <p className="text-muted-foreground">
            CSVファイルから友だちデータを一括インポートします
          </p>
        </div>
      </div>

      {/* Channel Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">インポート先チャネル:</span>
            <span className="text-muted-foreground">
              {data.channelName || 'LINEチャネル'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Import Wizard */}
      <Suspense
        fallback={
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">読み込み中...</p>
              </div>
            </CardContent>
          </Card>
        }
      >
        <ImportWizard
          organizationId={data.organizationId}
          channelId={data.channelId}
        />
      </Suspense>
    </div>
  )
}
