'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricSelector } from './MetricSelector'
import { ScheduleEditor } from './ScheduleEditor'
import type { CustomReport, ReportFormat, ReportSchedule, ReportMetrics } from '@/types/custom-reports'
import { createCustomReport, updateCustomReport } from '@/app/actions/custom-reports'
import { toast } from 'sonner'

interface ReportBuilderProps {
  report?: CustomReport
  mode: 'create' | 'edit'
}

export function ReportBuilder({ report, mode }: ReportBuilderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: report?.name || '',
    description: report?.description || '',
    format: report?.format || ('pdf' as ReportFormat),
    status: report?.status || ('draft' as const),
    metrics: report?.metrics || {
      friends: false,
      messages: false,
      reservations: false,
      forms: false,
      urlTracking: false,
    },
    schedule: report?.schedule || null,
    dateRange: report?.dateRange || {
      start: null,
      end: null,
      preset: 'last30days' as const,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('レポート名を入力してください')
      return
    }

    const hasMetrics = Object.values(formData.metrics).some(Boolean)
    if (!hasMetrics) {
      toast.error('少なくとも1つの指標を選択してください')
      return
    }

    setLoading(true)
    try {
      if (mode === 'create') {
        await createCustomReport(formData)
        toast.success('レポートを作成しました')
        router.push('/dashboard/analytics/reports')
      } else if (report) {
        await updateCustomReport(report.id, formData)
        toast.success('レポートを更新しました')
        router.push(`/dashboard/analytics/reports/${report.id}`)
      }
    } catch (error) {
      toast.error(mode === 'create' ? 'レポートの作成に失敗しました' : 'レポートの更新に失敗しました')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleMetricsChange = (metrics: ReportMetrics) => {
    setFormData({ ...formData, metrics })
  }

  const handleScheduleChange = (schedule: ReportSchedule | null) => {
    setFormData({ ...formData, schedule })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>レポートの名前と出力形式を設定します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">レポート名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="月次レポート"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="レポートの説明を入力してください"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">出力形式</Label>
              <Select
                value={formData.format}
                onValueChange={(value: ReportFormat) =>
                  setFormData({ ...formData, format: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preset">対象期間</Label>
              <Select
                value={formData.dateRange.preset}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    dateRange: { ...formData.dateRange, preset: value as any },
                  })
                }
                disabled={loading}
              >
                <SelectTrigger id="preset">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">過去7日間</SelectItem>
                  <SelectItem value="last30days">過去30日間</SelectItem>
                  <SelectItem value="lastMonth">先月</SelectItem>
                  <SelectItem value="custom">カスタム</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>含める指標</CardTitle>
          <CardDescription>レポートに含める統計情報を選択してください</CardDescription>
        </CardHeader>
        <CardContent>
          <MetricSelector
            metrics={formData.metrics}
            onChange={handleMetricsChange}
            disabled={loading}
          />
        </CardContent>
      </Card>

      <ScheduleEditor
        schedule={formData.schedule}
        onChange={handleScheduleChange}
        disabled={loading}
      />

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? '保存中...'
            : mode === 'create'
            ? 'レポートを作成'
            : 'レポートを更新'}
        </Button>
      </div>
    </form>
  )
}
