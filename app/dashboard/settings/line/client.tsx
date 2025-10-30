'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/settings/CopyButton'
import {
  CheckCircleIcon,
  XCircleIcon,
  LinkIcon,
  KeyIcon,
  GlobeAltIcon,
  BellAlertIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'
import { updateLineSettings } from '@/app/actions/line-settings'

interface LineSettingsClientProps {
  organization: {
    id: string
    name: string
    channelAccessToken: string | null
    channelSecret: string | null
  }
  currentUserRole: string
  webhookUrl: string
}

export function LineSettingsClient({
  organization,
  currentUserRole,
  webhookUrl,
}: LineSettingsClientProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [channelAccessToken, setChannelAccessToken] = useState(organization.channelAccessToken || '')
  const [channelSecret, setChannelSecret] = useState(organization.channelSecret || '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isConnected = !!organization.channelAccessToken && !!organization.channelSecret
  const canEdit = currentUserRole === 'owner' || currentUserRole === 'admin'

  const handleSave = async () => {
    if (!channelAccessToken.trim() || !channelSecret.trim()) {
      setError('アクセストークンとチャネルシークレットを入力してください')
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await updateLineSettings(organization.id, {
        channelAccessToken: channelAccessToken.trim(),
        channelSecret: channelSecret.trim(),
      })

      setSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setChannelAccessToken(organization.channelAccessToken || '')
    setChannelSecret(organization.channelSecret || '')
    setIsEditing(false)
    setError(null)
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">LINE設定</h1>
        <p className="text-muted-foreground mt-2">
          LINE連携、チャネル設定、Webhook設定を管理
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-900">
              LINE設定を保存しました
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
        </div>
      )}

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>接続ステータス</CardTitle>
              <CardDescription>LINEチャネルとの連携状態</CardDescription>
            </div>
            {isConnected ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                接続済み
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                <XCircleIcon className="h-4 w-4 mr-1" />
                未接続
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">
                  LINEチャネルが正常に接続されています
                </span>
              </div>
              <div className="text-xs text-gray-500 pl-8">
                組織: {organization.name}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <XCircleIcon className="h-5 w-5 text-red-600" />
                <span className="text-gray-700">
                  LINEチャネルが接続されていません
                </span>
              </div>
              <p className="text-xs text-gray-500 pl-8">
                LINE Developers コンソールでチャネルを作成し、必要な情報を入力してください
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Channel Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <LinkIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>チャネル設定</CardTitle>
                <CardDescription>LINE Messaging API チャネル情報</CardDescription>
              </div>
            </div>
            {canEdit && !isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                編集
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              チャネルアクセストークン <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type={isEditing ? 'text' : 'password'}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100"
                placeholder="LINE Developersコンソールで発行したトークンを入力"
                value={channelAccessToken}
                onChange={(e) => setChannelAccessToken(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <p className="text-xs text-gray-500">
              LINE Developers コンソールの「Messaging API設定」から発行
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              チャネルシークレット <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type={isEditing ? 'text' : 'password'}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 disabled:bg-gray-100"
                placeholder="チャネルシークレットを入力"
                value={channelSecret}
                onChange={(e) => setChannelSecret(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <p className="text-xs text-gray-500">
              LINE Developers コンソールの「チャネル基本設定」から取得
            </p>
          </div>

          {isEditing && (
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '保存'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
              >
                キャンセル
              </Button>
            </div>
          )}

          {!canEdit && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                LINE設定を変更するには、組織のオーナーまたは管理者権限が必要です
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Webhook Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <GlobeAltIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Webhook設定</CardTitle>
              <CardDescription>LINEからのイベント受信設定</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Webhook URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                value={webhookUrl}
                readOnly
              />
              <CopyButton text={webhookUrl} />
            </div>
            <p className="text-xs text-gray-500">
              このURLをLINE Developers コンソールの「Messaging API設定」に設定してください
            </p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <BellAlertIcon className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-amber-900">
                  Webhook設定の確認事項
                </p>
                <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                  <li>LINE Developers コンソールでWebhook URLを設定</li>
                  <li>「Webhookの利用」を有効にする</li>
                  <li>「検証」ボタンでWebhook URLの動作を確認</li>
                  <li>必要なイベントタイプを選択（メッセージ、フォローなど）</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* API Keys Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <KeyIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>API設定</CardTitle>
              <CardDescription>Messaging API の詳細設定</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">応答メッセージ</label>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm text-gray-600">LINE公式アカウント応答メッセージ</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  無効
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                Botで応答する場合は無効にしてください
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">あいさつメッセージ</label>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm text-gray-600">友だち追加時のあいさつ</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  有効
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                友だち追加時に自動送信されます
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  推奨設定
                </p>
                <p className="text-xs text-blue-800">
                  Botで全てのメッセージを処理する場合は、LINE公式アカウントの「応答メッセージ」を無効にし、
                  「Webhook」を有効にしてください。あいさつメッセージは必要に応じて設定してください。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-sm text-gray-900">
                LINE連携設定ガイド
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                詳しい設定手順はドキュメントをご覧ください
              </p>
            </div>
            <a
              href="https://developers.line.biz/ja/docs/messaging-api/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              ドキュメントを見る
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
