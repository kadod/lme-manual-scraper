import { KeywordBuilder } from '@/components/auto-response/KeywordBuilder'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KeywordRuleFormData } from '@/types/auto-response'

export const metadata = {
  title: 'キーワード応答ルール作成 | L Message',
  description: '新しいキーワード応答ルールを作成',
}

async function createKeywordRule(formData: KeywordRuleFormData) {
  'use server'

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('認証が必要です')
  }

  const { error } = await supabase.from('keyword_rules').insert({
    user_id: user.id,
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
  })

  if (error) {
    throw new Error(error.message)
  }
}

export default async function NewKeywordRulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
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

  // Fetch step campaigns (if available)
  // const { data: stepCampaigns } = await supabase
  //   .from('step_campaigns')
  //   .select('id, name')
  //   .eq('user_id', user.id)
  //   .order('name', { ascending: true })

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            キーワード応答ルール作成
          </h1>
          <p className="text-muted-foreground mt-2">
            キーワードに反応する自動応答ルールを作成します
          </p>
        </div>

        {/* Builder */}
        <KeywordBuilder
          tags={
            tags?.map((tag) => ({
              ...tag,
              color: tag.color || '#6366F1',
            })) || []
          }
          segments={segments || []}
          templates={templates || []}
          stepCampaigns={[]}
          onSave={createKeywordRule}
        />
      </div>
    </div>
  )
}
