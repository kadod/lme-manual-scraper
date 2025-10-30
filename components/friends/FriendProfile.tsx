'use client'

import { useState } from 'react'
import { UserCircleIcon, CheckBadgeIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { updateFriendStatus } from '@/app/actions/friends'
import { useRouter } from 'next/navigation'

interface FriendProfileProps {
  friend: {
    id: string
    line_user_id: string
    display_name: string | null
    picture_url: string | null
    follow_status: string
    last_interaction_at: string | null
    first_followed_at: string
  }
}

export function FriendProfile({ friend }: FriendProfileProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    try {
      await updateFriendStatus(friend.id, newStatus)
      router.refresh()
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (followStatus: string) => {
    if (followStatus === 'blocked') {
      return (
        <Badge variant="destructive">
          <XCircleIcon className="h-3 w-3 mr-1" />
          ブロック済み
        </Badge>
      )
    }
    return (
      <Badge className="bg-green-500">
        <CheckBadgeIcon className="h-3 w-3 mr-1" />
        フォロー中
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircleIcon className="h-5 w-5" />
          プロフィール
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Name */}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={friend.picture_url || undefined} />
            <AvatarFallback className="text-2xl">
              {friend.display_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <h3 className="text-2xl font-bold">
              {friend.display_name || '名前未設定'}
            </h3>
            {getStatusBadge(friend.follow_status)}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">LINE ID</span>
            <span className="font-mono">{friend.line_user_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">友だち追加日</span>
            <span>
              {format(new Date(friend.first_followed_at), 'yyyy年MM月dd日', {
                locale: ja,
              })}
            </span>
          </div>
          {friend.last_interaction_at && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">最終アクティビティ</span>
              <span>
                {format(new Date(friend.last_interaction_at), 'yyyy年MM月dd日 HH:mm', {
                  locale: ja,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {friend.follow_status !== 'blocked' ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleStatusChange('blocked')}
              disabled={isLoading}
            >
              <XCircleIcon className="h-4 w-4 mr-2" />
              ブロック
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleStatusChange('active')}
              disabled={isLoading}
            >
              <CheckBadgeIcon className="h-4 w-4 mr-2" />
              ブロック解除
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
