import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsPageClient } from './AnalyticsPageClient'
import {
  getDashboardStats,
  getFriendsTrend,
  getMessageStats,
  getEngagementRate,
  getTagDistribution,
  getDeviceBreakdown,
  getTopMessages,
  getTopUrls,
} from '@/app/actions/analytics'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get current date range (last 30 days)
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  // Fetch all analytics data in parallel
  const [
    dashboardStats,
    friendsTrend,
    messageStats,
    engagementRate,
    tagDistribution,
    deviceBreakdown,
    topMessages,
    topUrls,
  ] = await Promise.all([
    getDashboardStats(startDateStr, endDateStr),
    getFriendsTrend(startDateStr, endDateStr),
    getMessageStats(startDateStr, endDateStr),
    getEngagementRate(startDateStr, endDateStr),
    getTagDistribution(),
    getDeviceBreakdown(startDateStr, endDateStr),
    getTopMessages(5),
    getTopUrls(5),
  ])

  return (
    <AnalyticsPageClient
      initialStats={dashboardStats}
      initialFriendsTrend={friendsTrend}
      initialMessageStats={messageStats}
      initialEngagementRate={engagementRate}
      initialTagDistribution={tagDistribution}
      initialDeviceBreakdown={deviceBreakdown}
      initialTopMessages={topMessages}
      initialTopUrls={topUrls}
    />
  )
}
