'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

export default function TemplateDetailPage() {
  const router = useRouter()
  const [templateName, setTemplateName] = useState('初期アンケート_質問5.5')
  const [folder, setFolder] = useState('初期アンケート')
  const [messageType, setMessageType] = useState('panel')
  const [panelTab, setPanelTab] = useState('panel')
  const [panelTitle, setPanelTitle] = useState('はじめから診断をやり直したい場合はこちらから！')
  const [panelBody, setPanelBody] = useState('※間違えた質問のボタンを押しても修正可能です！')
  const [buttonText, setButtonText] = useState('▼タップでやり直す▼')
  const [actionType, setActionType] = useState('lme')
  const [selectedTemplate, setSelectedTemplate] = useState('初期アンケート_質問①')
  const [selectedRichMenu, setSelectedRichMenu] = useState('')

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">テンプレート作成</h1>
            <Link href="#" className="text-sm underline">
              テンプレートの配信カウントについて
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="col-span-2 space-y-6">
            {/* Template Name */}
            <div className="bg-white rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="mb-2 block">管理名</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">13/20</span>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">フォルダ</Label>
                  <Select value={folder} onValueChange={setFolder}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="初期アンケート">初期アンケート</SelectItem>
                      <SelectItem value="リマインド">リマインド</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Message Registration */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="font-bold mb-4">メッセージ登録</h2>

              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  className="bg-green-50 border-green-500 text-green-700"
                >
                  <span className="mr-1">＋</span> メッセージ追加
                </Button>
                <Button variant="outline" className="border-blue-500 text-blue-700">
                  プレビュー・テスト
                </Button>
                <Button variant="outline">並べ替え</Button>
                <Button variant="outline">送信オプション / OFF</Button>
                <Button variant="outline">一括削除</Button>
              </div>

              {/* Message Type Tabs */}
              <div className="mb-6">
                <div className="flex border-b mb-4">
                  <button
                    className={`px-4 py-2 ${
                      messageType === 'panel'
                        ? 'border-b-2 border-gray-400 font-medium'
                        : 'text-gray-500'
                    }`}
                    onClick={() => setMessageType('panel')}
                  >
                    パネル・ボタン
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      messageType === 'panel-type'
                        ? 'border-b-2 border-gray-400 font-medium'
                        : 'text-gray-500'
                    }`}
                    onClick={() => setMessageType('panel-type')}
                  >
                    パネルタイプ
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      messageType === 'standard'
                        ? 'border-b-2 border-gray-400 font-medium'
                        : 'text-gray-500'
                    }`}
                    onClick={() => setMessageType('standard')}
                  >
                    スタンダード
                  </button>
                </div>

                {/* Panel Settings */}
                <div className="space-y-4">
                  <div className="flex border-b">
                    <button
                      className={`px-4 py-2 ${
                        panelTab === 'panel'
                          ? 'border-b-2 border-green-600 text-green-600 font-medium'
                          : 'text-gray-600'
                      }`}
                      onClick={() => setPanelTab('panel')}
                    >
                      パネル設定
                    </button>
                    <button
                      className={`px-4 py-2 ${
                        panelTab === 'detail'
                          ? 'border-b-2 border-green-600 text-green-600 font-medium'
                          : 'text-gray-600'
                      }`}
                      onClick={() => setPanelTab('detail')}
                    >
                      詳細設定
                    </button>
                  </div>

                  {panelTab === 'panel' && (
                    <div className="space-y-4">
                      <div className="flex gap-2 mb-4">
                        <Button variant="outline" size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
                          <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                          パネル追加
                        </Button>
                        <span className="text-sm text-gray-600">※パネルは最大10枚まで登録できます。</span>
                      </div>

                      <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-green-700 font-bold">パネル1</span>
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-green-100 rounded">
                              <ChevronUpIcon className="h-5 w-5" />
                            </button>
                            <button className="p-1 hover:bg-green-100 rounded">
                              <ChevronDownIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Image Upload */}
                        <div className="mb-4">
                          <Label className="mb-2 block">画像登録 推奨サイズ 1024x678 px</Label>
                          <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600">
                            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                            アップロード
                          </Button>
                        </div>

                        {/* Title */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Label>タイトル</Label>
                            <Button variant="outline" size="sm">
                              <span className="mr-1">＋</span> LINE名
                            </Button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                            <span className="text-sm text-gray-500 ml-auto">23/40</span>
                          </div>
                          <Input
                            value={panelTitle}
                            onChange={(e) => setPanelTitle(e.target.value)}
                          />
                        </div>

                        {/* Body */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Label>本文 <span className="text-red-500">*</span></Label>
                            <Button variant="outline" size="sm">
                              <span className="mr-1">＋</span> LINE名
                            </Button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                            <span className="text-sm text-gray-500 ml-auto">23/60</span>
                          </div>
                          <Textarea
                            value={panelBody}
                            onChange={(e) => setPanelBody(e.target.value)}
                            rows={3}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            表示端末によっては、文字数制限内でも全文表示されない場合があります。
                            呼び出しテキストが文字数制限を超える場合、末尾がカットされます。
                          </p>
                        </div>

                        {/* Button Edit */}
                        <div className="border-t pt-4">
                          <h3 className="font-medium mb-4">ボタン編集</h3>

                          <div className="border rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-4">
                              <span className="font-medium">ボタン1</span>
                              <div className="flex gap-2">
                                <button className="p-1 hover:bg-gray-100 rounded">
                                  <ChevronUpIcon className="h-5 w-5" />
                                </button>
                                <button className="p-1 hover:bg-gray-100 rounded">
                                  <ChevronDownIcon className="h-5 w-5" />
                                </button>
                                <button className="p-1 hover:bg-gray-100 rounded">
                                  <DocumentDuplicateIcon className="h-5 w-5" />
                                </button>
                                <button className="p-1 hover:bg-gray-100 rounded text-red-600">
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>

                            {/* Button Text */}
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Label>ボタンテキスト <span className="text-red-500">*</span></Label>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                                <span className="text-sm text-gray-500 ml-auto">10/20</span>
                              </div>
                              <Input
                                value={buttonText}
                                onChange={(e) => setButtonText(e.target.value)}
                              />
                            </div>

                            {/* Action Type */}
                            <div className="mb-4">
                              <Label className="mb-2 block">アクション</Label>
                              <RadioGroup value={actionType} onValueChange={setActionType}>
                                <div className="flex items-center space-x-2 mb-2">
                                  <RadioGroupItem value="lme" id="lme" className="text-green-600" />
                                  <Label htmlFor="lme" className="font-normal">
                                    <span className="text-green-600">エルメアクション</span>・<span>友だちアクションを設定する</span> (併用可)
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="line-url" id="line-url" />
                                  <Label htmlFor="line-url" className="font-normal">
                                    LINE URLスキームを設定する (他アクションとの併用不可)
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* Tabs for Actions */}
                            <div className="flex border-b mb-4">
                              <button className="px-4 py-2 border-b-2 border-green-600 text-green-600 font-medium text-sm">
                                エルメアクション
                              </button>
                              <button className="px-4 py-2 text-gray-600 text-sm">
                                友だちアクション
                              </button>
                            </div>

                            {/* Actions */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 border rounded">
                                <div className="flex-1">
                                  <div className="text-sm font-medium mb-1">テンプレート</div>
                                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="初期アンケート_質問①">初期アンケート_質問①</SelectItem>
                                      <SelectItem value="初期アンケート_質問②">初期アンケート_質問②</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="text-sm text-gray-600 ml-4">絞り込みなし<br />を送信</div>
                              </div>

                              <div className="flex items-center justify-between p-3 border rounded">
                                <div className="flex-1">
                                  <div className="text-sm font-medium mb-1">リッチメニュー</div>
                                  <Select value={selectedRichMenu} onValueChange={setSelectedRichMenu}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="選択してください" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="menu1">メニュー1</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="text-sm text-gray-600 ml-4">絞り込みなし<br />表示を停止</div>
                              </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                              <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600">
                                アクション登録・編集
                              </Button>
                              <Link href="#" className="text-blue-600 text-sm hover:underline flex items-center">
                                パネル選択に戻る ↩
                              </Link>
                            </div>
                          </div>

                          <Button variant="outline" className="w-full">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            ボタン追加
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            ※選択肢はパネル1枚の場合は4つ、パネル2枚以上の場合は3つまで登録できます。
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex gap-4">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8">
                保存して一覧に戻る
              </Button>
              <Link href="/dashboard/messages/templates">
                <Button variant="outline">戻る</Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-bold mb-4 text-center">プレビュー</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="bg-white rounded-lg overflow-hidden shadow">
                    <div className="aspect-[16/9] bg-gray-200 flex items-center justify-center">
                      <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium mb-2">{panelTitle}</h4>
                      <p className="text-sm text-gray-600 mb-3">{panelBody}</p>
                      <button className="w-full py-2 px-4 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                        {buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
