'use client'

import { useState, useEffect } from 'react'
import { CurrentPlanCard } from '@/components/settings/CurrentPlanCard'
import { UsageMeters } from '@/components/settings/UsageMeters'
import { PlanComparisonCards } from '@/components/settings/PlanComparisonCards'
import { PaymentMethodsList } from '@/components/settings/PaymentMethodsList'
import { InvoicesList } from '@/components/settings/InvoicesList'
import { AddPaymentMethodDialog } from '@/components/settings/AddPaymentMethodDialog'
import { UpgradePlanDialog } from '@/components/settings/UpgradePlanDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Subscription {
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'paused'
  currentPeriodEnd?: string
  trialEnd?: string
  cancelAtPeriodEnd?: boolean
  usage: {
    friends: number
    messages_this_month: number
    staff_accounts: number
    forms: number
    rich_menus: number
    api_calls_today: number
  }
  limits: {
    friends: number
    messages_per_month: number
    staff_accounts: number
    forms: number
    rich_menus: number
    api_calls_per_day: number
  }
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account'
  cardBrand?: string
  cardLast4?: string
  cardExpMonth?: number
  cardExpYear?: number
  bankName?: string
  bankLast4?: string
  isDefault: boolean
}

interface Invoice {
  id: string
  periodStart: string
  periodEnd: string
  amountTotal: number
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  paid: boolean
  paidAt?: string
  invoicePdfUrl?: string
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [targetPlan, setTargetPlan] = useState<'free' | 'pro' | 'enterprise'>('pro')
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Fetch subscription data
  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      // Fetch subscription
      const subResponse = await fetch('/api/billing/subscription')
      const subData = await subResponse.json()
      setSubscription(subData)

      // Fetch payment methods
      const pmResponse = await fetch('/api/billing/payment-methods')
      const pmData = await pmResponse.json()
      setPaymentMethods(pmData)

      // Fetch invoices
      const invResponse = await fetch('/api/billing/invoices')
      const invData = await invResponse.json()
      setInvoices(invData)
    } catch (error) {
      console.error('Failed to fetch subscription data:', error)
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradePlan = (plan: 'free' | 'pro' | 'enterprise') => {
    setTargetPlan(plan)
    setShowUpgradeDialog(true)
  }

  const confirmUpgrade = async () => {
    try {
      const response = await fetch('/api/billing/change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: targetPlan }),
      })

      if (!response.ok) {
        throw new Error('プランの変更に失敗しました')
      }

      toast.success('プランを変更しました')
      await fetchSubscriptionData()
    } catch (error) {
      toast.error('プランの変更に失敗しました')
      throw error
    }
  }

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('サブスクリプションのキャンセルに失敗しました')
      }

      toast.success('サブスクリプションをキャンセルしました')
      setShowCancelDialog(false)
      await fetchSubscriptionData()
    } catch (error) {
      toast.error('サブスクリプションのキャンセルに失敗しました')
    }
  }

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      const response = await fetch('/api/billing/set-default-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId: id }),
      })

      if (!response.ok) {
        throw new Error('デフォルトの支払い方法の設定に失敗しました')
      }

      toast.success('デフォルトの支払い方法を設定しました')
      await fetchSubscriptionData()
    } catch (error) {
      toast.error('デフォルトの支払い方法の設定に失敗しました')
    }
  }

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      const response = await fetch(`/api/billing/payment-methods/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('支払い方法の削除に失敗しました')
      }

      toast.success('支払い方法を削除しました')
      await fetchSubscriptionData()
    } catch (error) {
      toast.error('支払い方法の削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">サブスクリプション情報が見つかりません</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">プラン・請求</h1>
        <p className="text-gray-600 mt-2">
          サブスクリプション、支払い方法、請求履歴の管理
        </p>
      </div>

      {/* Current Plan & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentPlanCard
          plan={subscription.plan}
          status={subscription.status}
          currentPeriodEnd={subscription.currentPeriodEnd}
          trialEnd={subscription.trialEnd}
          cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
          onUpgrade={() => handleUpgradePlan('pro')}
          onCancel={() => setShowCancelDialog(true)}
        />
        <UsageMeters usage={subscription.usage} limits={subscription.limits} />
      </div>

      {/* Payment Methods */}
      <PaymentMethodsList
        paymentMethods={paymentMethods}
        onAddPaymentMethod={() => setShowAddPaymentMethod(true)}
        onSetDefault={handleSetDefaultPaymentMethod}
        onDelete={handleDeletePaymentMethod}
      />

      {/* Invoices */}
      <InvoicesList invoices={invoices} />

      {/* Plan Comparison */}
      <PlanComparisonCards
        currentPlan={subscription.plan}
        onSelectPlan={handleUpgradePlan}
      />

      {/* Dialogs */}
      <AddPaymentMethodDialog
        open={showAddPaymentMethod}
        onOpenChange={setShowAddPaymentMethod}
        onSuccess={() => {
          toast.success('支払い方法を追加しました')
          fetchSubscriptionData()
        }}
      />

      <UpgradePlanDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        currentPlan={subscription.plan}
        targetPlan={targetPlan}
        onConfirm={confirmUpgrade}
      />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>サブスクリプションをキャンセルしますか？</AlertDialogTitle>
            <AlertDialogDescription>
              サブスクリプションは現在の請求期間の終了時にキャンセルされます。
              期間終了まで引き続きサービスをご利用いただけます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>戻る</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-red-600 hover:bg-red-700"
            >
              キャンセルする
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
