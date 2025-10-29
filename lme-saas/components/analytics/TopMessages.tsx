'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface TopMessage {
  id: string
  type: string
  content: any
  created_at: string
  sent_count: number
  delivered_count: number
  read_count: number
  click_count: number
  open_rate: number
  click_rate: number
}

interface TopMessagesProps {
  messages: TopMessage[]
}

function getMessagePreview(content: any, type: string): string {
  if (!content) return '-'

  switch (type) {
    case 'text':
      return content.text?.substring(0, 40) + (content.text?.length > 40 ? '...' : '') || '-'
    case 'image':
      return 'Image message'
    case 'video':
      return 'Video message'
    case 'flex':
      return 'Flex message'
    default:
      return type
  }
}

export function TopMessages({ messages }: TopMessagesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>人気メッセージ TOP5</CardTitle>
        <CardDescription>開封率の高いメッセージ</CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            データがありません
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>メッセージ</TableHead>
                <TableHead className="text-right">配信数</TableHead>
                <TableHead className="text-right">開封率</TableHead>
                <TableHead className="text-right">クリック率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message, index) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {getMessagePreview(message.content, message.type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {message.delivered_count.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {message.open_rate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                      {message.click_rate}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
