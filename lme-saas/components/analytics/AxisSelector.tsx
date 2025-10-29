'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export type AxisOption = {
  value: string
  label: string
}

export const X_AXIS_OPTIONS: AxisOption[] = [
  { value: 'date', label: '日付' },
  { value: 'tag', label: 'タグ' },
  { value: 'segment', label: 'セグメント' },
  { value: 'message_type', label: 'メッセージタイプ' },
  { value: 'device', label: 'デバイス' }
]

export const Y_AXIS_OPTIONS: AxisOption[] = [
  { value: 'friends', label: '友だち数' },
  { value: 'messages', label: 'メッセージ数' },
  { value: 'delivery_rate', label: '配信率' },
  { value: 'engagement', label: 'エンゲージメント率' },
  { value: 'clicks', label: 'クリック数' }
]

interface AxisSelectorProps {
  xAxis: string
  yAxis: string
  onXAxisChange: (value: string) => void
  onYAxisChange: (value: string) => void
}

export function AxisSelector({ xAxis, yAxis, onXAxisChange, onYAxisChange }: AxisSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="x-axis">X軸</Label>
        <Select value={xAxis} onValueChange={onXAxisChange}>
          <SelectTrigger id="x-axis">
            <SelectValue placeholder="X軸を選択" />
          </SelectTrigger>
          <SelectContent>
            {X_AXIS_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="y-axis">Y軸</Label>
        <Select value={yAxis} onValueChange={onYAxisChange}>
          <SelectTrigger id="y-axis">
            <SelectValue placeholder="Y軸を選択" />
          </SelectTrigger>
          <SelectContent>
            {Y_AXIS_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
