'use client'

import {
  UserIcon,
  ChatBubbleLeftIcon,
  TagIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineFriend } from '@/types/friends'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'

interface FriendsTableProps {
  friends: LineFriend[]
}

export function FriendsTable({ friends }: FriendsTableProps) {
  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <UserIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">友だちが見つかりません</h3>
        <p className="text-muted-foreground text-sm">
          検索条件を変更するか、フィルターをリセットしてください
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">友だち</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>カスタムフィールド</TableHead>
            <TableHead>最終接触日</TableHead>
            <TableHead className="text-right">アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {friends.map((friend) => (
            <TableRow key={friend.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={friend.picture_url || undefined} />
                    <AvatarFallback>
                      <UserIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {friend.display_name || '名前未設定'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {friend.line_user_id}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    friend.status === 'active'
                      ? 'default'
                      : friend.status === 'blocked'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {friend.status === 'active'
                    ? 'アクティブ'
                    : friend.status === 'blocked'
                    ? 'ブロック'
                    : '配信停止'}
                </Badge>
              </TableCell>
              <TableCell>
                {friend.custom_fields && Object.keys(friend.custom_fields).length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(friend.custom_fields).slice(0, 2).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}: {String(value)}
                      </Badge>
                    ))}
                    {Object.keys(friend.custom_fields).length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{Object.keys(friend.custom_fields).length - 2}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                {friend.last_interaction_at ? (
                  <div className="flex items-center gap-1 text-sm">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDistanceToNow(new Date(friend.last_interaction_at), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <Link href={`/dashboard/chat?userId=${friend.line_user_id}`}>
                      <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                      チャット
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <Link href={`/dashboard/friends/${friend.id}`}>
                      <TagIcon className="h-4 w-4 mr-1" />
                      編集
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
