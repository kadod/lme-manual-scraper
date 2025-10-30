import { Metadata } from 'next'
import { AutoResponseAnalyticsClient } from './AutoResponseAnalyticsClient'
import {
  AutoResponseStats,
  ResponseTrendData,
  RulePerformanceData,
  SuccessRateTrendData,
  ResponseLog,
  ActiveConversation,
} from '@/types/auto-response'

export const metadata: Metadata = {
  title: '自動応答分析・ログ | ダッシュボード',
  description: '自動応答のパフォーマンス分析とログ管理',
}

// Mock data generator functions
function generateMockStats(): AutoResponseStats {
  return {
    totalResponses: 1247,
    totalResponsesChange: 12.5,
    successRate: 94.3,
    successRateChange: 2.1,
    activeRules: 15,
    avgResponseTime: 185,
    avgResponseTimeChange: -8.3,
  }
}

function generateMockTrendData(): ResponseTrendData[] {
  const data: ResponseTrendData[] = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const total = Math.floor(Math.random() * 100) + 50
    const successful = Math.floor(total * (0.9 + Math.random() * 0.1))
    const failed = total - successful

    data.push({
      date: date.toISOString().split('T')[0],
      total_responses: total,
      successful,
      failed,
      keyword_responses: Math.floor(total * 0.4),
      regex_responses: Math.floor(total * 0.2),
      ai_responses: Math.floor(total * 0.25),
      scenario_responses: Math.floor(total * 0.15),
    })
  }

  return data
}

function generateMockRulePerformance(): RulePerformanceData[] {
  const ruleNames = [
    '営業時間案内',
    '商品問い合わせ',
    '予約受付',
    '配送状況確認',
    'FAQ自動応答',
    'クーポン配布',
    'サポート窓口',
    '新商品案内',
    'キャンペーン情報',
    '会員登録案内',
    '退会手続き',
    'パスワードリセット',
    '注文確認',
    'レビュー依頼',
    'アンケート配信',
  ]

  return ruleNames.map((name, index) => ({
    rule_id: `rule-${index + 1}`,
    rule_name: name,
    rule_type: ['keyword', 'regex', 'ai', 'scenario'][Math.floor(Math.random() * 4)] as any,
    response_count: Math.floor(Math.random() * 200) + 50,
    success_rate: 85 + Math.random() * 15,
    avg_response_time: 100 + Math.random() * 200,
  })).sort((a, b) => b.response_count - a.response_count)
}

function generateMockSuccessRateTrend(): SuccessRateTrendData[] {
  const data: SuccessRateTrendData[] = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const total = Math.floor(Math.random() * 100) + 50
    const successRate = 85 + Math.random() * 15

    data.push({
      date: date.toISOString().split('T')[0],
      success_rate: Math.round(successRate * 100) / 100,
      total_responses: total,
      successful_responses: Math.floor(total * (successRate / 100)),
    })
  }

  return data
}

function generateMockLogs(): ResponseLog[] {
  const logs: ResponseLog[] = []
  const friendNames = ['山田太郎', '佐藤花子', '鈴木一郎', '田中美咲', '伊藤健太']
  const ruleNames = ['営業時間案内', '商品問い合わせ', '予約受付', 'FAQ自動応答']
  const messages = [
    '営業時間を教えてください',
    '商品の在庫はありますか？',
    '予約したいです',
    '送料はいくらですか？',
    'キャンセル方法を教えてください',
  ]
  const responses = [
    '営業時間は平日10:00-18:00です。',
    '在庫状況を確認いたします。',
    '予約フォームをご案内します。',
    '送料は全国一律500円です。',
    'キャンセルはマイページから可能です。',
  ]

  for (let i = 0; i < 50; i++) {
    const date = new Date()
    date.setMinutes(date.getMinutes() - i * 15)

    logs.push({
      id: `log-${i + 1}`,
      user_id: 'user-123',
      friend_id: `friend-${Math.floor(Math.random() * 5) + 1}`,
      friend_name: friendNames[Math.floor(Math.random() * friendNames.length)],
      rule_id: `rule-${Math.floor(Math.random() * 4) + 1}`,
      rule_name: ruleNames[Math.floor(Math.random() * ruleNames.length)],
      rule_type: ['keyword', 'regex', 'ai', 'scenario'][Math.floor(Math.random() * 4)] as any,
      matched_keyword: Math.random() > 0.5 ? '営業時間' : null,
      received_message: messages[Math.floor(Math.random() * messages.length)],
      sent_response: responses[Math.floor(Math.random() * responses.length)],
      status: Math.random() > 0.1 ? 'success' : 'failed',
      response_time_ms: Math.floor(100 + Math.random() * 300),
      error_message: Math.random() > 0.9 ? 'タイムアウトエラーが発生しました' : null,
      executed_actions: Math.random() > 0.7 ? ['タグ追加: 問い合わせ済み', '通知送信'] : null,
      created_at: date.toISOString(),
    })
  }

  return logs
}

function generateMockConversations(): ActiveConversation[] {
  const conversations: ActiveConversation[] = []
  const friendNames = ['山田太郎', '佐藤花子', '鈴木一郎', '田中美咲', '伊藤健太']
  const scenarioNames = ['商品案内シナリオ', '新規登録フロー', 'サポート対応', 'アンケート配信']

  for (let i = 0; i < 8; i++) {
    const startDate = new Date()
    startDate.setHours(startDate.getHours() - Math.floor(Math.random() * 24))

    const lastInteraction = new Date(startDate)
    lastInteraction.setMinutes(lastInteraction.getMinutes() + Math.floor(Math.random() * 60))

    const expiresAt = new Date(startDate)
    expiresAt.setHours(expiresAt.getHours() + 48)

    const totalSteps = Math.floor(Math.random() * 5) + 3
    const currentStep = Math.floor(Math.random() * totalSteps) + 1

    const status: import('@/types/auto-response').ConversationStatus =
      currentStep >= totalSteps ? 'completed' : Math.random() > 0.2 ? 'active' : 'timeout'

    conversations.push({
      id: `conv-${i + 1}`,
      user_id: 'user-123',
      friend_id: `friend-${i + 1}`,
      friend_name: friendNames[Math.floor(Math.random() * friendNames.length)],
      scenario_id: `scenario-${Math.floor(Math.random() * 4) + 1}`,
      scenario_name: scenarioNames[Math.floor(Math.random() * scenarioNames.length)],
      current_step: currentStep,
      total_steps: totalSteps,
      status: status,
      started_at: startDate.toISOString(),
      last_interaction_at: lastInteraction.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
  }

  return conversations
}

export default async function AutoResponseAnalyticsPage() {
  // In production, fetch from database/API
  const stats = generateMockStats()
  const trendData = generateMockTrendData()
  const rulePerformance = generateMockRulePerformance()
  const successRateTrend = generateMockSuccessRateTrend()
  const logs = generateMockLogs()
  const conversations = generateMockConversations()

  return (
    <AutoResponseAnalyticsClient
      initialStats={stats}
      initialTrendData={trendData}
      initialRulePerformance={rulePerformance}
      initialSuccessRateTrend={successRateTrend}
      initialLogs={logs}
      initialConversations={conversations}
    />
  )
}
