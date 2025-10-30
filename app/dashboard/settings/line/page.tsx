'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DocumentDuplicateIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

export default function LineSettingsPage() {
  const [accountName, setAccountName] = useState('maemukiサポート')
  const [channelId, setChannelId] = useState('2007836227')
  const [channelSecret, setChannelSecret] = useState('9a53be15fec6a0d05b58ed995f993c46')
  const [webhookUrl] = useState('https://cb.lmes.jp/line/callback/add/168037')
  const [liffChannelId, setLiffChannelId] = useState('2007836384')
  const [liffChannelSecret, setLiffChannelSecret] = useState('6817e506d97853295d3aa33d1b605cf3')
  const [liffId, setLiffId] = useState('2007836384-wJY8499E')
  const [copyCode] = useState('eFqweaQ3V7')
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-6">接続設定</h1>

          <div className="flex gap-3">
            <Button variant="outline" className="bg-gray-500 text-white hover:bg-gray-600">
              接続チェック
            </Button>
            <Button variant="outline" className="bg-gray-500 text-white hover:bg-gray-600">
              既存友だち情報取得
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              LINE公式アカウント入れ替え
            </Button>
          </div>
        </div>

        {/* LINE公式アカウント表示 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="border-l-4 border-green-600 pl-4 mb-6">
            <h2 className="text-lg font-bold">LINE公式アカウント表示</h2>
          </div>

          <div className="space-y-6">
            {/* アカウント画像 */}
            <div className="flex items-center gap-4">
              <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium">
                アカウント画像
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-orange-200 rounded flex items-center justify-center text-orange-600 font-bold">
                  /maemuki
                </div>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  変更
                </Button>
              </div>
            </div>

            {/* アカウント名 */}
            <div className="flex items-start gap-4">
              <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium">
                アカウント名
              </div>
              <div className="flex-1">
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="max-w-2xl"
                />
                <p className="text-xs text-gray-600 mt-2">
                  LINE公式アカウント管理画面で 画像・アカウント名を変更した場合
                </p>
                <Button variant="outline" className="mt-3 bg-gray-500 text-white hover:bg-gray-600">
                  情報更新
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 接続情報 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="border-l-4 border-green-600 pl-4 mb-6">
            <h2 className="text-lg font-bold">接続情報</h2>
          </div>

          <div className="space-y-4">
            {/* Channel ID */}
            <div className="flex items-center gap-4">
              <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium text-sm">
                Channel ID
              </div>
              <div className="flex-1 bg-gray-100 px-4 py-3 rounded border">
                {channelId}
              </div>
            </div>

            {/* Channel Secret */}
            <div className="flex items-center gap-4">
              <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium text-sm">
                Channel Secret
              </div>
              <div className="flex-1 bg-white px-4 py-3 rounded border">
                {channelSecret}
              </div>
            </div>

            {/* Webhook URL */}
            <div className="flex items-center gap-4">
              <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium text-sm">
                Webhook URL
              </div>
              <div className="flex-1 bg-gray-100 px-4 py-3 rounded border">
                {webhookUrl}
              </div>
            </div>
          </div>
        </div>

        {/* LINEログイン（LIFF）設定情報 */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="border-l-4 border-green-600 pl-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">LINEログイン（LIFF）設定情報</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">LIFFアプリ接続確認</span>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  チェックする
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* チャネル ID */}
            <div className="flex items-center gap-4">
              <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium text-sm">
                チャネル ID
              </div>
              <div className="flex-1 bg-white px-4 py-3 rounded border">
                {liffChannelId}
              </div>
            </div>

            {/* チャネルシークレット */}
            <div className="flex items-center gap-4">
              <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium text-sm">
                チャネルシークレット
              </div>
              <div className="flex-1 bg-white px-4 py-3 rounded border">
                {liffChannelSecret}
              </div>
            </div>

            {/* 接続済みLIFF ID */}
            <div className="flex items-center gap-4">
              <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium text-sm">
                接続済みLIFF ID
              </div>
              <div className="flex-1 bg-gray-100 px-4 py-3 rounded border">
                {liffId}
              </div>
            </div>
          </div>
        </div>

        {/* データコピー */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="border-l-4 border-green-600 pl-4 mb-6">
            <h2 className="text-lg font-bold">データコピー</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium text-sm">
              コピーコード
            </div>
            <div className="flex-1 bg-white px-4 py-3 rounded border flex items-center justify-between">
              <span>{copyCode}</span>
              <button
                onClick={() => handleCopy(copyCode)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                {copied ? (
                  <CheckIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <DocumentDuplicateIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button className="bg-green-600 hover:bg-green-700 text-white px-8">
            保存
          </Button>
          <Button variant="outline" className="bg-gray-500 text-white hover:bg-gray-600">
            戻る
          </Button>
        </div>
      </div>
    </div>
  )
}
