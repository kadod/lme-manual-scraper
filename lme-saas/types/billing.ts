/**
 * Billing and Subscription Type Definitions
 * Stripe integration types for subscription management
 */

export type PlanType = 'free' | 'pro' | 'enterprise'

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'cancelled'
  | 'paused'

export interface Subscription {
  id: string
  organization_id: string
  plan: PlanType
  status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  cancelled_at: string | null
  trial_start: string | null
  trial_end: string | null
  limits: PlanLimits
  usage: PlanUsage
  created_at: string
  updated_at: string
}

export interface PlanLimits {
  friends: number
  messages_per_month: number
  staff_accounts: number
  forms: number
  rich_menus: number
  api_calls_per_day: number
}

export interface PlanUsage {
  friends: number
  messages_this_month: number
  staff_accounts: number
  forms: number
  rich_menus: number
  api_calls_today: number
}

export interface UsageLimits {
  limits: PlanLimits
  usage: PlanUsage
  remaining: {
    friends: number
    messages_per_month: number
    staff_accounts: number
    forms: number
    rich_menus: number
    api_calls_per_day: number
  }
  percentages: {
    friends: number
    messages_per_month: number
    staff_accounts: number
    forms: number
    rich_menus: number
    api_calls_per_day: number
  }
}

export type PaymentMethodType = 'card' | 'bank_account'

export interface PaymentMethod {
  id: string
  organization_id: string
  stripe_payment_method_id: string
  type: PaymentMethodType
  is_default: boolean
  card_brand?: string | null
  card_last4?: string | null
  card_exp_month?: number | null
  card_exp_year?: number | null
  bank_name?: string | null
  bank_last4?: string | null
  created_at: string
  updated_at: string
}

export type InvoiceStatus =
  | 'draft'
  | 'open'
  | 'paid'
  | 'void'
  | 'uncollectible'

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_amount: number
  amount: number
}

export interface Invoice {
  id: string
  organization_id: string
  stripe_invoice_id: string | null
  amount_total: number
  amount_subtotal: number
  amount_tax: number
  currency: string
  status: InvoiceStatus
  period_start: string
  period_end: string
  paid: boolean
  paid_at: string | null
  payment_method_id: string | null
  invoice_pdf_url: string | null
  line_items: InvoiceLineItem[]
  created_at: string
  updated_at: string
}

export interface PlanFeatures {
  name: string
  price: number
  currency: string
  interval: 'month' | 'year'
  limits: PlanLimits
  features: string[]
  highlighted?: boolean
  popular?: boolean
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'jpy',
    interval: 'month',
    limits: {
      friends: 1000,
      messages_per_month: 5000,
      staff_accounts: 3,
      forms: 10,
      rich_menus: 5,
      api_calls_per_day: 1000
    },
    features: [
      '友だち数 1,000人まで',
      '月間配信数 5,000通',
      'スタッフアカウント 3名',
      'フォーム 10個',
      'リッチメニュー 5個',
      '基本分析機能',
      'コミュニティサポート'
    ]
  },
  pro: {
    name: 'Pro',
    price: 9800,
    currency: 'jpy',
    interval: 'month',
    limits: {
      friends: 10000,
      messages_per_month: 50000,
      staff_accounts: 10,
      forms: -1, // unlimited
      rich_menus: -1, // unlimited
      api_calls_per_day: 10000
    },
    features: [
      '友だち数 10,000人まで',
      '月間配信数 50,000通',
      'スタッフアカウント 10名',
      'フォーム 無制限',
      'リッチメニュー 無制限',
      '高度な分析機能',
      'API アクセス',
      '予約管理機能',
      '自動応答機能',
      'メールサポート'
    ],
    popular: true
  },
  enterprise: {
    name: 'Enterprise',
    price: 0, // カスタム価格
    currency: 'jpy',
    interval: 'month',
    limits: {
      friends: -1, // unlimited
      messages_per_month: -1, // unlimited
      staff_accounts: -1, // unlimited
      forms: -1, // unlimited
      rich_menus: -1, // unlimited
      api_calls_per_day: -1 // unlimited
    },
    features: [
      '友だち数 無制限',
      '月間配信数 無制限',
      'スタッフアカウント 無制限',
      'すべての機能',
      '専用サーバー',
      'カスタム統合',
      'SLA 保証',
      '専任サポート',
      'オンボーディング支援',
      'カスタム開発対応'
    ],
    highlighted: true
  }
}

export interface CheckoutSessionParams {
  plan: PlanType
  success_url: string
  cancel_url: string
}

export interface CreateCheckoutSessionResult {
  sessionId: string
  url: string
}

export interface ChangePlanParams {
  plan: PlanType
}

export interface AddPaymentMethodParams {
  payment_method_id: string
}

export interface SetDefaultPaymentMethodParams {
  payment_method_id: string
}

export interface RemovePaymentMethodParams {
  payment_method_id: string
}
