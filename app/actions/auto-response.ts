'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { KeywordRule, AutoResponseStats } from '@/types/auto-response'
import { getCurrentUserOrganizationId } from '@/lib/utils/organization'

export type AutoResponseRuleType = 'keyword' | 'scenario' | 'ai'
export type AutoResponseRuleStatus = 'active' | 'inactive'

// Updated to match actual Supabase database schema
export interface AutoResponseRule {
  id: string
  organization_id: string // Changed from user_id
  name: string
  description: string | null
  trigger_type: string // Maps to rule_type concept
  trigger_keywords: string[] | null
  trigger_config: any | null
  response_type: string
  response_content: any
  match_type: string | null
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AutoResponseFilters {
  type?: AutoResponseRuleType | 'all'
  status?: AutoResponseRuleStatus | 'expired' | 'all'
  search?: string
}

export async function getAutoResponseRules(filters?: AutoResponseFilters) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()
  let query = supabase
    .from('auto_response_rules')
    .select('*')
    .eq('organization_id', organizationId)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('trigger_type', filters.type)
  }

  if (filters?.status && filters.status !== 'all') {
    const isActive = filters.status === 'active'
    query = query.eq('is_active', isActive)
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching auto response rules:', error)
    throw error
  }

  return data as AutoResponseRule[]
}

export async function getAutoResponseRule(ruleId: string) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('auto_response_rules')
    .select('*')
    .eq('id', ruleId)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching auto response rule:', error)
    throw error
  }

  return data as AutoResponseRule
}

export async function createAutoResponseRule(rule: Partial<AutoResponseRule>) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('auto_response_rules')
    .insert({
      organization_id: organizationId,
      name: rule.name!,
      description: rule.description,
      trigger_type: rule.trigger_type || 'keyword',
      trigger_keywords: rule.trigger_keywords,
      trigger_config: rule.trigger_config,
      response_type: rule.response_type || 'text',
      response_content: rule.response_content,
      match_type: rule.match_type,
      is_active: rule.is_active !== undefined ? rule.is_active : true,
      priority: rule.priority || 0,
    } as any)
    .select()
    .single()

  if (error) {
    console.error('Error creating auto response rule:', error)
    throw error
  }

  revalidatePath('/dashboard/auto-response')
  return data as AutoResponseRule
}

export async function updateAutoResponseRule(
  ruleId: string,
  updates: Partial<AutoResponseRule>
) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data: rule } = await supabase
    .from('auto_response_rules')
    .select('id, organization_id')
    .eq('id', ruleId)
    .eq('organization_id', organizationId)
    .single()

  if (!rule) {
    throw new Error('Rule not found')
  }

  const { data, error } = await supabase
    .from('auto_response_rules')
    .update(updates)
    .eq('id', ruleId)
    .select()
    .single()

  if (error) {
    console.error('Error updating auto response rule:', error)
    throw error
  }

  revalidatePath('/dashboard/auto-response')
  return data as AutoResponseRule
}

export async function deleteAutoResponseRule(ruleId: string) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data: rule } = await supabase
    .from('auto_response_rules')
    .select('id, organization_id')
    .eq('id', ruleId)
    .eq('organization_id', organizationId)
    .single()

  if (!rule) {
    throw new Error('Rule not found')
  }

  const { error } = await supabase
    .from('auto_response_rules')
    .delete()
    .eq('id', ruleId)

  if (error) {
    console.error('Error deleting auto response rule:', error)
    throw error
  }

  revalidatePath('/dashboard/auto-response')
  return { success: true }
}

export async function duplicateAutoResponseRule(ruleId: string) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data: original, error: fetchError } = await supabase
    .from('auto_response_rules')
    .select('*')
    .eq('id', ruleId)
    .eq('organization_id', organizationId)
    .single()

  if (fetchError || !original) {
    throw new Error('Rule not found')
  }

  const { data: duplicate, error: insertError } = await supabase
    .from('auto_response_rules')
    .insert({
      organization_id: original.organization_id,
      name: `${original.name} (コピー)`,
      description: original.description,
      trigger_type: original.trigger_type,
      trigger_keywords: original.trigger_keywords,
      trigger_config: original.trigger_config,
      response_type: original.response_type,
      response_content: original.response_content,
      match_type: original.match_type,
      is_active: false,
      priority: original.priority,
    } as any)
    .select()
    .single()

  if (insertError) {
    console.error('Error duplicating auto response rule:', insertError)
    throw insertError
  }

  revalidatePath('/dashboard/auto-response')
  return duplicate as AutoResponseRule
}

export async function toggleAutoResponseRuleStatus(ruleId: string) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data: rule } = await supabase
    .from('auto_response_rules')
    .select('id, organization_id, is_active')
    .eq('id', ruleId)
    .eq('organization_id', organizationId)
    .single()

  if (!rule) {
    throw new Error('Rule not found')
  }

  const { data, error } = await supabase
    .from('auto_response_rules')
    .update({ is_active: !rule.is_active })
    .eq('id', ruleId)
    .select()
    .single()

  if (error) {
    console.error('Error toggling rule status:', error)
    throw error
  }

  revalidatePath('/dashboard/auto-response')
  return data as AutoResponseRule
}

export async function updateRulePriority(ruleId: string, priority: number) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data: rule } = await supabase
    .from('auto_response_rules')
    .select('id, organization_id')
    .eq('id', ruleId)
    .eq('organization_id', organizationId)
    .single()

  if (!rule) {
    throw new Error('Rule not found')
  }

  const { data, error } = await supabase
    .from('auto_response_rules')
    .update({ priority })
    .eq('id', ruleId)
    .select()
    .single()

  if (error) {
    console.error('Error updating rule priority:', error)
    throw error
  }

  revalidatePath('/dashboard/auto-response')
  return data as AutoResponseRule
}

export async function getAutoResponseStats() {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data: rules, error: rulesError } = await supabase
    .from('auto_response_rules')
    .select('id, is_active')
    .eq('organization_id', organizationId)

  if (rulesError) {
    console.error('Error fetching rules for stats:', rulesError)
    throw rulesError
  }

  const totalRules = rules?.length || 0
  const activeRules = rules?.filter(r => r.is_active).length || 0

  // Note: auto_response_logs table does not exist in schema
  // Returning basic stats based on rules only
  const stats: AutoResponseStats = {
    totalResponses: 0,
    totalResponsesChange: 0,
    successRate: 0,
    successRateChange: 0,
    activeRules,
    avgResponseTime: 0,
    avgResponseTimeChange: 0,
  }

  return stats
}

// ============================================================================
// Keyword-specific Actions
// ============================================================================

import type {
  MatchType,
  ResponseTrendData,
  RulePerformanceData,
  ResponseLogFilters,
  ResponseLog,
} from '@/types/auto-response'

/**
 * Create a keyword-based response rule
 */
export async function createKeywordRule(data: Partial<KeywordRule>) {
  validateKeywordRule(data)

  return createAutoResponseRule({
    name: data.name!,
    description: data.description,
    trigger_type: 'keyword',
    trigger_keywords: data.keywords?.map(k => k.text) || [],
    trigger_config: {
      keywords: data.keywords,
      timeConditions: data.timeConditions || [],
      friendConditions: data.friendConditions || {},
      limitConditions: data.limitConditions || {},
    },
    response_type: data.response?.type || 'text',
    response_content: data.response,
    match_type: data.keywords?.[0]?.matchType || 'partial',
    is_active: data.isActive !== false,
    priority: data.priority || 0,
  })
}

/**
 * Update a keyword-based response rule
 */
export async function updateKeywordRule(
  ruleId: string,
  data: Partial<KeywordRule>
) {
  const existing = await getAutoResponseRule(ruleId)

  if (existing.trigger_type !== 'keyword') {
    throw new Error('Rule is not a keyword rule')
  }

  const updates: Partial<AutoResponseRule> = {}

  if (data.name) updates.name = data.name
  if (data.description !== undefined) updates.description = data.description
  if (data.priority !== undefined) updates.priority = data.priority
  if (data.isActive !== undefined) updates.is_active = data.isActive

  if (data.keywords) {
    updates.trigger_keywords = data.keywords.map(k => k.text)
    updates.match_type = data.keywords[0]?.matchType || 'partial'
  }

  if (
    data.keywords ||
    data.timeConditions ||
    data.friendConditions ||
    data.limitConditions
  ) {
    const existingConfig = existing.trigger_config || {}
    updates.trigger_config = {
      ...existingConfig,
      ...(data.keywords && { keywords: data.keywords }),
      ...(data.timeConditions && { timeConditions: data.timeConditions }),
      ...(data.friendConditions && { friendConditions: data.friendConditions }),
      ...(data.limitConditions && { limitConditions: data.limitConditions }),
    }
  }

  if (data.response) {
    updates.response_type = data.response.type
    updates.response_content = data.response
  }

  return updateAutoResponseRule(ruleId, updates)
}

/**
 * Test keyword matching logic
 */
export async function testKeywordMatch(
  keyword: string,
  matchType: MatchType,
  testMessage: string
): Promise<{ matches: boolean; error?: string }> {
  try {
    let matches = false

    switch (matchType) {
      case 'exact':
        matches = testMessage.toLowerCase() === keyword.toLowerCase()
        break
      case 'partial':
        matches = testMessage.toLowerCase().includes(keyword.toLowerCase())
        break
      case 'regex':
        try {
          const regex = new RegExp(keyword, 'i')
          matches = regex.test(testMessage)
        } catch (regexError) {
          return {
            matches: false,
            error: 'Invalid regex pattern',
          }
        }
        break
    }

    return { matches }
  } catch (error) {
    return {
      matches: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// Scenario Actions
// ============================================================================

/**
 * Create a scenario-based response rule
 */
export async function createScenario(data: {
  name: string
  description?: string | null
  steps: any[]
  priority?: number
  timeoutMinutes?: number
}) {
  validateScenario(data)

  return createAutoResponseRule({
    name: data.name,
    description: data.description,
    trigger_type: 'scenario',
    trigger_config: {
      timeoutMinutes: data.timeoutMinutes || 30,
    },
    response_type: 'scenario',
    response_content: {
      steps: data.steps,
    },
    is_active: true,
    priority: data.priority || 0,
  })
}

/**
 * Update a scenario-based response rule
 */
export async function updateScenario(
  scenarioId: string,
  data: Partial<{
    name: string
    description: string | null
    steps: any[]
    priority: number
    timeoutMinutes: number
  }>
) {
  const existing = await getAutoResponseRule(scenarioId)

  if (existing.trigger_type !== 'scenario') {
    throw new Error('Rule is not a scenario')
  }

  const updates: Partial<AutoResponseRule> = {}

  if (data.name) updates.name = data.name
  if (data.description !== undefined) updates.description = data.description
  if (data.priority !== undefined) updates.priority = data.priority

  if (data.timeoutMinutes) {
    updates.trigger_config = {
      ...existing.trigger_config,
      timeoutMinutes: data.timeoutMinutes,
    }
  }

  if (data.steps) {
    updates.response_content = { steps: data.steps }
  }

  return updateAutoResponseRule(scenarioId, updates)
}

/**
 * Create a scenario step
 */
export async function createScenarioStep(
  scenarioId: string,
  data: {
    stepNumber: number
    name: string
    message: string
    branches?: any[]
  }
) {
  const rule = await getAutoResponseRule(scenarioId)

  if (rule.trigger_type !== 'scenario') {
    throw new Error('Rule is not a scenario')
  }

  const steps = rule.response_content?.steps || []
  steps.push(data)
  steps.sort((a: any, b: any) => a.stepNumber - b.stepNumber)

  return updateAutoResponseRule(scenarioId, {
    response_content: { steps },
  })
}

/**
 * Update a scenario step
 */
export async function updateScenarioStep(
  scenarioId: string,
  stepNumber: number,
  data: Partial<{
    name: string
    message: string
    branches: any[]
  }>
) {
  const rule = await getAutoResponseRule(scenarioId)

  if (rule.trigger_type !== 'scenario') {
    throw new Error('Rule is not a scenario')
  }

  const steps = rule.response_content?.steps || []
  const stepIndex = steps.findIndex((s: any) => s.stepNumber === stepNumber)

  if (stepIndex === -1) {
    throw new Error('Step not found')
  }

  steps[stepIndex] = { ...steps[stepIndex], ...data }

  return updateAutoResponseRule(scenarioId, {
    response_content: { steps },
  })
}

/**
 * Delete a scenario step
 */
export async function deleteScenarioStep(scenarioId: string, stepNumber: number) {
  const rule = await getAutoResponseRule(scenarioId)

  if (rule.trigger_type !== 'scenario') {
    throw new Error('Rule is not a scenario')
  }

  const steps = (rule.response_content?.steps || []).filter(
    (s: any) => s.stepNumber !== stepNumber
  )

  return updateAutoResponseRule(scenarioId, {
    response_content: { steps },
  })
}

/**
 * Reorder scenario steps
 */
export async function reorderScenarioSteps(
  scenarioId: string,
  stepOrdering: Array<{ oldNumber: number; newNumber: number }>
) {
  const rule = await getAutoResponseRule(scenarioId)

  if (rule.trigger_type !== 'scenario') {
    throw new Error('Rule is not a scenario')
  }

  const steps = rule.response_content?.steps || []

  stepOrdering.forEach(({ oldNumber, newNumber }) => {
    const step = steps.find((s: any) => s.stepNumber === oldNumber)
    if (step) {
      step.stepNumber = newNumber
    }
  })

  steps.sort((a: any, b: any) => a.stepNumber - b.stepNumber)

  return updateAutoResponseRule(scenarioId, {
    response_content: { steps },
  })
}

// ============================================================================
// AI Configuration
// ============================================================================

/**
 * Get AI response configuration
 * Note: ai_response_config table does not exist in current schema
 * This function returns null for now
 */
export async function getAIConfig() {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  // Return null since ai_response_config table doesn't exist
  return null
}

/**
 * Update AI response configuration
 * Note: ai_response_config table does not exist in current schema
 * This function throws an error for now
 */
export async function updateAIConfig(data: {
  enabled?: boolean
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  contextWindow?: number
  fallbackToHuman?: boolean
  confidenceThreshold?: number
}) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  // Throw error since ai_response_config table doesn't exist
  throw new Error('AI response configuration is not yet implemented')
}

/**
 * Test AI response with a sample message
 * Note: AI response feature is not yet implemented
 */
export async function testAIResponse(
  message: string,
  context?: Record<string, any>
): Promise<{ response: string; confidence: number; error?: string }> {
  return {
    response: '',
    confidence: 0,
    error: 'AI responses are not yet implemented',
  }
}

// ============================================================================
// Logs and Statistics
// ============================================================================

/**
 * Get response logs with filters
 * Note: auto_response_logs table does not exist in current schema
 * This function returns empty data for now
 */
export async function getResponseLogs(
  filters?: ResponseLogFilters & {
    page?: number
    limit?: number
  }
) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const page = filters?.page || 1
  const limit = filters?.limit || 50

  // Return empty data since auto_response_logs table doesn't exist
  return {
    data: [] as ResponseLog[],
    total: 0,
    page,
    limit,
    totalPages: 0,
  }
}

/**
 * Get conversation history for a specific friend
 * Note: auto_response_logs table does not exist in current schema
 * This function returns empty data for now
 */
export async function getConversationHistory(
  friendId: string,
  limit: number = 50
) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  // Return empty data since auto_response_logs table doesn't exist
  return []
}

/**
 * Get response trend data over time
 * Note: auto_response_logs table does not exist in current schema
 * This function returns empty data for now
 */
export async function getResponseTrendData(
  startDate?: string,
  endDate?: string
): Promise<ResponseTrendData[]> {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  // Return empty data since auto_response_logs table doesn't exist
  return []
}

/**
 * Get rule performance statistics
 * Note: auto_response_logs table does not exist in current schema
 * This function returns empty data for now
 */
export async function getRulePerformanceData(
  limit: number = 10
): Promise<RulePerformanceData[]> {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  // Return empty data since auto_response_logs table doesn't exist
  return []
}

// ============================================================================
// Helper Functions
// ============================================================================

function validateKeywordRule(data: any) {
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Rule name is required')
  }

  if (!data.keywords || data.keywords.length === 0) {
    throw new Error('At least one keyword is required')
  }

  data.keywords.forEach((keyword: any, index: number) => {
    if (!keyword.text || keyword.text.trim().length === 0) {
      throw new Error(`Keyword ${index + 1} text is required`)
    }

    if (keyword.matchType === 'regex') {
      try {
        new RegExp(keyword.text)
      } catch (error) {
        throw new Error(`Keyword ${index + 1} has invalid regex pattern`)
      }
    }
  })

  if (!data.response || !data.response.type) {
    throw new Error('Response configuration is required')
  }
}

function validateScenario(data: any) {
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Scenario name is required')
  }

  if (!data.steps || data.steps.length === 0) {
    throw new Error('At least one step is required')
  }

  data.steps.forEach((step: any, index: number) => {
    if (step.stepNumber === undefined) {
      throw new Error(`Step ${index + 1} must have a step number`)
    }

    if (!step.name || step.name.trim().length === 0) {
      throw new Error(`Step ${index + 1} must have a name`)
    }

    if (!step.message || step.message.trim().length === 0) {
      throw new Error(`Step ${index + 1} must have a message`)
    }
  })
}
