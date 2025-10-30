import { KeywordBuilder } from '@/components/auto-response/KeywordBuilder'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KeywordRuleFormData } from '@/types/auto-response'
import { getCurrentUserOrganizationId } from '@/lib/utils/organization'

export const metadata = {
  title: 'キーワード応答ルール作成 | L Message',
  description: '新しいキーワード応答ルールを作成',
}

async function createKeywordRule(formData: KeywordRuleFormData): Promise<void> {
  'use server'

  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // Create the rule in auto_response_rules with the correct schema
  const { data: rule, error: ruleError } = await supabase
    .from('auto_response_rules')
    .insert({
      organization_id: organizationId,
      name: formData.name,
      description: formData.description,
      trigger_type: 'keyword',
      trigger_keywords: formData.keywords.map(kw => kw.text),
      trigger_config: {
        keywords: formData.keywords,
        timeConditions: formData.timeConditions,
        friendConditions: formData.friendConditions,
        limitConditions: formData.limitConditions,
      },
      response_type: formData.response.type,
      response_content: formData.response,
      match_type: formData.keywords[0]?.matchType || 'partial',
      priority: formData.priority,
      is_active: formData.isActive,
    } as any)
    .select()
    .single()

  if (ruleError) {
    throw new Error(ruleError.message)
  }
}

export default async function NewKeywordRulePage() {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Fetch tags
  const { data: tags } = await supabase
    .from('tags')
    .select('id, name, color')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true })

  // Fetch segments
  const { data: segments } = await supabase
    .from('segments')
    .select('id, name')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true })

  // Fetch message templates (if table exists)
  // const { data: templates } = await supabase
  //   .from('message_templates')
  //   .select('id, name, type')
  //   .eq('user_id', user.id)
  //   .order('name', { ascending: true })

  // Fetch step campaigns (if available)
  // const { data: stepCampaigns } = await supabase
  //   .from('step_campaigns')
  //   .select('id, name')
  //   .eq('user_id', user.id)
  //   .order('name', { ascending: true })

  const templates: Array<{ id: string; name: string; type: string }> = []

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
          templates={templates}
          stepCampaigns={[]}
          onSave={createKeywordRule}
        />
      </div>
    </div>
  )
}
