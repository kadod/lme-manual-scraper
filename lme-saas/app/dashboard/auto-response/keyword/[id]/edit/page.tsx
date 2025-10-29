import { KeywordBuilder } from '@/components/auto-response/KeywordBuilder'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { KeywordRuleFormData } from '@/types/auto-response'

export const metadata = {
  title: 'キーワード応答ルール編集 | L Message',
  description: 'キーワード応答ルールを編集',
}

async function updateKeywordRule(id: string, formData: KeywordRuleFormData) {
  'use server'

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('認証が必要です')
  }

  const { error } = await supabase
    .from('keyword_rules')
    .update({
      name: formData.name,
      description: formData.description,
      priority: formData.priority,
      keywords: formData.keywords,
      response: formData.response,
      time_conditions: formData.timeConditions,
      friend_conditions: formData.friendConditions,
      limit_conditions: formData.limitConditions,
      actions: formData.actions,
      is_active: formData.isActive,
      valid_until: formData.validUntil,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }
}

export default async function EditKeywordRulePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the keyword rule
  const { data: rule, error } = await supabase
    .from('keyword_rules')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !rule) {
    notFound()
  }

  // Fetch tags
  const { data: tags } = await supabase
    .from('tags')
    .select('id, name, color')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  // Fetch segments
  const { data: segments } = await supabase
    .from('segments')
    .select('id, name')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  // Fetch message templates
  const { data: templates } = await supabase
    .from('message_templates')
    .select('id, name, type')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  // Transform database data to form data
  const initialData: KeywordRuleFormData = {
    name: rule.name,
    description: rule.description,
    priority: rule.priority,
    keywords: rule.keywords || [],
    response: rule.response || { type: 'text', text: '' },
    timeConditions: rule.time_conditions || undefined,
    friendConditions: rule.friend_conditions || undefined,
    limitConditions: rule.limit_conditions || undefined,
    actions: rule.actions || undefined,
    isActive: rule.is_active,
    validUntil: rule.valid_until,
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            キーワード応答ルール編集
          </h1>
          <p className="text-muted-foreground mt-2">
            キーワード応答ルールを編集します
          </p>
        </div>

        {/* Builder */}
        <KeywordBuilder
          initialData={initialData}
          tags={
            tags?.map((tag) => ({
              ...tag,
              color: tag.color || '#6366F1',
            })) || []
          }
          segments={segments || []}
          templates={templates || []}
          stepCampaigns={[]}
          onSave={(formData) => updateKeywordRule(params.id, formData)}
        />
      </div>
    </div>
  )
}
