'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Message = {
  id: string
  organization_id: string
  title: string
  type: 'text' | 'image' | 'video' | 'flex' | 'template'
  target_type: 'all' | 'segment' | 'tags'
  target_value: string | null
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'
  content: any
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
  stats?: {
    total_recipients: number
    sent_count: number
    delivered_count: number
    opened_count: number
    clicked_count: number
    delivery_rate: number
    open_rate: number
    click_rate: number
  }
}

export type MessageFilters = {
  status?: string
  type?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

async function getCurrentOrganizationId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // For now, return a mock organization ID
  // In production, this would query user_organizations table
  return '00000000-0000-0000-0000-000000000000'
}

export async function getMessages(filters?: MessageFilters) {
  const organizationId = await getCurrentOrganizationId()
  if (!organizationId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  let query = supabase
    .from('messages')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }

  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching messages:', error)
    throw error
  }

  // Fetch stats for each message
  const messagesWithStats = await Promise.all(
    (data || []).map(async (message) => {
      const stats = await getMessageStats(message.id)
      return {
        ...message,
        stats,
      }
    })
  )

  return messagesWithStats as Message[]
}

export async function getMessageStats(messageId: string) {
  const supabase = await createClient()

  const { data: recipients } = await supabase
    .from('message_recipients')
    .select('status')
    .eq('message_id', messageId)

  if (!recipients || recipients.length === 0) {
    return {
      total_recipients: 0,
      sent_count: 0,
      delivered_count: 0,
      opened_count: 0,
      clicked_count: 0,
      delivery_rate: 0,
      open_rate: 0,
      click_rate: 0,
    }
  }

  const total = recipients.length
  const sent = recipients.filter((r) => r.status === 'sent' || r.status === 'delivered').length
  const delivered = recipients.filter((r) => r.status === 'delivered').length
  const opened = Math.floor(delivered * 0.45) // Mock data
  const clicked = Math.floor(opened * 0.28) // Mock data

  return {
    total_recipients: total,
    sent_count: sent,
    delivered_count: delivered,
    opened_count: opened,
    clicked_count: clicked,
    delivery_rate: total > 0 ? Math.round((sent / total) * 100) : 0,
    open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
    click_rate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
  }
}

export async function deleteMessage(messageId: string) {
  const organizationId = await getCurrentOrganizationId()
  if (!organizationId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Check if message belongs to organization
  const { data: message } = await supabase
    .from('messages')
    .select('id, organization_id, status')
    .eq('id', messageId)
    .eq('organization_id', organizationId)
    .single()

  if (!message) {
    throw new Error('Message not found')
  }

  // Only allow deletion of draft messages
  if (message.status !== 'draft') {
    throw new Error('Only draft messages can be deleted')
  }

  const { error } = await supabase.from('messages').delete().eq('id', messageId)

  if (error) {
    console.error('Error deleting message:', error)
    throw error
  }

  revalidatePath('/dashboard/messages')
  return { success: true }
}

export async function duplicateMessage(messageId: string) {
  const organizationId = await getCurrentOrganizationId()
  if (!organizationId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Fetch original message
  const { data: original, error: fetchError } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .eq('organization_id', organizationId)
    .single()

  if (fetchError || !original) {
    throw new Error('Message not found')
  }

  // Create duplicate
  const { data: duplicate, error: insertError } = await supabase
    .from('messages')
    .insert({
      organization_id: original.organization_id,
      title: `${original.title} (コピー)`,
      type: original.type,
      target_type: original.target_type,
      target_value: original.target_value,
      content: original.content,
      status: 'draft',
      scheduled_at: null,
      sent_at: null,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error duplicating message:', insertError)
    throw insertError
  }

  revalidatePath('/dashboard/messages')
  return duplicate
}

export async function cancelMessage(messageId: string) {
  const organizationId = await getCurrentOrganizationId()
  if (!organizationId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: message } = await supabase
    .from('messages')
    .select('id, organization_id, status')
    .eq('id', messageId)
    .eq('organization_id', organizationId)
    .single()

  if (!message) {
    throw new Error('Message not found')
  }

  // Only scheduled messages can be cancelled
  if (message.status !== 'scheduled') {
    throw new Error('Only scheduled messages can be cancelled')
  }

  const { error } = await supabase
    .from('messages')
    .update({ status: 'cancelled' })
    .eq('id', messageId)

  if (error) {
    console.error('Error cancelling message:', error)
    throw error
  }

  revalidatePath('/dashboard/messages')
  return { success: true }
}
