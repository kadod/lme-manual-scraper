// Auto-Response Type Definitions

export type ResponseRuleType = 'keyword' | 'regex' | 'ai' | 'scenario'

export type ResponseStatus = 'success' | 'failed' | 'processing'

export type ConversationStatus = 'active' | 'completed' | 'expired' | 'abandoned'

// Dashboard Stats
export type AutoResponseStats = {
  totalResponses: number
  totalResponsesChange: number
  successRate: number
  successRateChange: number
  activeRules: number
  avgResponseTime: number
  avgResponseTimeChange: number
}

// Response Log
export type ResponseLog = {
  id: string
  user_id: string
  friend_id: string
  friend_name: string
  rule_id: string | null
  rule_name: string | null
  rule_type: ResponseRuleType
  matched_keyword: string | null
  received_message: string
  sent_response: string
  status: ResponseStatus
  response_time_ms: number
  error_message: string | null
  executed_actions: string[] | null
  created_at: string
}

// Response Trend Data
export type ResponseTrendData = {
  date: string
  total_responses: number
  successful: number
  failed: number
  keyword_responses: number
  regex_responses: number
  ai_responses: number
  scenario_responses: number
}

// Rule Performance Data
export type RulePerformanceData = {
  rule_id: string
  rule_name: string
  rule_type: ResponseRuleType
  response_count: number
  success_rate: number
  avg_response_time: number
}

// Success Rate Trend
export type SuccessRateTrendData = {
  date: string
  success_rate: number
  total_responses: number
  successful_responses: number
}

// Active Conversation
export type ActiveConversation = {
  id: string
  user_id: string
  friend_id: string
  friend_name: string
  scenario_id: string
  scenario_name: string
  current_step: number
  total_steps: number
  status: ConversationStatus
  started_at: string
  last_interaction_at: string
  expires_at: string | null
}

// Conversation History
export type ConversationHistory = {
  id: string
  conversation_id: string
  step_number: number
  step_name: string
  user_input: string | null
  system_response: string
  branch_taken: string | null
  created_at: string
}

// Conversation Detail
export type ConversationDetail = {
  conversation: ActiveConversation
  history: ConversationHistory[]
  scenario: {
    id: string
    name: string
    description: string | null
    steps: ScenarioStep[]
  }
}

export type ScenarioStep = {
  step_number: number
  name: string
  message: string
  branches: ScenarioBranch[]
}

export type ScenarioBranch = {
  condition: string
  next_step: number | null
  action: string | null
}

// Filter Options
export type ResponseLogFilters = {
  dateFrom?: string
  dateTo?: string
  ruleTypes?: ResponseRuleType[]
  status?: ResponseStatus[]
  friendTags?: string[]
  keyword?: string
}

// Export Options
export type ResponseLogExportFormat = 'csv' | 'pdf'

export type ResponseLogExportOptions = {
  format: ResponseLogExportFormat
  filters?: ResponseLogFilters
  includeDetails?: boolean
}

// Chart Data Types
export type ResponseChartData = {
  date: string
  value: number
  [key: string]: string | number
}

export type RuleChartData = {
  name: string
  value: number
  successRate: number
  avgTime: number
}

// Keyword Rule Types
export type MatchType = 'exact' | 'partial' | 'regex'

export interface Keyword {
  id: string
  text: string
  matchType: MatchType
}

export interface ResponseContent {
  type: 'text' | 'template' | 'flex'
  text?: string
  templateId?: string
  flexJson?: string
  variables?: Record<string, string>
}

export interface TimeCondition {
  days: number[]
  startTime: string
  endTime: string
}

export interface FriendCondition {
  tagIds: string[]
  segmentIds: string[]
  customFields: Record<string, any>
}

export interface LimitCondition {
  perUser?: number
  total?: number
  period?: 'day' | 'week' | 'month'
}

export interface ActionConfig {
  type: 'tag' | 'segment' | 'step' | 'notify'
  tagIds?: string[]
  segmentId?: string
  stepCampaignId?: string
  notificationText?: string
}

export interface KeywordRule {
  id?: string
  user_id: string
  name: string
  description: string | null
  priority: number
  keywords: Keyword[]
  response: ResponseContent
  timeConditions?: TimeCondition[]
  friendConditions?: FriendCondition
  limitConditions?: LimitCondition
  actions?: ActionConfig[]
  isActive: boolean
  validUntil: string | null
  createdAt?: string
  updatedAt?: string
}

export interface KeywordRuleFormData {
  name: string
  description: string | null
  priority: number
  keywords: Keyword[]
  response: ResponseContent
  timeConditions?: TimeCondition[]
  friendConditions?: FriendCondition
  limitConditions?: LimitCondition
  actions?: ActionConfig[]
  isActive: boolean
  validUntil: string | null
}
