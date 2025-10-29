import { Message } from '@/app/actions/messages'

interface MessageStatsProps {
  stats: Message['stats']
}

export function MessageStats({ stats }: MessageStatsProps) {
  if (!stats) {
    return <span className="text-sm text-gray-400">-</span>
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">配信:</span>
        <span className="font-medium">{stats.total_recipients.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">送信:</span>
          <span className="font-medium">{stats.delivery_rate}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">開封:</span>
          <span className="font-medium">{stats.open_rate}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">クリック:</span>
          <span className="font-medium">{stats.click_rate}%</span>
        </div>
      </div>
    </div>
  )
}
