import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { FriendProfile } from '@/components/friends/FriendProfile'
import { CustomFieldsEditor } from '@/components/friends/CustomFieldsEditor'
import { TagSelector } from '@/components/friends/TagSelector'
import { MessageHistory } from '@/components/friends/MessageHistory'
import { ActionHistory } from '@/components/friends/ActionHistory'
import { FriendDetailSkeleton } from '@/components/friends/FriendDetailSkeleton'

interface FriendDetailPageProps {
  params: Promise<{
    id: string
  }>
}

async function FriendDetailContent({ friendId }: { friendId: string }) {
  const supabase = await createClient()

  // Fetch friend with tags
  const { data: friend, error: friendError } = await supabase
    .from('friends')
    .select(
      `
      *,
      friend_tags (
        tag:tags (
          id,
          name,
          color
        )
      )
    `
    )
    .eq('id', friendId)
    .single()

  if (friendError || !friend) {
    notFound()
  }

  // Transform the data to include tags array
  const friendWithTags = {
    ...friend,
    tags: (friend as any).friend_tags?.map((ft: any) => ft.tag) || [],
  }

  // Fetch all available tags for the tag selector
  const { data: allTags } = await supabase
    .from('tags')
    .select('id, name, color')
    .order('name')

  // Mock data for messages and actions (tables don't exist yet in the schema)
  const messages: any[] = []
  const actions: any[] = []

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left Column */}
      <div className="space-y-6">
        <FriendProfile friend={friendWithTags as any} />
        <CustomFieldsEditor friend={friendWithTags as any} />
        <TagSelector friend={friendWithTags as any} availableTags={allTags || []} />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <MessageHistory messages={messages} />
        <ActionHistory actions={actions} />
      </div>
    </div>
  )
}

export default async function FriendDetailPage({ params }: FriendDetailPageProps) {
  const { id } = await params

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/friends">
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">友だち詳細</h2>
          <p className="text-muted-foreground mt-1">
            友だちの情報とアクティビティを管理します
          </p>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<FriendDetailSkeleton />}>
        <FriendDetailContent friendId={id} />
      </Suspense>
    </div>
  )
}
