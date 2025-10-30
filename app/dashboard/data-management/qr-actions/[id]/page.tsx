'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import QRCode from 'react-qr-code'

export default function QRCodeActionEditPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'basic' | 'external' | 'qrcode'>('basic')
  const [name, setName] = useState('嘉島さん')
  const [selectedFolder, setSelectedFolder] = useState('uncategorized')
  const [messageText, setMessageText] = useState('')
  const [actionUrl] = useState('https://form.lmes.jp/landing-qr/2007836384-wJY8499EzuLand=VCukQA')

  const folders = [
    { id: 'uncategorized', name: '未分類' },
  ]

  const tabs = [
    { id: 'basic', label: '基本設定' },
    { id: 'external', label: '外部連携' },
    { id: 'qrcode', label: 'QRコード表示' },
  ]

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">TOP &gt; QRコードアクション 編集</p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">QRコードアクション 編集</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm">稼働対象</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                  ● 新規友だちも追加時のみ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-3 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Settings Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    管理名
                    <span className="ml-2 text-xs text-gray-500">4/50</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
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

            {/* Settings Menu */}
            <Card>
              <div className="divide-y">
                {/* Read Action Settings */}
                <div className="p-4">
                  <button className="w-full flex items-center justify-between text-left">
                    <span className="text-lg font-bold flex items-center gap-2">
                      読み込み時アクション
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>

                  <div className="mt-4 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-bold mb-2">QRコード読み込み時のメッセージ・アクション</h3>
                      <p className="text-sm text-red-600 mb-3">
                        新規友だちに対するアクションは初めての友だち追加時のみ、1度だけ稼働します。
                      </p>
                      <p className="text-sm text-blue-600 mb-3">
                        友だち追加の稼働テスト方法は<Link href="#" className="underline">こちら</Link>
                      </p>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">送信するメッセージを登録</label>
                        <div className="flex gap-2 mb-3">
                          <Button variant="outline" size="sm">
                            + LINE名
                          </Button>
                          <Button variant="outline" size="sm">
                            友だち情報
                          </Button>
                        </div>
                        <Textarea
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="メッセージを入力..."
                          rows={6}
                          maxLength={5000}
                        />
                        <p className="text-xs text-gray-500 text-right mt-1">0/5,000</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Introduction Action */}
                <div className="p-4">
                  <button className="w-full flex items-center justify-between text-left">
                    <span className="text-lg font-bold flex items-center gap-2">
                      紹介時アクション
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                </div>

                {/* Option Settings */}
                <div className="p-4">
                  <button className="w-full flex items-center justify-between text-left">
                    <span className="text-lg font-bold flex items-center gap-2">
                      オプション設定
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === 'qrcode' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">アクションURL（QRコード）</h2>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Input
                    value={actionUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    コピー
                  </Button>
                </div>

                <div className="flex items-center justify-center p-8 bg-white border rounded-lg">
                  <div className="text-center">
                    <QRCode value={actionUrl} size={200} />
                    <Button variant="outline" className="mt-4">
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      ダウンロード
                    </Button>
                  </div>
                </div>
              </div>

              {/* LIFF URL Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">認証ページの表示について（LIFF URLへのアクセス）</h3>
                <div className="flex gap-4 mb-4">
                  <div className="bg-white p-4 rounded border flex-1">
                    <p className="text-sm mb-2">認証ページは、LIFF(リフ) URLにアクセスした際に友だち1人につき1度のみ表示されます。</p>
                    <p className="text-sm text-red-600">これはLINE公式アカウントの仕様で、非表示にすることはできません。</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">LIFF URLを利用している機能</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>QRコードアクション</li>
                    <li>フォーム作成</li>
                    <li>サロン面談／レッスン／イベント 予約</li>
                    <li>商品販売</li>
                    <li>ASPリンク（プロプラン限定）</li>
                  </ul>
                </div>

                <p className="text-sm text-blue-600 mt-3">
                  認証ページ表示内容の編集方法は<Link href="#" className="underline">こちら</Link>
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 pt-4 border-t">
          <Link href="/dashboard/data-management/qr-actions">
            <Button variant="outline">一覧に戻る</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
