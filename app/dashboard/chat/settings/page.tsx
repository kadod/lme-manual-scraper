'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowsUpDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface ResponseStatus {
  id: string
  label: string
  color: string
}

export default function ChatSettingsPage() {
  const [activeSection, setActiveSection] = useState('response-status')
  const [sendShortcut, setSendShortcut] = useState('shift-enter')
  const [autoReadOnReply, setAutoReadOnReply] = useState(false)
  const [autoReadOnBlock, setAutoReadOnBlock] = useState(false)
  const [useShortUrl, setUseShortUrl] = useState(false)
  const [useSendPreview, setUseSendPreview] = useState(true)
  const [autoReadTypes, setAutoReadTypes] = useState<string[]>([])

  const [responseStatuses, setResponseStatuses] = useState<ResponseStatus[]>([
    { id: '1', label: '無料相談予約済み', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { id: '2', label: '無料面談済み', color: 'bg-red-100 text-red-700 border-red-300' },
    { id: '3', label: 'フォロー', color: 'bg-green-100 text-green-700 border-green-300' },
    { id: '4', label: '申請対応中', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { id: '5', label: '契約締結済み', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  ])

  const sections = [
    { id: 'response-status', label: '対応ステータス編集' },
    { id: 'auto-read', label: 'メッセージの自動確認済み変更' },
    { id: 'send-shortcut', label: '送信ショートカット' },
    { id: 'short-url', label: '短縮URLの利用' },
    { id: 'send-preview', label: '送信プレビュー' },
    { id: 'read-status', label: '既読情報の表示' },
  ]

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">1:1チャット設定</h2>
      </div>

      <div className="flex gap-6">
        {/* Left Sidebar */}
        <aside className="w-64 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                activeSection === section.id
                  ? 'bg-green-50 text-gray-900 border-l-4 border-green-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {section.label}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {activeSection === 'response-status' && (
            <Card>
              <CardHeader>
                <CardTitle>対応ステータス編集</CardTitle>
                <CardDescription>
                  対応ステータスのテキストとカラーが変更できます
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" className="border-blue-500 text-blue-700">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    追加
                  </Button>
                  <Button variant="outline">
                    <ArrowsUpDownIcon className="h-4 w-4 mr-2" />
                    並べ替え
                  </Button>
                </div>

                <div className="space-y-2">
                  {responseStatuses.map((status) => (
                    <div
                      key={status.id}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-lg border-2',
                        status.color
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-current"></div>
                        <span className="font-medium">{status.label}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-black/5 rounded">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button className="p-1 hover:bg-black/5 rounded">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'auto-read' && (
            <Card>
              <CardHeader>
                <CardTitle>メッセージの自動確認済み変更</CardTitle>
                <CardDescription>
                  設定した受信メッセージを自動的に確認済みに変更します。
                  <br />
                  確認済みに変更されたメッセージは通知されません。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="message-type"
                      checked={autoReadTypes.includes('message')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAutoReadTypes([...autoReadTypes, 'message'])
                        } else {
                          setAutoReadTypes(autoReadTypes.filter(t => t !== 'message'))
                        }
                      }}
                    />
                    <Label htmlFor="message-type">【◯◯】メッセージ</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="stamp-type"
                      checked={autoReadTypes.includes('stamp')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAutoReadTypes([...autoReadTypes, 'stamp'])
                        } else {
                          setAutoReadTypes(autoReadTypes.filter(t => t !== 'stamp'))
                        }
                      }}
                    />
                    <Label htmlFor="stamp-type">スタンプ</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-response"
                      checked={autoReadTypes.includes('auto-response')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAutoReadTypes([...autoReadTypes, 'auto-response'])
                        } else {
                          setAutoReadTypes(autoReadTypes.filter(t => t !== 'auto-response'))
                        }
                      }}
                    />
                    <Label htmlFor="auto-response" className="leading-relaxed">
                      自動応答で設定しているキーワード
                      <br />
                      <span className="text-sm text-gray-500">
                        「全てのメッセージに反応」を設定している場合、全てのメッセージが対象になる場合があります。
                      </span>
                    </Label>
                  </div>
                </div>

                <div className="pt-6 border-t space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">返信時の自動確認済み変更</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      未確認のメッセージがある場合に、メッセージの返信と同時に自動で確認済みに変更します。
                    </p>
                    <div className="flex items-center space-x-4">
                      <Label className="text-gray-600">利用しない</Label>
                      <Switch
                        checked={autoReadOnReply}
                        onCheckedChange={setAutoReadOnReply}
                      />
                      <Label className="font-medium">利用する</Label>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">ブロックされた友だちの自動確認済み変更</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      未確認のメッセージがある状態で、友だちからブロックされた際に自動で確認済みに変更します。
                    </p>
                    <div className="flex items-center space-x-4">
                      <Label className="text-gray-600">利用しない</Label>
                      <Switch
                        checked={autoReadOnBlock}
                        onCheckedChange={setAutoReadOnBlock}
                      />
                      <Label className="font-medium">利用する</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'send-shortcut' && (
            <Card>
              <CardHeader>
                <CardTitle>送信ショートカット</CardTitle>
                <CardDescription>送信時のショートカットを変更します。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={sendShortcut} onValueChange={setSendShortcut}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="shift-enter" id="shift-enter" />
                    <Label htmlFor="shift-enter" className="font-normal">
                      <span className="text-green-600 font-medium">送信：Shift + Enter</span>
                      {' '}
                      <span className="text-gray-600">改行：Enter</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="enter" id="enter" />
                    <Label htmlFor="enter" className="font-normal">
                      <span className="text-gray-600">送信：Enter</span>
                      {' '}
                      <span className="text-gray-600">改行：Shift + Enter</span>
                    </Label>
                  </div>
                </RadioGroup>

                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  保存
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'short-url' && (
            <Card>
              <CardHeader>
                <CardTitle>短縮URLの利用</CardTitle>
                <CardDescription>
                  1:1チャットでURLを送信する際に短縮リンクを利用します。
                  <br />
                  (URL分析が利用できます)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Label className="text-gray-600">利用しない</Label>
                  <Switch
                    checked={useShortUrl}
                    onCheckedChange={setUseShortUrl}
                  />
                  <Label className="font-medium">利用する</Label>
                </div>

                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  保存
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'send-preview' && (
            <Card>
              <CardHeader>
                <CardTitle>送信プレビュー</CardTitle>
                <CardDescription>
                  1:1チャットでの送信時にプレビューを表示します。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Label className="text-gray-600">利用しない</Label>
                  <Switch
                    checked={useSendPreview}
                    onCheckedChange={setUseSendPreview}
                  />
                  <Label className="font-medium text-green-600">利用する</Label>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-red-900">
                      <p className="font-medium">ご注意</p>
                      <p className="mt-1">
                        LINE公式アカウントの仕様上、エルメからの送信取り消しはできません。
                        送信から24時間以内のメッセージのみ、LINE公式アカウント管理画面のチャットから送信取り消しが可能です。詳細は
                        <a href="#" className="text-blue-600 underline">こちら</a>
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  保存
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'read-status' && (
            <Card>
              <CardHeader>
                <CardTitle>既読情報の表示</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Q.エルメから友だちがメッセージを開いたか（既読か）はわかりますか？</h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p className="font-medium">A.エルメから友だちが既読したかどうかの情報は確認できません。</p>
                      <p>
                        これはLINE公式アカウント側の仕様のため、LINE公式アカウントの仕様が変更されない限り、エルメ側では既読情報の確認はできません。
                      </p>
                      <p>
                        詳細は<a href="#" className="text-blue-600 underline">こちら</a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Q.友だちがメッセージを送信してすぐに既読マークをつけないようにできますか？</h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p className="font-medium">A.LINE公式アカウントの設定変更で対応可能です。</p>
                      <p>
                        LINE公式アカウント管理画面の「応答設定」のチャットがオンかオフかによって表示が異なります。詳細は
                        <a href="#" className="text-blue-600 underline">こちら</a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Q.友だちからのメッセージを確認しても、相手のライン上で「既読」がつかないのですがエラーですか？</h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p className="font-medium">A.LINE公式アカウント管理画面のチャット機能がオンになっている場合はLINE公式アカウント側でチャットを確認しない限りは既読は付きません。</p>
                      <p>
                        オフの場合は、友だちがメッセージを送信した時点で既読になります。
                      </p>
                      <p>
                        詳細は<a href="#" className="text-blue-600 underline">こちら</a>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
