'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserGroupIcon,
  ClockIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

interface DeliveryStep {
  id: number
  timing: string
  userCount: number
  actions: number
  hasMessage: boolean
}

export default function StepCampaignDetailPage() {
  const params = useParams()
  const [campaignName, setCampaignName] = useState('退職手続き予定リマインド【1ヶ月前】')
  const [selectedFolder, setSelectedFolder] = useState('onboarding')
  const [autoContinue, setAutoContinue] = useState(false)
  const [expandedSteps, setExpandedSteps] = useState<number[]>([])

  const [steps, setSteps] = useState<DeliveryStep[]>([
    { id: 1, timing: '00時間05分後', userCount: 26, actions: 1, hasMessage: true },
    { id: 2, timing: '1日後09:00', userCount: 26, actions: 1, hasMessage: true },
    { id: 3, timing: '2日後09:00', userCount: 26, actions: 1, hasMessage: true },
    { id: 4, timing: '3日後09:00', userCount: 26, actions: 1, hasMessage: true },
    { id: 5, timing: '6日後09:00', userCount: 26, actions: 1, hasMessage: true },
    { id: 6, timing: '13日後09:00', userCount: 26, actions: 1, hasMessage: true },
    { id: 7, timing: '27日後09:00', userCount: 26, actions: 1, hasMessage: true },
  ])

  const toggleStep = (stepId: number) => {
    setExpandedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    )
  }

  const folders = [
    { id: 'uncategorized', name: '未分類' },
    { id: 'onboarding', name: 'オンボーディング' },
    { id: 'survey', name: 'アンケート' },
  ]

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">ステップ配信設定</h1>
          <div className="flex gap-3">
            <Button variant="outline">キャンセル</Button>
            <Button className="bg-blue-500 hover:bg-blue-600">保存</Button>
          </div>
        </div>

        {/* Management Name and Folder */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">管理名 *</label>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="ステップ配信の管理名を入力"
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

        {/* Delivery Target */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">配信対象</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm">すべての友だち</span>
            </div>
            <Button variant="outline" size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              配信対象を追加
            </Button>
          </div>
        </Card>

        {/* Delivery Timing */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">配信タイミング</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>表示件数</span>
              <select className="border rounded px-2 py-1">
                <option>50件</option>
                <option>100件</option>
                <option>200件</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="border rounded-lg bg-white">
                {/* Step Header */}
                <div className="p-4 flex items-center justify-between border-b bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-sm">
                      {step.id}
                    </div>
                    <div className="flex items-center gap-3">
                      <ClockIcon className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{step.timing}</span>
                      <span className="text-sm text-gray-500">
                        ({step.userCount}人が配信対象)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="p-2 hover:bg-gray-200 rounded"
                    >
                      {expandedSteps.includes(step.id) ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Step Content */}
                <div className="p-4 space-y-3">
                  {/* L-Message Action Dropdown */}
                  <div className="border rounded-lg p-3 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" />
                        </svg>
                        <span className="font-medium text-blue-900">
                          エルメアクション {step.actions}件設定済
                        </span>
                      </div>
                      <ChevronDownIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>

                  {/* Message/Template Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      メッセージ
                    </Button>
                    <Button variant="outline" size="sm">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      テンプレート
                    </Button>
                  </div>

                  {/* Message Preview (if exists) */}
                  {step.hasMessage && (
                    <div className="border rounded-lg p-3 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex gap-1 mb-2">
                            <div className="w-8 h-2 bg-yellow-400 rounded"></div>
                            <div className="w-8 h-2 bg-yellow-400 rounded"></div>
                            <div className="w-8 h-2 bg-yellow-400 rounded"></div>
                          </div>
                          <p className="text-sm text-gray-600">
                            退職手続き予定リマインド【{index + 1}回目】
                          </p>
                        </div>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <TrashIcon className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )}

                  {expandedSteps.includes(step.id) && (
                    <div className="pt-3 border-t space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">配信時刻設定</label>
                        <div className="flex items-center gap-2">
                          <Input type="number" defaultValue="0" className="w-20" />
                          <span>日後</span>
                          <Input type="time" defaultValue="09:00" className="w-32" />
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        ※ 配信予約時刻は、ステップ開始時刻からの経過時間で設定します
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add Next Step Button */}
            <Button variant="outline" className="w-full">
              <PlusIcon className="h-5 w-5 mr-2" />
              次の配信タイミングを追加
            </Button>
          </div>
        </Card>

        {/* Quick Test Users */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">クイックテストユーザー登録</h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              テスト用の友だちアカウントを登録して、配信テストを行うことができます。
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                テストユーザーを追加
              </Button>
            </div>
          </div>
        </Card>

        {/* Auto Continue Settings */}
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={autoContinue}
              onCheckedChange={(checked) => setAutoContinue(checked as boolean)}
            />
            <div className="flex-1">
              <label className="font-medium cursor-pointer">
                配信を自動継続する（上級者向け）
              </label>
              <p className="text-sm text-gray-600 mt-1">
                最終ステップ完了後も、新しく追加された友だちに対して自動的にステップ配信を開始します。
              </p>
            </div>
          </div>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <TrashIcon className="h-5 w-5 mr-2" />
            このステップ配信を削除
          </Button>
          <div className="flex gap-3">
            <Link href="/dashboard/messages/step-campaigns">
              <Button variant="outline">キャンセル</Button>
            </Link>
            <Button className="bg-blue-500 hover:bg-blue-600">保存</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
