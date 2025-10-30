'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrganizationId } from '@/lib/utils/organization'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const tagSchema = z.object({
  name: z.string().min(1, 'タグ名を入力してください').max(50, 'タグ名は50文字以内で入力してください'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '正しいカラーコードを入力してください'),
  description: z.string().max(200, '説明は200文字以内で入力してください').optional(),
})

export type TagFormData = z.infer<typeof tagSchema>

export async function getTags() {
  const supabase = await createClient()

  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('認証が必要です')
  }

  const { data, error} = await supabase
    .from('tags')
    .select(`
      *,
      friend_tags(id)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('タグ取得エラー:', error)
    throw new Error('タグの取得に失敗しました')
  }

  return data?.map(tag => ({
    ...tag,
    color: tag.color || '#6366F1',
    friend_count: Array.isArray(tag.friend_tags) ? tag.friend_tags.length : 0
  })) || []
}

export async function createTag(formData: TagFormData) {
  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('認証が必要です')
  }

  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('組織が見つかりません')
  }

  const validatedData = tagSchema.parse(formData)

  // Insert tag with explicit organization_id
  const { data, error } = await supabase
    .from('tags')
    .insert({
      name: validatedData.name,
      color: validatedData.color,
      description: validatedData.description || null,
      organization_id: organizationId,
    })
    .select()
    .single()

  if (error) {
    console.error('タグ作成エラー:', error)
    throw new Error(`タグの作成に失敗しました: ${error.message}`)
  }

  revalidatePath('/dashboard/friends/tags')
  return data
}

export async function updateTag(id: string, formData: TagFormData) {
  const supabase = await createClient()

  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('認証が必要です')
  }

  const validatedData = tagSchema.parse(formData)

  const { data, error } = await supabase
    .from('tags')
    .update(validatedData)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('タグ更新エラー:', error)
    throw new Error('タグの更新に失敗しました')
  }

  revalidatePath('/dashboard/friends/tags')
  return data
}

export async function deleteTag(id: string) {
  const supabase = await createClient()

  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('認証が必要です')
  }

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('タグ削除エラー:', error)
    throw new Error('タグの削除に失敗しました')
  }

  revalidatePath('/dashboard/friends/tags')
}
