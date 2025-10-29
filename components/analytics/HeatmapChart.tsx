'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CrossTableData } from './CrossTable'

interface HeatmapChartProps {
  data: CrossTableData
  xAxisLabel: string
  yAxisLabel: string
}

export function HeatmapChart({ data, xAxisLabel, yAxisLabel }: HeatmapChartProps) {
  const chartData = useMemo(() => {
    const flatData: Array<{ name: string; value: number; row: string; col: string }> = []

    data.rows.forEach((row, rowIndex) => {
      data.columns.forEach((col, colIndex) => {
        const value = data.values[rowIndex][colIndex]
        if (value > 0) {
          flatData.push({
            name: `${row}`,
            value,
            row,
            col
          })
        }
      })
    })

    return flatData.sort((a, b) => b.value - a.value).slice(0, 20) // Top 20
  }, [data])

  const maxValue = useMemo(() => Math.max(...chartData.map(d => d.value)), [chartData])

  const getColor = (value: number) => {
    if (maxValue === 0) return '#E5E7EB'
    const intensity = value / maxValue

    if (intensity >= 0.8) return '#1E40AF'
    if (intensity >= 0.6) return '#3B82F6'
    if (intensity >= 0.4) return '#60A5FA'
    if (intensity >= 0.2) return '#93C5FD'
    return '#DBEAFE'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ヒートマップ（上位20件）</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis type="number" tick={{ fill: '#6B7280' }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              width={140}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [value.toLocaleString(), yAxisLabel]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {chartData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            データがありません
          </div>
        )}
      </CardContent>
    </Card>
  )
}
