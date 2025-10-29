'use client'

import { KPICard } from './KPICard'
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeOpenIcon,
  CursorArrowRaysIcon,
  CalendarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

export interface KPIData {
  totalFriends: number
  friendsChange: number
  messagesThisMonth: number
  messagesChange: number
  avgOpenRate: number
  openRateChange: number
  avgClickRate: number
  clickRateChange: number
  reservationsThisMonth: number
  reservationsChange: number
  formResponsesThisMonth: number
  formResponsesChange: number
}

interface KPIGridProps {
  data: KPIData
}

export function KPIGrid({ data }: KPIGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <KPICard
        title="友だち総数"
        value={data.totalFriends.toLocaleString()}
        change={data.friendsChange}
        icon={UsersIcon}
        colorScheme="blue"
      />
      <KPICard
        title="配信メッセージ数（今月）"
        value={data.messagesThisMonth.toLocaleString()}
        change={data.messagesChange}
        icon={ChatBubbleLeftRightIcon}
        colorScheme="green"
      />
      <KPICard
        title="平均開封率"
        value={`${data.avgOpenRate.toFixed(1)}%`}
        change={data.openRateChange}
        icon={EnvelopeOpenIcon}
        colorScheme="purple"
      />
      <KPICard
        title="平均クリック率"
        value={`${data.avgClickRate.toFixed(1)}%`}
        change={data.clickRateChange}
        icon={CursorArrowRaysIcon}
        colorScheme="orange"
      />
      <KPICard
        title="予約数（今月）"
        value={data.reservationsThisMonth.toLocaleString()}
        change={data.reservationsChange}
        icon={CalendarIcon}
        colorScheme="red"
      />
      <KPICard
        title="フォーム回答数（今月）"
        value={data.formResponsesThisMonth.toLocaleString()}
        change={data.formResponsesChange}
        icon={DocumentTextIcon}
        colorScheme="yellow"
      />
    </div>
  )
}
