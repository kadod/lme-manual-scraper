'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const messageSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください').max(100, 'タイトルは100文字以内で入力してください'),
  type: z.enum(['text', 'image', 'video', 'flex', 'carousel'], {
    required_error: 'メッセージタイプを選択してください',
  }),
  content: z.string().min(1, 'メッセージ内容を入力してください'),
  media_url: z.string().url().optional().nullable(),
  flex_json: z.string().optional().nullable(),
  scheduled_at: z.string().datetime().optional().nullable(),
  target_type: z.enum(['all', 'segments', 'tags', 'manual']).default('all'),
  target_ids: z.array(z.string()).optional(),
  exclude_blocked: z.boolean().default(true),
  exclude_unsubscribed: z.boolean().default(true),
})

export type MessageFormData = z.infer<typeof messageSchema>

export async function getMessages() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('認証が必要です')
  }

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      message_segments(segment_id),
      message_tags(tag_id)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('メッセージ取得エラー:', error)
    throw new Error('メッセージの取得に失敗しました')
  }

  return data || []
}

export async function getMessage(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('認証が必要です')
  }

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      message_segments(segment_id, segments(name)),
      message_tags(tag_id, tags(name))
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('メッセージ取得エラー:', error)
    throw new Error('メッセージの取得に失敗しました')
  }

  return data
}

export async function createMessage(formData: MessageFormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('認証が必要です')
  }

  const validatedData = messageSchema.parse(formData)
  const { target_ids, ...messageData } = validatedData

  const { data, error } = await supabase
    .from('messages')
    .insert({
      ...messageData,
      user_id: user.id,
      status: validatedData.scheduled_at ? 'scheduled' : 'draft',
    })
    .select()
    .single()

  if (error) {
    console.error('メッセージ作成エラー:', error)
    throw new Error('メッセージの作成に失敗しました')
  }

  // ターゲット設定を保存
  if (target_ids && target_ids.length > 0) {
    if (validatedData.target_type === 'segments') {
      const segmentInserts = target_ids.map(segment_id => ({
        message_id: data.id,
        segment_id,
      }))
      await supabase.from('message_segments').insert(segmentInserts)
    } else if (validatedData.target_type === 'tags') {
      const tagInserts = target_ids.map(tag_id => ({
        message_id: data.id,
        tag_id,
      }))
      await supabase.from('message_tags').insert(tagInserts)
    } else if (validatedData.target_type === 'manual') {
      const friendInserts = target_ids.map(friend_id => ({
        message_id: data.id,
        friend_id,
      }))
      await supabase.from('message_friends').insert(friendInserts)
    }
  }

  revalidatePath('/dashboard/messages')
  return data
}

export async function updateMessage(id: string, formData: MessageFormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('認証が必要です')
  }

  const validatedData = messageSchema.parse(formData)
  const { target_ids, ...messageData } = validatedData

  const { data, error } = await supabase
    .from('messages')
    .update(messageData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('メッセージ更新エラー:', error)
    throw new Error('メッセージの更新に失敗しました')
  }

  // ターゲット設定を更新
  if (target_ids) {
    // 既存のターゲットを削除
    await supabase.from('message_segments').delete().eq('message_id', id)
    await supabase.from('message_tags').delete().eq('message_id', id)
    await supabase.from('message_friends').delete().eq('message_id', id)

    // 新しいターゲットを追加
    if (target_ids.length > 0) {
      if (validatedData.target_type === 'segments') {
        const segmentInserts = target_ids.map(segment_id => ({
          message_id: id,
          segment_id,
        }))
        await supabase.from('message_segments').insert(segmentInserts)
      } else if (validatedData.target_type === 'tags') {
        const tagInserts = target_ids.map(tag_id => ({
          message_id: id,
          tag_id,
        }))
        await supabase.from('message_tags').insert(tagInserts)
      } else if (validatedData.target_type === 'manual') {
        const friendInserts = target_ids.map(friend_id => ({
          message_id: id,
          friend_id,
        }))
        await supabase.from('message_friends').insert(friendInserts)
      }
    }
  }

  revalidatePath('/dashboard/messages')
  revalidatePath(`/dashboard/messages/${id}`)
  return data
}

export async function deleteMessage(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('認証が必要です')
  }

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('メッセージ削除エラー:', error)
    throw new Error('メッセージの削除に失敗しました')
  }

  revalidatePath('/dashboard/messages')
}

export async function scheduleMessage(id: string, scheduledAt: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('認証が必要です')
  }

  const { data, error } = await supabase
    .from('messages')
    .update({
      scheduled_at: scheduledAt,
      status: 'scheduled',
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('メッセージスケジュール設定エラー:', error)
    throw new Error('メッセージのスケジュール設定に失敗しました')
  }

  revalidatePath('/dashboard/messages')
  revalidatePath(`/dashboard/messages/${id}`)
  return data
}

export async function sendMessage(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('認証が必要です')
  }

  // メッセージを取得
  const { data: message, error: fetchError } = await supabase
    .from('messages')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !message) {
    throw new Error('メッセージが見つかりません')
  }

  // TODO: LINE Messaging APIを使用して実際にメッセージを送信
  // ここでは状態を更新するのみ

  const { data, error } = await supabase
    .from('messages')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('メッセージ送信エラー:', error)
    throw new Error('メッセージの送信に失敗しました')
  }

  revalidatePath('/dashboard/messages')
  revalidatePath(`/dashboard/messages/${id}`)
  return data
}

export async function uploadMessageMedia(file: File): Promise<string> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('認証が必要です')
  }

  // ファイル名を生成
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  // Supabase Storageにアップロード
  const { data, error } = await supabase.storage
    .from('message-media')
    .upload(fileName, file)

  if (error) {
    console.error('ファイルアップロードエラー:', error)
    throw new Error('ファイルのアップロードに失敗しました')
  }

  // 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from('message-media')
    .getPublicUrl(data.path)

  return publicUrl
}

export async function getTargetCount(
  targetType: 'all' | 'segments' | 'tags' | 'manual',
  targetIds?: string[],
  excludeBlocked: boolean = true,
  excludeUnsubscribed: boolean = true
): Promise<number> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('認証が必要です')
  }

  let query = supabase
    .from('friends')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (excludeBlocked) {
    query = query.eq('is_blocked', false)
  }

  if (excludeUnsubscribed) {
    query = query.eq('is_subscribed', true)
  }

  if (targetType === 'segments' && targetIds && targetIds.length > 0) {
    query = query.in('segment_id', targetIds)
  } else if (targetType === 'tags' && targetIds && targetIds.length > 0) {
    // タグの場合はJOINが必要
    const { count } = await supabase
      .from('friend_tags')
      .select('friend_id', { count: 'exact', head: true })
      .in('tag_id', targetIds)
    return count || 0
  } else if (targetType === 'manual' && targetIds && targetIds.length > 0) {
    query = query.in('id', targetIds)
  }

  const { count, error } = await query

  if (error) {
    console.error('ターゲット数取得エラー:', error)
    throw new Error('ターゲット数の取得に失敗しました')
  }

  return count || 0
}
