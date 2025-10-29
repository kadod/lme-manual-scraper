'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { KeywordRule, AutoResponseStats } from '@/types/auto-response'

export type AutoResponseRuleType = 'keyword' | 'scenario' | 'ai'
export type AutoResponseRuleStatus = 'active' | 'inactive'

export interface AutoResponseRule {
  id: string
  user_id: string
  name: string
  description: string | null
  rule_type: AutoResponseRuleType
  is_active: boolean
  priority: number
  conditions: any
  actions: any
  valid_from: string | null
  valid_until: string | null
  created_at: string
  updated_at: string
}

export interface AutoResponseFilters {
  type?: AutoResponseRuleType | 'all'
  status?: AutoResponseRuleStatus | 'expired' | 'all'
  search?: string
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

export async function getAutoResponseRules(filters?: AutoResponseFilters) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  let query = supabase
    .from('auto_response_rules')
    .select('*')
    .eq('user_id', userId)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('rule_type', filters.type)
  }

  if (filters?.status) {
    if (filters.status === 'expired') {
      const now = new Date().toISOString()
      query = query.not('valid_until', 'is', null).lt('valid_until', now)
    } else if (filters.status !== 'all') {
      const isActive = filters.status === 'active'
      query = query.eq('is_active', isActive)
    }
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
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('auto_response_rules')
    .select('*')
    .eq('id', ruleId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching auto response rule:', error)
    throw error
  }

  return data as AutoResponseRule
}

export async function createAutoResponseRule(rule: Partial<AutoResponseRule>) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('auto_response_rules')
    .insert({
      user_id: userId,
      name: rule.name,
      description: rule.description,
      rule_type: rule.rule_type,
      is_active: rule.is_active !== undefined ? rule.is_active : true,
      priority: rule.priority || 0,
      conditions: rule.conditions || {},
      actions: rule.actions || {},
      valid_from: rule.valid_from,
      valid_until: rule.valid_until,
    })
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
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: rule } = await supabase
    .from('auto_response_rules')
    .select('id, user_id')
    .eq('id', ruleId)
    .eq('user_id', userId)
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
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: rule } = await supabase
    .from('auto_response_rules')
    .select('id, user_id')
    .eq('id', ruleId)
    .eq('user_id', userId)
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
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: original, error: fetchError } = await supabase
    .from('auto_response_rules')
    .select('*')
    .eq('id', ruleId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !original) {
    throw new Error('Rule not found')
  }

  const { data: duplicate, error: insertError } = await supabase
    .from('auto_response_rules')
    .insert({
      user_id: original.user_id,
      name: `${original.name} (コピー)`,
      description: original.description,
      rule_type: original.rule_type,
      is_active: false,
      priority: original.priority,
      conditions: original.conditions,
      actions: original.actions,
      valid_from: original.valid_from,
      valid_until: original.valid_until,
    })
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
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: rule } = await supabase
    .from('auto_response_rules')
    .select('id, user_id, is_active')
    .eq('id', ruleId)
    .eq('user_id', userId)
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
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: rule } = await supabase
    .from('auto_response_rules')
    .select('id, user_id')
    .eq('id', ruleId)
    .eq('user_id', userId)
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
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: rules, error: rulesError } = await supabase
    .from('auto_response_rules')
    .select('id, is_active')
    .eq('user_id', userId)

  if (rulesError) {
    console.error('Error fetching rules for stats:', rulesError)
    throw rulesError
  }

  const totalRules = rules?.length || 0
  const activeRules = rules?.filter(r => r.is_active).length || 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Query logs using created_at and filter by rule_id to avoid user_id column issue
  const { data: todayLogs, error: logsError } = await supabase
    .from('auto_response_logs')
    .select('id, response_sent, success, rule_id')
    .gte('created_at', today.toISOString())
    .in(
      'rule_id',
      rules && rules.length > 0 ? rules.map(r => r.id) : ['00000000-0000-0000-0000-000000000000']
    )

  if (logsError) {
    console.error('Error fetching logs for stats:', logsError)
  }

  const todayTriggers = todayLogs?.length || 0
  // Check both response_sent and success fields for compatibility
  const todaySuccess = todayLogs?.filter(log => log.response_sent === true || log.success === true).length || 0

  const successRate = todayTriggers > 0 ? (todaySuccess / todayTriggers) * 100 : 0

  const stats: AutoResponseStats = {
    totalResponses: todayTriggers,
    totalResponsesChange: 0,
    successRate: Math.round(successRate * 10) / 10,
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
    rule_type: 'keyword',
    is_active: data.isActive !== false,
    priority: data.priority || 0,
    conditions: {
      keywords: data.keywords,
      timeConditions: data.timeConditions || [],
      friendConditions: data.friendConditions || {},
      limitConditions: data.limitConditions || {},
    },
    actions: {
      response: data.response,
      actions: data.actions || [],
    },
    valid_until: data.validUntil || null,
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

  if (existing.rule_type !== 'keyword') {
    throw new Error('Rule is not a keyword rule')
  }

  const updates: Partial<AutoResponseRule> = {}

  if (data.name) updates.name = data.name
  if (data.description !== undefined) updates.description = data.description
  if (data.priority !== undefined) updates.priority = data.priority
  if (data.isActive !== undefined) updates.is_active = data.isActive
  if (data.validUntil !== undefined) updates.valid_until = data.validUntil

  if (
    data.keywords ||
    data.timeConditions ||
    data.friendConditions ||
    data.limitConditions
  ) {
    updates.conditions = {
      ...existing.conditions,
      ...(data.keywords && { keywords: data.keywords }),
      ...(data.timeConditions && { timeConditions: data.timeConditions }),
      ...(data.friendConditions && { friendConditions: data.friendConditions }),
      ...(data.limitConditions && { limitConditions: data.limitConditions }),
    }
  }

  if (data.response || data.actions) {
    updates.actions = {
      ...existing.actions,
      ...(data.response && { response: data.response }),
      ...(data.actions && { actions: data.actions }),
    }
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
    rule_type: 'scenario',
    is_active: true,
    priority: data.priority || 0,
    conditions: {
      timeoutMinutes: data.timeoutMinutes || 30,
    },
    actions: {
      steps: data.steps,
    },
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

  if (existing.rule_type !== 'scenario') {
    throw new Error('Rule is not a scenario')
  }

  const updates: Partial<AutoResponseRule> = {}

  if (data.name) updates.name = data.name
  if (data.description !== undefined) updates.description = data.description
  if (data.priority !== undefined) updates.priority = data.priority

  if (data.timeoutMinutes) {
    updates.conditions = {
      ...existing.conditions,
      timeoutMinutes: data.timeoutMinutes,
    }
  }

  if (data.steps) {
    updates.actions = { steps: data.steps }
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

  if (rule.rule_type !== 'scenario') {
    throw new Error('Rule is not a scenario')
  }

  const steps = rule.actions?.steps || []
  steps.push(data)
  steps.sort((a: any, b: any) => a.stepNumber - b.stepNumber)

  return updateAutoResponseRule(scenarioId, {
    actions: { steps },
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

  if (rule.rule_type !== 'scenario') {
    throw new Error('Rule is not a scenario')
  }

  const steps = rule.actions?.steps || []
  const stepIndex = steps.findIndex((s: any) => s.stepNumber === stepNumber)

  if (stepIndex === -1) {
    throw new Error('Step not found')
  }

  steps[stepIndex] = { ...steps[stepIndex], ...data }

  return updateAutoResponseRule(scenarioId, {
    actions: { steps },
  })
}

/**
 * Delete a scenario step
 */
export async function deleteScenarioStep(scenarioId: string, stepNumber: number) {
  const rule = await getAutoResponseRule(scenarioId)

  if (rule.rule_type !== 'scenario') {
    throw new Error('Rule is not a scenario')
  }

  const steps = (rule.actions?.steps || []).filter(
    (s: any) => s.stepNumber !== stepNumber
  )

  return updateAutoResponseRule(scenarioId, {
    actions: { steps },
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

  if (rule.rule_type !== 'scenario') {
    throw new Error('Rule is not a scenario')
  }

  const steps = rule.actions?.steps || []

  stepOrdering.forEach(({ oldNumber, newNumber }) => {
    const step = steps.find((s: any) => s.stepNumber === oldNumber)
    if (step) {
      step.stepNumber = newNumber
    }
  })

  steps.sort((a: any, b: any) => a.stepNumber - b.stepNumber)

  return updateAutoResponseRule(scenarioId, {
    actions: { steps },
  })
}

// ============================================================================
// AI Configuration
// ============================================================================

/**
 * Get AI response configuration
 */
export async function getAIConfig() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ai_response_config')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching AI config:', error)
    throw error
  }

  return data || null
}

/**
 * Update AI response configuration
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
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('ai_response_config')
    .select('id')
    .eq('user_id', userId)
    .single()

  let result
  if (existing) {
    const { data: updated, error } = await supabase
      .from('ai_response_config')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating AI config:', error)
      throw error
    }
    result = updated
  } else {
    const { data: created, error } = await supabase
      .from('ai_response_config')
      .insert({
        user_id: userId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating AI config:', error)
      throw error
    }
    result = created
  }

  revalidatePath('/dashboard/auto-response/settings')
  return result
}

/**
 * Test AI response with a sample message
 */
export async function testAIResponse(
  message: string,
  context?: Record<string, any>
): Promise<{ response: string; confidence: number; error?: string }> {
  try {
    const config = await getAIConfig()
    if (!config || !config.enabled) {
      return {
        response: '',
        confidence: 0,
        error: 'AI responses are not enabled',
      }
    }

    // In production, integrate with OpenAI or other AI service
    // For now, return mock response
    return {
      response: `AI response to: "${message}"`,
      confidence: 0.85,
    }
  } catch (error) {
    return {
      response: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// Logs and Statistics
// ============================================================================

/**
 * Get response logs with filters
 */
export async function getResponseLogs(
  filters?: ResponseLogFilters & {
    page?: number
    limit?: number
  }
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  const page = filters?.page || 1
  const limit = filters?.limit || 50
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Get user's rule IDs first to filter logs
  const { data: userRules } = await supabase
    .from('auto_response_rules')
    .select('id')
    .eq('user_id', userId)

  const ruleIds = userRules?.map(r => r.id) || []

  let query = supabase
    .from('auto_response_logs')
    .select(
      `
      *,
      friend:friends (
        id,
        display_name
      ),
      rule:auto_response_rules!inner (
        id,
        name,
        rule_type,
        user_id
      )
    `,
      { count: 'exact' }
    )
    .in('rule_id', ruleIds.length > 0 ? ruleIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('rule.user_id', userId)

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }

  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }

  if (filters?.ruleTypes && filters.ruleTypes.length > 0) {
    query = query.in('rule.rule_type', filters.ruleTypes)
  }

  if (filters?.keyword) {
    query = query.or(
      `incoming_message.ilike.%${filters.keyword}%,trigger_message.ilike.%${filters.keyword}%`
    )
  }

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching response logs:', error)
    throw error
  }

  return {
    data: (data || []) as ResponseLog[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

/**
 * Get conversation history for a specific friend
 */
export async function getConversationHistory(
  friendId: string,
  limit: number = 50
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('auto_response_logs')
    .select(
      `
      *,
      rule:auto_response_rules!inner (
        id,
        name,
        rule_type,
        user_id
      )
    `
    )
    .eq('rule.user_id', userId)
    .eq('friend_id', friendId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching conversation history:', error)
    throw error
  }

  return data || []
}

/**
 * Get response trend data over time
 */
export async function getResponseTrendData(
  startDate?: string,
  endDate?: string
): Promise<ResponseTrendData[]> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Get user's rule IDs first
  const { data: userRules } = await supabase
    .from('auto_response_rules')
    .select('id, rule_type')
    .eq('user_id', userId)

  const ruleIds = userRules?.map(r => r.id) || []

  if (ruleIds.length === 0) {
    return []
  }

  let query = supabase
    .from('auto_response_logs')
    .select('*, rule:auto_response_rules!inner(rule_type)')
    .in('rule_id', ruleIds)

  if (startDate) {
    query = query.gte('created_at', startDate)
  }

  if (endDate) {
    query = query.lte('created_at', endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching response trend data:', error)
    throw error
  }

  const groupedData: Record<string, ResponseTrendData> = {}

  data?.forEach((log: any) => {
    const date = (log.created_at || log.sent_at).split('T')[0]

    if (!groupedData[date]) {
      groupedData[date] = {
        date,
        total_responses: 0,
        successful: 0,
        failed: 0,
        keyword_responses: 0,
        regex_responses: 0,
        ai_responses: 0,
        scenario_responses: 0,
      }
    }

    groupedData[date].total_responses++

    // Check multiple success indicators
    if (log.response_sent === true || log.success === true) {
      groupedData[date].successful++
    } else {
      groupedData[date].failed++
    }

    const ruleType = log.rule?.rule_type || log.match_type || 'keyword'
    if (ruleType === 'keyword') {
      groupedData[date].keyword_responses++
    } else if (ruleType === 'regex') {
      groupedData[date].regex_responses++
    } else if (ruleType === 'ai') {
      groupedData[date].ai_responses++
    } else if (ruleType === 'scenario') {
      groupedData[date].scenario_responses++
    }
  })

  return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get rule performance statistics
 */
export async function getRulePerformanceData(
  limit: number = 10
): Promise<RulePerformanceData[]> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Get user's rule IDs first
  const { data: userRules } = await supabase
    .from('auto_response_rules')
    .select('id')
    .eq('user_id', userId)

  const ruleIds = userRules?.map(r => r.id) || []

  if (ruleIds.length === 0) {
    return []
  }

  const { data: logs } = await supabase
    .from('auto_response_logs')
    .select(
      `
      rule_id,
      match_type,
      response_sent,
      success,
      rule:auto_response_rules!inner (
        name,
        rule_type
      )
    `
    )
    .in('rule_id', ruleIds)
    .not('rule_id', 'is', null)

  if (!logs) {
    return []
  }

  const groupedData: Record<
    string,
    {
      rule_id: string
      rule_name: string
      rule_type: string
      responses: Array<{ success: boolean }>
    }
  > = {}

  logs.forEach((log: any) => {
    if (!groupedData[log.rule_id]) {
      groupedData[log.rule_id] = {
        rule_id: log.rule_id,
        rule_name: log.rule?.name || 'Unknown',
        rule_type: log.rule?.rule_type || log.match_type || 'keyword',
        responses: [],
      }
    }

    groupedData[log.rule_id].responses.push({
      success: log.response_sent === true || log.success === true,
    })
  })

  const performanceData: RulePerformanceData[] = Object.values(groupedData).map(
    (rule) => {
      const totalResponses = rule.responses.length
      const successfulResponses = rule.responses.filter((r) => r.success).length

      return {
        rule_id: rule.rule_id,
        rule_name: rule.rule_name,
        rule_type: rule.rule_type as any,
        response_count: totalResponses,
        success_rate:
          totalResponses > 0 ? (successfulResponses / totalResponses) * 100 : 0,
        avg_response_time: 0,
      }
    }
  )

  return performanceData
    .sort((a, b) => b.response_count - a.response_count)
    .slice(0, limit)
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
