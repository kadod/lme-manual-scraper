import { KeywordBuilder } from '@/components/auto-response/KeywordBuilder'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { KeywordRuleFormData } from '@/types/auto-response'
import { getCurrentUserOrganizationId } from '@/lib/utils/organization'

export const metadata = {
  title: 'キーワード応答ルール編集 | L Message',
  description: 'キーワード応答ルールを編集',
}

async function updateKeywordRule(id: string, formData: KeywordRuleFormData) {
  'use server'

  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // Update the rule in auto_response_rules with the correct schema
  const { error: ruleError } = await supabase
    .from('auto_response_rules')
    .update({
      name: formData.name,
      description: formData.description,
      priority: formData.priority,
      is_active: formData.isActive,
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
    } as any)
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (ruleError) {
    throw new Error(ruleError.message)
  }
}

export default async function EditKeywordRulePage({
  params,
}: {
  params: { id: string }
}) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Fetch the rule from auto_response_rules
  const { data: rule, error } = await supabase
    .from('auto_response_rules')
    .select('*')
    .eq('id', params.id)
    .eq('organization_id', organizationId)
    .eq('trigger_type', 'keyword')
    .single()

  if (error || !rule) {
    notFound()
  }

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

  // Message templates (if table exists)
  const templates: Array<{ id: string; name: string; type: string }> = []

  // Get configuration from JSONB
  const triggerConfig = (rule.trigger_config as any) || {}
  const keywords = triggerConfig.keywords || []

  // Transform database data to form data
  const initialData: KeywordRuleFormData = {
    name: rule.name,
    description: rule.description || null,
    priority: rule.priority || 0,
    keywords: keywords.length > 0 ? keywords : [{ id: '1', text: '', matchType: 'partial' as const }],
    response: (rule.response_content as any) || { type: 'text', text: '' },
    timeConditions: triggerConfig.timeConditions || undefined,
    friendConditions: triggerConfig.friendConditions || undefined,
    limitConditions: triggerConfig.limitConditions || undefined,
    actions: undefined,
    isActive: rule.is_active || false,
    validUntil: null,
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
          templates={templates}
          stepCampaigns={[]}
          onSave={(formData) => updateKeywordRule(params.id, formData)}
        />
      </div>
    </div>
  )
}
