'use client'

import { MessageType } from './MessageTypeSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCircleIcon } from '@heroicons/react/24/solid'

interface MessagePreviewProps {
  type: MessageType
  content: string
  mediaUrl?: string | null
  title?: string
}

export function MessagePreview({ type, content, mediaUrl, title }: MessagePreviewProps) {
  // 変数を置き換える
  const processedContent = content
    .replace(/{name}/g, '田中太郎')
    .replace(/{custom_field}/g, 'カスタム値')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">プレビュー</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-b from-[#06C755]/10 to-background p-4 rounded-lg">
          {/* LINEスタイルのプレビュー */}
          <div className="max-w-sm mx-auto space-y-4">
            {/* ヘッダー */}
            <div className="flex items-center gap-2 px-2">
              <div className="h-8 w-8 rounded-full bg-[#06C755] flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium">{title || 'L Message'}</div>
                <div className="text-xs text-muted-foreground">公式アカウント</div>
              </div>
            </div>

            {/* メッセージ吹き出し */}
            <div className="flex">
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none shadow-sm p-3 max-w-[80%]">
                {type === 'text' && (
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {processedContent || 'メッセージを入力してください'}
                  </div>
                )}

                {(type === 'image' || type === 'video') && (
                  <div className="space-y-2">
                    {mediaUrl ? (
                      type === 'image' ? (
                        <img
                          src={mediaUrl}
                          alt="Message"
                          className="rounded-lg w-full"
                        />
                      ) : (
                        <video
                          src={mediaUrl}
                          controls
                          className="rounded-lg w-full"
                        />
                      )
                    ) : (
                      <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">
                          {type === 'image' ? '画像' : '動画'}をアップロードしてください
                        </span>
                      </div>
                    )}
                    {content && (
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {processedContent}
                      </div>
                    )}
                  </div>
                )}

                {type === 'flex' && (
                  <div className="text-sm text-muted-foreground italic">
                    Flex Messageのプレビューは送信時に表示されます
                  </div>
                )}

                {type === 'carousel' && (
                  <div className="text-sm text-muted-foreground italic">
                    カルーセルメッセージのプレビューは送信時に表示されます
                  </div>
                )}
              </div>
            </div>

            {/* タイムスタンプ */}
            <div className="text-xs text-muted-foreground text-right px-2">
              {new Date().toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
