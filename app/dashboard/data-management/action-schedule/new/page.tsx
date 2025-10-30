'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function NewActionSchedulePage() {
  const [scheduleName, setScheduleName] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('uncategorized')
  const [targetCount, setTargetCount] = useState('1415')
  const [targetCondition, setTargetCondition] = useState('all')
  const [startDate, setStartDate] = useState('2025/10/30')
  const [startTime, setStartTime] = useState('12:08')
  const [endSetting, setEndSetting] = useState<'none' | 'date' | 'count'>('none')
  const [repeatValue, setRepeatValue] = useState('1')
  const [repeatUnit, setRepeatUnit] = useState('days')

  const folders = [
    { id: 'uncategorized', name: '未分類' },
  ]

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">アクションスケジュール登録</h1>
        </div>

        {/* Basic Info */}
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                スケジュール名（管理用）
                <span className="ml-2 text-xs text-gray-500">0/20文字</span>
              </label>
              <Input
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                placeholder="スケジュール名を入力"
                maxLength={20}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">フォルダ</label>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Action Settings */}
        <Card className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-500"></div>
              <h2 className="text-lg font-bold">アクション稼働対象絞り込み</h2>
            </div>

            <Button variant="outline" className="mb-4">
              絞込み
            </Button>

            <div className="bg-gray-50 p-4 rounded">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium">対象人数</span>
                <Link href="#" className="text-blue-600 text-sm hover:underline">
                  {targetCount}人
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">絞り込み条件</span>
                <span className="text-sm text-gray-600">全員</span>
              </div>
            </div>
          </div>

          {/* L-Message Action */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-500"></div>
              <h2 className="text-lg font-bold">アクション設定</h2>
            </div>

            <div className="mb-4">
              <span className="text-sm">エルメアクション</span>
              <Button className="ml-4 bg-yellow-500 hover:bg-yellow-600">
                編集
              </Button>
            </div>
          </div>
        </Card>

        {/* Schedule Settings */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-500"></div>
              <h2 className="text-lg font-bold">スケジュール設定</h2>
            </div>

            {/* Start Time */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-green-500"></div>
                <h3 className="font-medium">開始日時</h3>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-48"
                />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-32"
                />
              </div>
            </div>

            {/* End Settings */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-green-500"></div>
                <h3 className="font-medium">終了設定</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="endSetting"
                    value="none"
                    checked={endSetting === 'none'}
                    onChange={() => setEndSetting('none')}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>設定しない（無期限）</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="endSetting"
                    value="date"
                    checked={endSetting === 'date'}
                    onChange={() => setEndSetting('date')}
                    className="w-4 h-4"
                  />
                  <span>日付指定（基準時 0:00）</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="endSetting"
                    value="count"
                    checked={endSetting === 'count'}
                    onChange={() => setEndSetting('count')}
                    className="w-4 h-4"
                  />
                  <span>回数指定</span>
                </label>
              </div>
            </div>

            {/* Repeat Settings */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-green-500"></div>
                <h3 className="font-medium">繰り返し設定</h3>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={repeatValue}
                  onChange={(e) => setRepeatValue(e.target.value)}
                  className="w-24"
                  min="1"
                />
                <select
                  value={repeatUnit}
                  onChange={(e) => setRepeatUnit(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="days">日ごと</option>
                  <option value="weeks">週ごと</option>
                  <option value="months">月ごと</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard/data-management/action-schedule">
            <Button variant="outline" className="w-32">
              キャンセル
            </Button>
          </Link>
          <Button className="w-32 bg-green-600 hover:bg-green-700">
            保存
          </Button>
        </div>
      </div>
    </div>
  )
}
