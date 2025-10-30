'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DocumentDuplicateIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import {
  getLineSettings,
  saveLineSettings,
  testLineConnection,
  updateChannelProfile,
  fetchExistingFriends,
  testLiffConnection,
  getWebhookUrl,
  type LineChannel,
} from '@/app/actions/line-settings'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LineSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  // Form states
  const [channelId, setChannelId] = useState('')
  const [channelSecret, setChannelSecret] = useState('')
  const [channelAccessToken, setChannelAccessToken] = useState('')
  const [channelName, setChannelName] = useState('')
  const [channelIconUrl, setChannelIconUrl] = useState<string | null>(null)
  const [liffId, setLiffId] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [copied, setCopied] = useState(false)

  // Load existing settings
  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      const settings = await getLineSettings()
      const webhook = await getWebhookUrl()

      if (settings) {
        setChannelId(settings.channel_id)
        setChannelSecret(settings.channel_secret)
        setChannelAccessToken(settings.channel_access_token)
        setChannelName(settings.channel_name || '')
        setChannelIconUrl(settings.channel_icon_url)
        setLiffId(settings.settings.liff_id || '')
      }

      setWebhookUrl(webhook)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('設定の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)

      if (!channelId || !channelSecret || !channelAccessToken) {
        toast.error('必須項目を入力してください')
        return
      }

      await saveLineSettings({
        channelId,
        channelSecret,
        channelAccessToken,
        liffId: liffId || undefined,
        channelName: channelName || undefined,
      })

      toast.success('設定を保存しました')
      router.refresh()
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('設定の保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  async function handleTestConnection() {
    try {
      setTesting(true)

      if (!channelAccessToken) {
        toast.error('Channel Access Tokenを入力してください')
        return
      }

      const result = await testLineConnection(channelAccessToken)

      if (result.success && result.data) {
        toast.success(
          `接続成功: ${result.data.displayName || 'Bot'}`
        )
        // Update channel name if not set
        if (!channelName && result.data.displayName) {
          setChannelName(result.data.displayName)
        }
        if (result.data.pictureUrl) {
          setChannelIconUrl(result.data.pictureUrl)
        }
      } else {
        toast.error(result.error || '接続に失敗しました')
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      toast.error('接続テストに失敗しました')
    } finally {
      setTesting(false)
    }
  }

  async function handleUpdateProfile() {
    try {
      setTesting(true)
      const updated = await updateChannelProfile()

      setChannelName(updated.channel_name || '')
      setChannelIconUrl(updated.channel_icon_url)

      toast.success('アカウント情報を更新しました')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('情報の更新に失敗しました')
    } finally {
      setTesting(false)
    }
  }

  async function handleFetchFriends() {
    try {
      setTesting(true)
      const result = await fetchExistingFriends()

      if (result.success) {
        toast.info(result.message)
      } else {
        toast.error(result.error || '取得に失敗しました')
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error)
      toast.error('友だち情報の取得に失敗しました')
    } finally {
      setTesting(false)
    }
  }

  async function handleTestLiff() {
    try {
      setTesting(true)

      if (!liffId) {
        toast.error('LIFF IDを入力してください')
        return
      }

      const result = await testLiffConnection(liffId)

      if (result.success) {
        toast.success(result.message || 'LIFF IDは有効です')
      } else {
        toast.error(result.error || 'LIFF IDの検証に失敗しました')
      }
    } catch (error) {
      console.error('LIFF test failed:', error)
      toast.error('LIFFの検証に失敗しました')
    } finally {
      setTesting(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('コピーしました')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-6">接続設定</h1>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-gray-500 text-white hover:bg-gray-600"
              onClick={handleTestConnection}
              disabled={testing || !channelAccessToken}
            >
              {testing ? '確認中...' : '接続チェック'}
            </Button>
            <Button
              variant="outline"
              className="bg-gray-500 text-white hover:bg-gray-600"
              onClick={handleFetchFriends}
              disabled={testing}
            >
              既存友だち情報取得
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
                {channelIconUrl ? (
                  <img
                    src={channelIconUrl}
                    alt={channelName}
                    className="w-16 h-16 rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
            </div>

            {/* アカウント名 */}
            <div className="flex items-start gap-4">
              <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium">
                アカウント名
              </div>
              <div className="flex-1">
                <Input
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="max-w-2xl"
                  placeholder="LINE公式アカウント名"
                />
                <p className="text-xs text-gray-600 mt-2">
                  LINE公式アカウント管理画面で 画像・アカウント名を変更した場合
                </p>
                <Button
                  variant="outline"
                  className="mt-3 bg-gray-500 text-white hover:bg-gray-600"
                  onClick={handleUpdateProfile}
                  disabled={testing || !channelAccessToken}
                >
                  {testing ? '更新中...' : '情報更新'}
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
              <Input
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="flex-1"
                placeholder="LINE Channel ID"
                required
              />
            </div>

            {/* Channel Secret */}
            <div className="flex items-center gap-4">
              <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium text-sm">
                Channel Secret
              </div>
              <Input
                value={channelSecret}
                onChange={(e) => setChannelSecret(e.target.value)}
                className="flex-1"
                placeholder="LINE Channel Secret"
                type="password"
                required
              />
            </div>

            {/* Channel Access Token */}
            <div className="flex items-center gap-4">
              <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium text-sm">
                Access Token
              </div>
              <Input
                value={channelAccessToken}
                onChange={(e) => setChannelAccessToken(e.target.value)}
                className="flex-1"
                placeholder="LINE Channel Access Token"
                type="password"
                required
              />
            </div>

            {/* Webhook URL */}
            <div className="flex items-center gap-4">
              <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium text-sm">
                Webhook URL
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 px-4 py-3 rounded border">
                  {webhookUrl || '設定を保存後に表示されます'}
                </div>
                {webhookUrl && (
                  <button
                    onClick={() => handleCopy(webhookUrl)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    {copied ? (
                      <CheckIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <DocumentDuplicateIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                )}
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
                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={handleTestLiff}
                  disabled={testing || !liffId}
                >
                  {testing ? '確認中...' : 'チェックする'}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* LIFF ID */}
            <div className="flex items-center gap-4">
              <div className="w-40 bg-gray-400 text-white px-4 py-3 rounded font-medium text-sm">
                LIFF ID
              </div>
              <Input
                value={liffId}
                onChange={(e) => setLiffId(e.target.value)}
                className="flex-1"
                placeholder="LIFF ID (例: 1234567890-abcdefgh)"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white px-8"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存'}
          </Button>
          <Button
            variant="outline"
            className="bg-gray-500 text-white hover:bg-gray-600"
            onClick={() => router.push('/dashboard/settings')}
          >
            戻る
          </Button>
        </div>
      </div>
    </div>
  )
}
