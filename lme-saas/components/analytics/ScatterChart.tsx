'use client'

import { useMemo } from 'react'
import { ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CrossTableData } from './CrossTable'

interface ScatterChartProps {
  data: CrossTableData
  xAxisLabel: string
  yAxisLabel: string
}

export function ScatterChart({ data, xAxisLabel, yAxisLabel }: ScatterChartProps) {
  const scatterData = useMemo(() => {
    const points: Array<{ x: number; y: number; z: number; name: string }> = []

    data.rows.forEach((row, rowIndex) => {
      data.columns.forEach((col, colIndex) => {
        const value = data.values[rowIndex][colIndex]
        if (value > 0) {
          points.push({
            x: colIndex,
            y: rowIndex,
            z: value,
            name: `${row} - ${col}`
          })
        }
      })
    })

    return points
  }, [data])

  const { correlation, avgX, avgY } = useMemo(() => {
    if (scatterData.length === 0) return { correlation: 0, avgX: 0, avgY: 0 }

    const n = scatterData.length
    const sumX = scatterData.reduce((sum, p) => sum + p.x, 0)
    const sumY = scatterData.reduce((sum, p) => sum + p.y, 0)
    const sumXY = scatterData.reduce((sum, p) => sum + p.x * p.y, 0)
    const sumX2 = scatterData.reduce((sum, p) => sum + p.x * p.x, 0)
    const sumY2 = scatterData.reduce((sum, p) => sum + p.y * p.y, 0)

    const avgX = sumX / n
    const avgY = sumY / n

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    const correlation = denominator === 0 ? 0 : numerator / denominator

    return { correlation, avgX, avgY }
  }, [scatterData])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-sm mb-1">{data.name}</p>
          <p className="text-sm text-gray-600">値: {data.z.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>散布図（相関分析）</CardTitle>
        <CardDescription>
          相関係数: <span className={`font-bold ${
            Math.abs(correlation) > 0.7 ? 'text-green-600' :
            Math.abs(correlation) > 0.4 ? 'text-yellow-600' :
            'text-gray-600'
          }`}>
            {correlation.toFixed(3)}
          </span>
          {Math.abs(correlation) > 0.7 && ' (強い相関)'}
          {Math.abs(correlation) > 0.4 && Math.abs(correlation) <= 0.7 && ' (中程度の相関)'}
          {Math.abs(correlation) <= 0.4 && ' (弱い相関)'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RechartsScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              type="number"
              dataKey="x"
              name={xAxisLabel}
              tick={{ fill: '#6B7280' }}
              label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yAxisLabel}
              tick={{ fill: '#6B7280' }}
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
            />
            <ZAxis type="number" dataKey="z" range={[50, 400]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={scatterData}
              fill="#3B82F6"
              fillOpacity={0.6}
              stroke="#1E40AF"
              strokeWidth={1}
            />
          </RechartsScatterChart>
        </ResponsiveContainer>

        {scatterData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            データがありません
          </div>
        )}
      </CardContent>
    </Card>
  )
}
