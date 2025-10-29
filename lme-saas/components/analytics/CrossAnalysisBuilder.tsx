'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AxisSelector } from './AxisSelector'
import { CrossTable, CrossTableData } from './CrossTable'
import { HeatmapChart } from './HeatmapChart'
import { ScatterChart } from './ScatterChart'
import { AnalysisPresets, AnalysisPreset } from './AnalysisPresets'
import type { CrossAnalysisConfig, CrossAnalysisResult } from '@/types/analytics'
import {
  Squares2X2Icon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface CrossAnalysisBuilderProps {
  onAnalyze: (config: CrossAnalysisConfig) => Promise<CrossAnalysisResult>
}

export function CrossAnalysisBuilder({ onAnalyze }: CrossAnalysisBuilderProps) {
  const [xAxis, setXAxis] = useState<CrossAnalysisConfig['xAxis']>('date')
  const [yAxis, setYAxis] = useState<CrossAnalysisConfig['yAxis']>('friends')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState('all')
  const [result, setResult] = useState<CrossAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [presets, setPresets] = useState<AnalysisPreset[]>([])
  const [activeTab, setActiveTab] = useState('table')

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const config: CrossAnalysisConfig = {
        xAxis,
        yAxis,
        filters: {
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined
        }
      }
      const analysisResult = await onAnalyze(config)
      setResult(analysisResult)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Convert result to table data format
  const data: CrossTableData | null = result ? {
    rows: result.data.map(d => d.x_value),
    columns: [getAxisLabel(yAxis, false)],
    values: result.data.map(d => [d.y_value])
  } : null

  const handleSavePreset = (name: string, config: Omit<AnalysisPreset, 'id' | 'name'>) => {
    const newPreset: AnalysisPreset = {
      id: Date.now().toString(),
      name,
      ...config
    }
    setPresets([...presets, newPreset])
  }

  const handleLoadPreset = (preset: AnalysisPreset) => {
    setXAxis(preset.xAxis as CrossAnalysisConfig['xAxis'])
    setYAxis(preset.yAxis as CrossAnalysisConfig['yAxis'])
    setDateFrom(preset.dateFrom || '')
    setDateTo(preset.dateTo || '')
    setStatus(preset.status || 'all')
  }

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id))
  }

  const handleExportCSV = () => {
    if (!data) return

    const headers = ['', ...data.columns].join(',')
    const rows = data.rows.map((row, rowIndex) => {
      const rowData = [row, ...data.values[rowIndex]]
      return rowData.join(',')
    })

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `cross-analysis-${Date.now()}.csv`
    link.click()
  }

  const handleExportPNG = async () => {
    // Note: In a real implementation, you would use a library like html2canvas
    alert('PNG エクスポート機能は実装中です')
  }

  const getAxisLabel = (axisValue: string, isX: boolean) => {
    const options = isX
      ? [
          { value: 'date', label: '日付' },
          { value: 'tag', label: 'タグ' },
          { value: 'segment', label: 'セグメント' },
          { value: 'message_type', label: 'メッセージタイプ' },
          { value: 'device', label: 'デバイス' }
        ]
      : [
          { value: 'friends', label: '友だち数' },
          { value: 'messages', label: 'メッセージ数' },
          { value: 'delivery_rate', label: '配信率' },
          { value: 'engagement', label: 'エンゲージメント率' },
          { value: 'clicks', label: 'クリック数' }
        ]

    return options.find(o => o.value === axisValue)?.label || axisValue
  }

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Analysis Axes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowsRightLeftIcon className="w-5 h-5 text-blue-600" />
                分析軸設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AxisSelector
                xAxis={xAxis}
                yAxis={yAxis}
                onXAxisChange={setXAxis}
                onYAxisChange={setYAxis}
              />
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-blue-600" />
                フィルター
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-from">開始日</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-to">終了日</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">ステータス</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="active">配信中</SelectItem>
                    <SelectItem value="completed">完了</SelectItem>
                    <SelectItem value="draft">下書き</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                {loading ? '分析中...' : '分析実行'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Presets */}
        <div>
          <AnalysisPresets
            presets={presets}
            onLoadPreset={handleLoadPreset}
            onSavePreset={handleSavePreset}
            onDeletePreset={handleDeletePreset}
            currentConfig={{ xAxis, yAxis, dateFrom, dateTo, status }}
          />
        </div>
      </div>

      {/* Results Section */}
      {data && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Squares2X2Icon className="w-5 h-5 text-blue-600" />
              分析結果
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCSV}
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportPNG}
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                PNG
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="table">クロステーブル</TabsTrigger>
                <TabsTrigger value="heatmap">ヒートマップ</TabsTrigger>
                <TabsTrigger value="scatter">散布図</TabsTrigger>
              </TabsList>

              <TabsContent value="table" className="mt-6">
                <CrossTable
                  data={data}
                  xAxisLabel={getAxisLabel(xAxis, true)}
                  yAxisLabel={getAxisLabel(yAxis, false)}
                />
              </TabsContent>

              <TabsContent value="heatmap" className="mt-6">
                <HeatmapChart
                  data={data}
                  xAxisLabel={getAxisLabel(xAxis, true)}
                  yAxisLabel={getAxisLabel(yAxis, false)}
                />
              </TabsContent>

              <TabsContent value="scatter" className="mt-6">
                <ScatterChart
                  data={data}
                  xAxisLabel={getAxisLabel(xAxis, true)}
                  yAxisLabel={getAxisLabel(yAxis, false)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {!data && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <ChartBarIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">分析軸を選択して実行してください</p>
              <p className="text-sm">データの相関関係や傾向を可視化できます</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
