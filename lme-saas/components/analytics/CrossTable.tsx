'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export interface CrossTableData {
  rows: string[]
  columns: string[]
  values: number[][]
}

interface CrossTableProps {
  data: CrossTableData
  xAxisLabel: string
  yAxisLabel: string
}

export function CrossTable({ data, xAxisLabel, yAxisLabel }: CrossTableProps) {
  const { rows, columns, values } = data

  // Calculate max value for color intensity
  const maxValue = Math.max(...values.flat())

  // Get color intensity based on value
  const getColorIntensity = (value: number) => {
    if (maxValue === 0) return 'bg-gray-50'
    const intensity = Math.round((value / maxValue) * 100)

    if (intensity >= 80) return 'bg-blue-600 text-white'
    if (intensity >= 60) return 'bg-blue-500 text-white'
    if (intensity >= 40) return 'bg-blue-400 text-white'
    if (intensity >= 20) return 'bg-blue-300'
    return 'bg-blue-100'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>クロステーブル</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">{xAxisLabel} / {yAxisLabel}</TableHead>
                {columns.map((col, index) => (
                  <TableHead key={index} className="text-center font-bold">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="font-medium">{row}</TableCell>
                  {columns.map((_, colIndex) => {
                    const value = values[rowIndex][colIndex]
                    return (
                      <TableCell
                        key={colIndex}
                        className={`text-center font-semibold transition-colors ${getColorIntensity(value)}`}
                      >
                        {value.toLocaleString()}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {rows.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            データがありません
          </div>
        )}
      </CardContent>
    </Card>
  )
}
