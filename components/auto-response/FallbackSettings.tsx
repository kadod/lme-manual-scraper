"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

interface FallbackConfig {
  defaultResponse: string
  timeout: number
  retryCount: number
}

interface FallbackSettingsProps {
  config: FallbackConfig
  onConfigChange: (config: FallbackConfig) => void
}

export function FallbackSettings({ config, onConfigChange }: FallbackSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5" />
          フォールバック設定
        </CardTitle>
        <CardDescription>
          AI応答が失敗した場合の動作を設定します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="defaultResponse">デフォルト応答</Label>
          <Textarea
            id="defaultResponse"
            value={config.defaultResponse}
            onChange={(e) => onConfigChange({ ...config, defaultResponse: e.target.value })}
            placeholder="申し訳ございません。現在、応答できません。しばらくしてから再度お試しください。"
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            AI応答が失敗した際に送信するメッセージ
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeout">タイムアウト時間（秒）</Label>
          <Input
            id="timeout"
            type="number"
            min={5}
            max={60}
            step={5}
            value={config.timeout}
            onChange={(e) => onConfigChange({ ...config, timeout: parseInt(e.target.value) || 30 })}
          />
          <p className="text-xs text-gray-500">
            API応答を待つ最大時間（5-60秒）
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="retryCount">リトライ回数</Label>
          <Input
            id="retryCount"
            type="number"
            min={0}
            max={5}
            step={1}
            value={config.retryCount}
            onChange={(e) => onConfigChange({ ...config, retryCount: parseInt(e.target.value) || 1 })}
          />
          <p className="text-xs text-gray-500">
            失敗時に再試行する回数（0-5回）
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
