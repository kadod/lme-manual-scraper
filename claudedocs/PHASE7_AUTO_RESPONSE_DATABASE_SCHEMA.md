# Phase 7: Auto Response Database Schema Implementation

## Overview
Comprehensive database schema for automated LINE message response system supporting keyword-based, scenario-based, and AI-powered responses.

## Migration Files Created

### 1. Core Tables

#### 20251030_create_auto_response_rules.sql (2.7KB)
**Purpose**: Master rule configuration table
**Key Features**:
- Rule types: keyword, scenario, ai
- Priority-based execution (0-100)
- Active/inactive status with validity periods
- JSONB conditions for advanced filtering (time, tags, day of week)
- JSONB actions for extensible behavior

**Schema**:
```sql
CREATE TABLE auto_response_rules (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  description TEXT,
  rule_type VARCHAR(50) CHECK (rule_type IN ('keyword', 'scenario', 'ai')),
  priority INTEGER DEFAULT 0 CHECK (priority BETWEEN 0 AND 100),
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 20251030_create_auto_response_keywords.sql (2.6KB)
**Purpose**: Keyword-based response definitions
**Key Features**:
- Multiple match types: exact, partial, regex, prefix, suffix
- Case-sensitive/insensitive matching
- Response types: text, template, flex, image, video
- JSONB response content for flexibility
- Priority within rule for multi-keyword scenarios

**Schema**:
```sql
CREATE TABLE auto_response_keywords (
  id UUID PRIMARY KEY,
  rule_id UUID REFERENCES auto_response_rules(id),
  keyword TEXT NOT NULL,
  match_type VARCHAR(50) CHECK (match_type IN ('exact', 'partial', 'regex', 'prefix', 'suffix')),
  case_sensitive BOOLEAN DEFAULT false,
  response_type VARCHAR(50) CHECK (response_type IN ('text', 'template', 'flex', 'image', 'video')),
  response_content JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 20251030_create_auto_response_scenarios.sql (4.5KB)
**Purpose**: Multi-step conversation scenario management
**Key Features**:
- Entry keyword to trigger scenario
- Configurable timeout (up to 24 hours)
- Multi-step conversation flow
- Step types: message, question, branch, action, end
- Conditional navigation between steps
- Context variable storage

**Schema**:
```sql
CREATE TABLE auto_response_scenarios (
  id UUID PRIMARY KEY,
  rule_id UUID REFERENCES auto_response_rules(id),
  name VARCHAR(255),
  description TEXT,
  entry_keyword TEXT,
  timeout_minutes INTEGER DEFAULT 30 CHECK (timeout_minutes BETWEEN 1 AND 1440),
  allow_restart BOOLEAN DEFAULT true,
  completion_message JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE auto_response_scenario_steps (
  id UUID PRIMARY KEY,
  scenario_id UUID REFERENCES auto_response_scenarios(id),
  step_order INTEGER NOT NULL,
  step_type VARCHAR(50) CHECK (step_type IN ('message', 'question', 'branch', 'action', 'end')),
  content JSONB NOT NULL,
  next_step_conditions JSONB DEFAULT '{}',
  default_next_step_id UUID REFERENCES auto_response_scenario_steps(id),
  validation_rules JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (scenario_id, step_order)
);
```

#### 20251030_create_auto_response_conversations.sql (3.9KB)
**Purpose**: Active conversation state tracking
**Key Features**:
- Tracks current step in scenario
- Stores conversation context (user answers, variables)
- Step history with timestamps
- Automatic timeout calculation
- Status: active, completed, timeout, cancelled

**Schema**:
```sql
CREATE TABLE auto_response_conversations (
  id UUID PRIMARY KEY,
  friend_id UUID REFERENCES friends(id),
  scenario_id UUID REFERENCES auto_response_scenarios(id),
  current_step_id UUID REFERENCES auto_response_scenario_steps(id),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'timeout', 'cancelled')),
  context JSONB DEFAULT '{}',
  step_history JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT now(),
  last_interaction_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  timeout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (friend_id, scenario_id, status) WHERE status = 'active'
);
```

#### 20251030_create_auto_response_logs.sql (5.0KB)
**Purpose**: Audit trail and analytics
**Key Features**:
- Append-only log table
- Tracks all response activities
- Success/failure tracking with error messages
- Execution time metrics
- Daily aggregated statistics table

**Schema**:
```sql
CREATE TABLE auto_response_logs (
  id UUID PRIMARY KEY,
  rule_id UUID REFERENCES auto_response_rules(id),
  friend_id UUID REFERENCES friends(id),
  matched_keyword TEXT,
  match_type VARCHAR(50),
  incoming_message TEXT,
  response_type VARCHAR(50),
  response_sent JSONB,
  sent_at TIMESTAMPTZ DEFAULT now(),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  execution_time_ms INTEGER,
  conversation_id UUID REFERENCES auto_response_conversations(id),
  scenario_step_id UUID REFERENCES auto_response_scenario_steps(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE auto_response_stats (
  id UUID PRIMARY KEY,
  rule_id UUID REFERENCES auto_response_rules(id),
  date DATE NOT NULL,
  total_triggers INTEGER DEFAULT 0,
  successful_responses INTEGER DEFAULT 0,
  failed_responses INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  avg_execution_time_ms NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (rule_id, date)
);
```

### 2. Security & Access Control

#### 20251030_auto_response_rls.sql (11KB)
**Purpose**: Row-level security policies
**Key Features**:
- Multi-tenant data isolation by user_id
- Cascading permissions through foreign keys
- Append-only log enforcement
- System-level permissions for automation

**Policy Structure**:
- `auto_response_rules`: User-owned CRUD
- `auto_response_keywords`: Inherited from parent rule
- `auto_response_scenarios`: Inherited from parent rule
- `auto_response_scenario_steps`: Inherited from parent scenario
- `auto_response_conversations`: Friend-based access
- `auto_response_logs`: Read-only for users, write-only for system
- `auto_response_stats`: Read for users, full access for system

### 3. Performance Optimization

#### 20251030_auto_response_indexes.sql (7.3KB)
**Purpose**: Comprehensive indexing strategy
**Key Features**:
- 40+ optimized indexes
- Composite indexes for common query patterns
- Partial indexes for filtered queries
- GIN indexes for JSONB fields
- Covering indexes to avoid table lookups
- Text search indexes for keyword matching

**Index Categories**:
1. **Primary Lookups**: user_id, rule_id, friend_id
2. **Keyword Matching**: keyword text search, case-insensitive, trigram
3. **Scenario Navigation**: step_order, step_type, next_step
4. **Conversation State**: active conversations, timeout checks
5. **Analytics**: performance metrics, error tracking, usage stats
6. **JSONB Paths**: conditions, context, step history

**Notable Indexes**:
```sql
-- Active rule lookup with priority
CREATE INDEX idx_auto_response_rules_user_active_priority
  ON auto_response_rules(user_id, rule_type, priority DESC, is_active)
  WHERE is_active = true;

-- Timeout detection
CREATE INDEX idx_conversations_timeout_check
  ON auto_response_conversations(timeout_at, status)
  WHERE status = 'active' AND timeout_at < now();

-- Performance optimization detection
CREATE INDEX idx_logs_slow_responses
  ON auto_response_logs(rule_id, execution_time_ms DESC)
  WHERE execution_time_ms > 1000;
```

### 4. Helper Functions & Business Logic

#### 20251030_auto_response_helpers.sql (11KB)
**Purpose**: Reusable database functions
**Key Features**:
- Keyword matching engine
- Conversation state management
- Timeout processing
- Rule condition evaluation
- Performance analytics

**Functions**:

1. **match_keyword(message, keyword, match_type, case_sensitive)**: Boolean
   - Supports exact, partial, regex, prefix, suffix matching
   - Case-sensitive/insensitive handling

2. **find_matching_keywords(user_id, message)**: TABLE
   - Returns matching keywords with rule priority
   - Filters by active rules and validity period

3. **get_active_conversation(friend_id)**: TABLE
   - Retrieves active conversation if exists and not timed out
   - Returns full conversation state including context

4. **create_conversation(friend_id, scenario_id)**: UUID
   - Initializes new conversation
   - Sets to first step automatically

5. **update_conversation_step(conversation_id, answer, next_step_id)**: Boolean
   - Advances conversation to next step
   - Stores answer in context with variable name
   - Updates step history
   - Auto-completes on end step

6. **cancel_conversation(conversation_id)**: Boolean
   - Marks conversation as cancelled

7. **timeout_inactive_conversations()**: INTEGER
   - Processes all timed-out conversations
   - Returns count of timed-out conversations

8. **is_conversation_valid(conversation_id)**: Boolean
   - Checks if conversation is active and not timed out

9. **evaluate_rule_conditions(rule_id, friend_id, current_time)**: Boolean
   - Evaluates time_range conditions
   - Checks day_of_week restrictions
   - Validates friend tag requirements

10. **get_rule_performance(rule_id, start_date, end_date)**: TABLE
    - Returns aggregated performance metrics
    - Success rate, execution time, unique users

### 5. Automation & Cron Jobs

#### 20251030_auto_response_cron.sql (1.2KB)
**Purpose**: Scheduled maintenance tasks
**Key Features**:
- Daily statistics aggregation
- Automatic timeout processing
- Data cleanup

**Cron Jobs**:
```yaml
- name: timeout-inactive-conversations
  schedule: "*/5 * * * *"  # Every 5 minutes
  function: timeout_inactive_conversations

- name: aggregate-auto-response-stats
  schedule: "0 1 * * *"  # Daily at 1 AM
  function: aggregate_auto_response_stats
```

## Database Triggers

### Automatic Timestamp Management
- `auto_response_rules_updated_at`: Updates updated_at on row changes
- `auto_response_keywords_updated_at`: Updates updated_at on row changes
- `auto_response_scenarios_updated_at`: Updates updated_at on row changes
- `auto_response_scenario_steps_updated_at`: Updates updated_at on row changes
- `auto_response_conversations_updated_at`: Updates updated_at on row changes

### Business Logic Triggers
- `auto_response_conversations_timeout`: Calculates timeout_at based on scenario timeout_minutes

## Data Integrity Constraints

### Check Constraints
- `rule_type IN ('keyword', 'scenario', 'ai')`
- `priority BETWEEN 0 AND 100`
- `valid_until > valid_from`
- `match_type IN ('exact', 'partial', 'regex', 'prefix', 'suffix')`
- `response_type IN ('text', 'template', 'flex', 'image', 'video')`
- `timeout_minutes BETWEEN 1 AND 1440`
- `step_type IN ('message', 'question', 'branch', 'action', 'end')`
- `status IN ('active', 'completed', 'timeout', 'cancelled')`

### Unique Constraints
- `(scenario_id, step_order)`: Prevents duplicate step orders
- `(friend_id, scenario_id, status) WHERE status = 'active'`: One active conversation per scenario
- `(rule_id, date)`: One stats record per rule per day

### Foreign Key Cascades
- `auto_response_rules.user_id → users.id ON DELETE CASCADE`
- `auto_response_keywords.rule_id → auto_response_rules.id ON DELETE CASCADE`
- `auto_response_scenarios.rule_id → auto_response_rules.id ON DELETE CASCADE`
- `auto_response_scenario_steps.scenario_id → auto_response_scenarios.id ON DELETE CASCADE`
- `auto_response_conversations.friend_id → friends.id ON DELETE CASCADE`
- `auto_response_logs.rule_id → auto_response_rules.id ON DELETE SET NULL`

## Performance Characteristics

### Query Optimization
- **Keyword Lookup**: O(log n) with B-tree indexes + trigram search
- **Active Rule Retrieval**: Filtered index scan on active rules only
- **Conversation State**: Single-row lookup with covering index
- **Timeout Detection**: Index-only scan on timeout_at
- **Analytics Queries**: Pre-aggregated stats table for fast dashboards

### Scalability Considerations
- **Logs Table**: Consider partitioning by month for high-volume deployments
- **JSONB Queries**: GIN indexes enable efficient JSONB path queries
- **Statistics**: Daily aggregation prevents real-time calculation overhead
- **Covering Indexes**: Reduce table access for list views

## Usage Examples

### Creating a Keyword Rule
```sql
-- Create rule
INSERT INTO auto_response_rules (user_id, name, rule_type, priority, is_active)
VALUES (auth.uid(), 'Business Hours Greeting', 'keyword', 80, true)
RETURNING id;

-- Add keywords
INSERT INTO auto_response_keywords (rule_id, keyword, match_type, response_type, response_content)
VALUES
  (rule_id, 'hello', 'partial', 'text', '{"text": "Hello! How can I help you?"}'),
  (rule_id, 'hi', 'exact', 'text', '{"text": "Hi there! What can I do for you?"}');
```

### Creating a Scenario
```sql
-- Create scenario
INSERT INTO auto_response_scenarios (rule_id, name, entry_keyword, timeout_minutes)
VALUES (rule_id, 'Lead Qualification', 'interested', 30)
RETURNING id;

-- Add steps
INSERT INTO auto_response_scenario_steps (scenario_id, step_order, step_type, content)
VALUES
  (scenario_id, 0, 'question', '{"question": "What is your name?", "variable": "name"}'),
  (scenario_id, 1, 'question', '{"question": "What is your email?", "variable": "email"}'),
  (scenario_id, 2, 'message', '{"text": "Thank you {{name}}! We will contact you at {{email}}"}'),
  (scenario_id, 3, 'end', '{"text": "Goodbye!"}');
```

### Finding Matching Keywords
```sql
SELECT * FROM find_matching_keywords(auth.uid(), 'Hello, I need help');
```

### Managing Conversations
```sql
-- Start conversation
SELECT create_conversation(friend_id, scenario_id);

-- Get active conversation
SELECT * FROM get_active_conversation(friend_id);

-- Update to next step
SELECT update_conversation_step(conversation_id, 'John Doe', NULL);

-- Timeout inactive conversations
SELECT timeout_inactive_conversations();
```

### Performance Metrics
```sql
-- Get rule performance
SELECT * FROM get_rule_performance(rule_id, '2024-01-01', '2024-01-31');

-- Daily stats aggregation
SELECT aggregate_auto_response_stats('2024-01-15');
```

## Migration Order

Execute migrations in this order:
1. `20251030_create_auto_response_rules.sql`
2. `20251030_create_auto_response_keywords.sql`
3. `20251030_create_auto_response_scenarios.sql`
4. `20251030_create_auto_response_conversations.sql`
5. `20251030_create_auto_response_logs.sql`
6. `20251030_auto_response_rls.sql`
7. `20251030_auto_response_indexes.sql`
8. `20251030_auto_response_helpers.sql`
9. `20251030_auto_response_cron.sql` (optional, if using Supabase cron)

## Security Considerations

### Data Isolation
- All tables use user_id for multi-tenant isolation
- RLS policies enforce strict access control
- Foreign key relationships cascade permissions

### Audit Trail
- Append-only logs table for compliance
- No UPDATE or DELETE policies on logs
- Complete conversation history preservation

### Input Validation
- CHECK constraints on enums
- JSONB schema validation (application layer)
- Regex pattern validation for keyword matching

## Monitoring & Observability

### Key Metrics to Track
1. **Response Rate**: successful_responses / total_triggers
2. **Error Rate**: failed_responses / total_triggers
3. **Average Execution Time**: avg_execution_time_ms
4. **Conversation Completion Rate**: completed / (completed + timeout + cancelled)
5. **Timeout Rate**: timeout / total_conversations

### Alerting Thresholds
- Error rate > 5%
- Execution time > 1000ms
- Timeout rate > 20%
- Slow query detection via pg_stat_statements

## Future Enhancements

### Potential Improvements
1. **AI Integration**: OpenAI/Claude API for intelligent responses
2. **A/B Testing**: Multiple response variants with performance tracking
3. **Rich Media**: Image, video, audio response support
4. **Webhook Actions**: External system integration
5. **Sentiment Analysis**: Emotion detection in incoming messages
6. **Multi-language**: i18n support for responses
7. **Template Variables**: Dynamic content insertion
8. **Rate Limiting**: Per-user response throttling

### Schema Evolution
- Consider table partitioning for logs (monthly)
- Add materialized views for complex analytics
- Implement message queue for async processing
- Add Redis caching layer for hot paths

## Conclusion

This comprehensive database schema provides a robust foundation for automated LINE message responses with:
- Flexible rule-based matching
- Multi-step conversation flows
- Complete audit trail
- High-performance queries
- Secure multi-tenant access
- Extensible JSONB fields for future growth

Total Migration Size: ~48KB across 9 files
Estimated Migration Time: < 5 seconds on typical database
