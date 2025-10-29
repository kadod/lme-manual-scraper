import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon, PencilIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CampaignFlowChart } from '@/components/messages/CampaignFlowChart'
import { CampaignStats } from '@/components/messages/CampaignStats'
import { SubscriberList } from '@/components/messages/SubscriberList'
import { createClient } from '@/lib/supabase/server'

interface CampaignDetailPageProps {
  params: Promise<{
    id: string
  }>
}

async function CampaignContent({ id }: { id: string }) {
  const supabase = await createClient()

  // Fetch campaign with steps
  const { data: campaign, error: campaignError } = await supabase
    .from('step_campaigns')
    .select(`
      *,
      step_campaign_steps (*)
    `)
    .eq('id', id)
    .single()

  if (campaignError || !campaign) {
    notFound()
  }

  // Fetch subscribers
  const { data: subscribers } = await supabase
    .from('step_campaign_logs')
    .select(`
      *,
      line_friend:line_friends (
        id,
        display_name,
        picture_url
      )
    `)
    .eq('step_campaign_id', id)
    .order('started_at', { ascending: false })
    .limit(50)

  const statusConfig = {
    draft: { label: '下書き', color: 'bg-gray-500' },
    active: { label: 'アクティブ', color: 'bg-green-500' },
    paused: { label: '一時停止', color: 'bg-yellow-500' },
    completed: { label: '完了', color: 'bg-blue-500' },
  }

  const status = statusConfig[campaign.status as keyof typeof statusConfig]

  // Transform steps for FlowChart
  const steps = campaign.step_campaign_steps.map((step: unknown) => ({
    ...step,
    id: (step as { id: string }).id,
  }))

  // Count subscribers by status
  const cancelledCount = subscribers?.filter(s => s.status === 'cancelled').length || 0

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/messages/step-campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold">{campaign.name}</h2>
              <Badge className={`${status.color} text-white`}>
                {status.label}
              </Badge>
            </div>
            {campaign.description && (
              <p className="text-muted-foreground mt-1">{campaign.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === 'active' && (
            <Button variant="outline">
              <PauseIcon className="h-4 w-4 mr-2" />
              一時停止
            </Button>
          )}
          {campaign.status === 'paused' && (
            <Button variant="outline">
              <PlayIcon className="h-4 w-4 mr-2" />
              再開
            </Button>
          )}
          <Link href={`/dashboard/messages/step-campaigns/${id}/edit`}>
            <Button>
              <PencilIcon className="h-4 w-4 mr-2" />
              編集
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="flow">フロー</TabsTrigger>
          <TabsTrigger value="subscribers">登録者</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <CampaignStats
            totalSubscribers={campaign.total_subscribers}
            activeSubscribers={campaign.active_subscribers}
            completedSubscribers={campaign.completed_subscribers}
            cancelledSubscribers={cancelledCount}
          />
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>配信フロー</CardTitle>
            </CardHeader>
            <CardContent>
              <CampaignFlowChart
                steps={steps}
                triggerType={campaign.trigger_type}
              />
            </CardContent>
          </Card>

          {/* Steps Detail */}
          <Card>
            <CardHeader>
              <CardTitle>ステップ詳細</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step: {
                  step_number: number
                  name: string
                  delay_value: number
                  delay_unit: string
                  message_type: string
                  message_content: { text?: string }
                }) => (
                  <div key={step.step_number} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                        {step.step_number}
                      </div>
                      <div>
                        <h4 className="font-semibold">{step.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {step.step_number === 1
                            ? 'トリガー直後'
                            : `${step.delay_value}${
                                step.delay_unit === 'minutes'
                                  ? '分'
                                  : step.delay_unit === 'hours'
                                  ? '時間'
                                  : '日'
                              }後`}
                          {' • '}
                          {step.message_type === 'text'
                            ? 'テキスト'
                            : step.message_type}
                        </p>
                      </div>
                    </div>
                    {step.message_type === 'text' && step.message_content.text && (
                      <p className="text-sm text-muted-foreground ml-11">
                        {step.message_content.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers">
          <SubscriberList
            subscribers={subscribers || []}
            totalSteps={steps.length}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CampaignLoading() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<CampaignLoading />}>
      <CampaignContent id={id} />
    </Suspense>
  )
}
