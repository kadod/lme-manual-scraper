# Auto-Response Server Actions Implementation

## Overview

Comprehensive Server Actions implementation for LINE bot auto-response functionality, including keyword rules, scenarios, AI configuration, conversation management, and analytics.

## Files Created/Updated

### 1. `/lme-saas/app/actions/auto-response.ts` (Enhanced)

Main auto-response rule management actions.

#### Rule Management

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `getAutoResponseRules` | Get all rules with filters | `filters?: AutoResponseFilters` | `Promise<AutoResponseRule[]>` |
| `getAutoResponseRule` | Get single rule by ID | `ruleId: string` | `Promise<AutoResponseRule>` |
| `createAutoResponseRule` | Create new rule | `rule: Partial<AutoResponseRule>` | `Promise<AutoResponseRule>` |
| `updateAutoResponseRule` | Update existing rule | `ruleId: string, updates: Partial<AutoResponseRule>` | `Promise<AutoResponseRule>` |
| `deleteAutoResponseRule` | Delete rule | `ruleId: string` | `Promise<{ success: boolean }>` |
| `duplicateAutoResponseRule` | Duplicate rule | `ruleId: string` | `Promise<AutoResponseRule>` |
| `toggleAutoResponseRuleStatus` | Toggle active/inactive | `ruleId: string` | `Promise<AutoResponseRule>` |
| `updateRulePriority` | Update rule priority | `ruleId: string, priority: number` | `Promise<AutoResponseRule>` |

#### Keyword Rules

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `createKeywordRule` | Create keyword-based rule | `data: Partial<KeywordRule>` | `Promise<AutoResponseRule>` |
| `updateKeywordRule` | Update keyword rule | `ruleId: string, data: Partial<KeywordRule>` | `Promise<AutoResponseRule>` |
| `testKeywordMatch` | Test keyword matching | `keyword: string, matchType: MatchType, testMessage: string` | `Promise<{ matches: boolean; error?: string }>` |

#### Scenario Rules

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `createScenario` | Create scenario-based rule | `data: { name, description?, steps, priority?, timeoutMinutes? }` | `Promise<AutoResponseRule>` |
| `updateScenario` | Update scenario | `scenarioId: string, data: Partial<{...}>` | `Promise<AutoResponseRule>` |
| `createScenarioStep` | Add step to scenario | `scenarioId: string, data: {...}` | `Promise<AutoResponseRule>` |
| `updateScenarioStep` | Update scenario step | `scenarioId: string, stepNumber: number, data: {...}` | `Promise<AutoResponseRule>` |
| `deleteScenarioStep` | Delete scenario step | `scenarioId: string, stepNumber: number` | `Promise<AutoResponseRule>` |
| `reorderScenarioSteps` | Reorder steps | `scenarioId: string, stepOrdering: Array<{...}>` | `Promise<AutoResponseRule>` |

#### AI Configuration

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `getAIConfig` | Get AI configuration | None | `Promise<AIConfig \| null>` |
| `updateAIConfig` | Update AI config | `data: { enabled?, model?, temperature?, ... }` | `Promise<AIConfig>` |
| `testAIResponse` | Test AI response | `message: string, context?: Record<string, any>` | `Promise<{ response, confidence, error? }>` |

#### Statistics & Logs

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `getAutoResponseStats` | Get overall statistics | None | `Promise<AutoResponseStats>` |
| `getResponseLogs` | Get response logs with filters | `filters?: ResponseLogFilters & { page?, limit? }` | `Promise<{ data, total, page, limit, totalPages }>` |
| `getConversationHistory` | Get friend conversation history | `friendId: string, limit?: number` | `Promise<ResponseLog[]>` |
| `getResponseTrendData` | Get trend data over time | `startDate?: string, endDate?: string` | `Promise<ResponseTrendData[]>` |
| `getRulePerformanceData` | Get rule performance stats | `limit?: number` | `Promise<RulePerformanceData[]>` |

### 2. `/lme-saas/app/actions/auto-response-conversations.ts` (New)

Conversation management actions for scenario-based interactions.

#### Conversation Management

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `getActiveConversations` | Get active conversations | `filters?: { friendId?, scenarioId?, status?, page?, limit? }` | `Promise<{ data, total, page, limit, totalPages }>` |
| `getConversation` | Get conversation with full history | `conversationId: string` | `Promise<ConversationDetail \| null>` |
| `endConversation` | Mark conversation as completed | `conversationId: string` | `Promise<ActiveConversation>` |
| `resetConversation` | Reset conversation to first step | `conversationId: string` | `Promise<ActiveConversation>` |
| `abandonConversation` | Mark conversation as abandoned | `conversationId: string` | `Promise<ActiveConversation>` |
| `deleteConversation` | Delete conversation and history | `conversationId: string` | `Promise<{ success: boolean }>` |
| `getConversationStats` | Get conversation statistics | `dateRange?: { startDate, endDate }` | `Promise<ConversationStats>` |
| `getConversationsByScenario` | Get conversations for scenario | `scenarioId: string, filters?: {...}` | `Promise<{ data, total, page, limit, totalPages }>` |
| `cleanupExpiredConversations` | Mark expired conversations | None | `Promise<{ expiredCount: number }>` |
| `exportConversationsToCSV` | Export conversations to CSV | `filters?: {...}` | `Promise<{ success, data?, filename?, error? }>` |

## Type Definitions

### Core Types (from `/lme-saas/types/auto-response.ts`)

```typescript
// Rule Types
type ResponseRuleType = 'keyword' | 'regex' | 'ai' | 'scenario'
type ResponseStatus = 'success' | 'failed' | 'processing'
type ConversationStatus = 'active' | 'completed' | 'expired' | 'abandoned'
type MatchType = 'exact' | 'partial' | 'regex'

// Main Interfaces
interface AutoResponseRule {
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

interface KeywordRule {
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

interface ActiveConversation {
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
```

## Database Schema Requirements

### Tables

#### auto_response_rules
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `name` (TEXT)
- `description` (TEXT, nullable)
- `rule_type` (TEXT: 'keyword' | 'scenario' | 'ai')
- `is_active` (BOOLEAN)
- `priority` (INTEGER)
- `conditions` (JSONB)
- `actions` (JSONB)
- `valid_from` (TIMESTAMPTZ, nullable)
- `valid_until` (TIMESTAMPTZ, nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### auto_response_logs
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `friend_id` (UUID, FK → friends)
- `rule_id` (UUID, FK → auto_response_rules, nullable)
- `rule_type` (TEXT)
- `user_message` (TEXT)
- `response_message` (TEXT)
- `response_sent` (BOOLEAN)
- `triggered_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

#### auto_response_conversations
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `friend_id` (UUID, FK → friends)
- `scenario_id` (UUID, FK → auto_response_rules)
- `current_step` (INTEGER)
- `total_steps` (INTEGER)
- `status` (TEXT: 'active' | 'completed' | 'expired' | 'abandoned')
- `started_at` (TIMESTAMPTZ)
- `last_interaction_at` (TIMESTAMPTZ)
- `expires_at` (TIMESTAMPTZ, nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### auto_response_conversation_history
- `id` (UUID, PK)
- `conversation_id` (UUID, FK → auto_response_conversations)
- `step_number` (INTEGER)
- `step_name` (TEXT)
- `user_input` (TEXT, nullable)
- `system_response` (TEXT)
- `branch_taken` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)

#### ai_response_config
- `id` (UUID, PK)
- `user_id` (UUID, FK → users, unique)
- `enabled` (BOOLEAN)
- `model` (TEXT)
- `temperature` (REAL)
- `max_tokens` (INTEGER)
- `system_prompt` (TEXT)
- `context_window` (INTEGER)
- `fallback_to_human` (BOOLEAN)
- `confidence_threshold` (REAL)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_auto_response_rules_user_id ON auto_response_rules(user_id);
CREATE INDEX idx_auto_response_rules_priority ON auto_response_rules(user_id, priority DESC);
CREATE INDEX idx_auto_response_logs_user_id ON auto_response_logs(user_id, triggered_at DESC);
CREATE INDEX idx_auto_response_logs_friend_id ON auto_response_logs(friend_id, triggered_at DESC);
CREATE INDEX idx_auto_response_conversations_user_id ON auto_response_conversations(user_id, status);
CREATE INDEX idx_auto_response_conversations_scenario ON auto_response_conversations(scenario_id, status);
```

### RLS Policies

All tables require RLS policies filtering by `user_id`:

```sql
-- Example for auto_response_rules
CREATE POLICY "Users can view own rules" ON auto_response_rules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rules" ON auto_response_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rules" ON auto_response_rules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rules" ON auto_response_rules
  FOR DELETE USING (auth.uid() = user_id);
```

## Usage Examples

### Creating a Keyword Rule

```typescript
import { createKeywordRule } from '@/app/actions/auto-response'

const rule = await createKeywordRule({
  name: 'Welcome Message',
  description: 'Send welcome message when user says hello',
  keywords: [
    { text: 'こんにちは', matchType: 'exact' },
    { text: 'hello', matchType: 'partial' },
  ],
  response: {
    type: 'text',
    text: 'こんにちは！いらっしゃいませ。',
  },
  priority: 100,
  isActive: true,
})
```

### Creating a Scenario

```typescript
import { createScenario } from '@/app/actions/auto-response'

const scenario = await createScenario({
  name: 'Reservation Flow',
  description: 'Guide user through reservation process',
  steps: [
    {
      stepNumber: 1,
      name: 'Ask Name',
      message: 'お名前を教えてください',
      branches: [
        {
          condition: 'any',
          nextStep: 2,
        },
      ],
    },
    {
      stepNumber: 2,
      name: 'Ask Date',
      message: 'ご希望の日時を教えてください',
      branches: [
        {
          condition: 'any',
          nextStep: null, // End scenario
        },
      ],
    },
  ],
  timeoutMinutes: 30,
  priority: 50,
})
```

### Getting Response Statistics

```typescript
import { getAutoResponseStats } from '@/app/actions/auto-response'

const stats = await getAutoResponseStats()
// Returns: { totalResponses, successRate, activeRules, avgResponseTime, ... }
```

### Managing Conversations

```typescript
import {
  getActiveConversations,
  getConversation,
  endConversation
} from '@/app/actions/auto-response-conversations'

// Get all active conversations
const { data: conversations } = await getActiveConversations({
  status: 'active',
  page: 1,
  limit: 20,
})

// Get conversation details
const detail = await getConversation(conversationId)

// End conversation
await endConversation(conversationId)
```

## Error Handling

All actions implement comprehensive error handling:

- **Authentication**: Throws `'User not authenticated'` if user is not logged in
- **Authorization**: Throws `'Rule not found'` if user doesn't own the resource
- **Validation**: Throws descriptive error messages for invalid input
- **Database Errors**: Logs errors to console and throws for upstream handling

## Security Considerations

1. **RLS Enforcement**: All database queries filtered by `user_id`
2. **Input Validation**: Helper functions validate all user input
3. **Error Messages**: Sanitized to prevent information leakage
4. **Authentication**: All actions require authenticated user
5. **Authorization**: User can only access their own resources

## Performance Optimizations

1. **Indexed Queries**: All common query patterns have database indexes
2. **Pagination**: Large result sets support pagination
3. **Selective Fetching**: Only necessary fields fetched in joins
4. **Caching**: Uses Next.js `revalidatePath` for cache management
5. **Bulk Operations**: Support for batch operations where applicable

## Next Steps

1. **Create Database Migrations**: Implement the schema in Supabase
2. **Add RLS Policies**: Set up Row Level Security policies
3. **Create UI Components**: Build dashboard interfaces using these actions
4. **Implement Webhook Handler**: Create LINE bot webhook processor
5. **Add Background Jobs**: Implement cron jobs for cleanup and aggregation
6. **Testing**: Add unit and integration tests
7. **AI Integration**: Connect actual AI service for AI responses

## Related Files

- `/lme-saas/types/auto-response.ts` - Type definitions
- `/lme-saas/app/actions/reservations.ts` - Reference implementation
- `/lme-saas/app/actions/custom-reports.ts` - Reference implementation
- `/lme-saas/lib/supabase/server.ts` - Supabase client configuration

## Implementation Status

- [x] Rule Management Actions
- [x] Keyword Rule Actions
- [x] Scenario Actions
- [x] AI Configuration Actions
- [x] Conversation Management Actions
- [x] Statistics & Logs Actions
- [x] Helper Functions
- [x] Type Definitions
- [x] Error Handling
- [ ] Database Migrations
- [ ] RLS Policies
- [ ] UI Components
- [ ] Webhook Handler
- [ ] Background Jobs
- [ ] Tests

---

**自動応答Server Actions作成完了**

All requested Server Actions have been implemented following the existing codebase patterns, with comprehensive functionality for rule management, keyword rules, scenarios, AI configuration, conversation management, and analytics.
