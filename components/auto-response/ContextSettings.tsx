"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

interface ContextConfig {
  conversationHistoryCount: number
  autoInjectUserInfo: boolean
  useCustomFields: boolean
}

interface ContextSettingsProps {
  config: ContextConfig
  onConfigChange: (config: ContextConfig) => void
}

export function ContextSettings({ config, onConfigChange }: ContextSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>コンテキスト設定</CardTitle>
        <CardDescription>
          AI応答時に参照する情報を設定します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="historyCount">会話履歴保持数</Label>
            <span className="text-sm font-medium">{config.conversationHistoryCount}件</span>
          </div>
          <Slider
            id="historyCount"
            min={1}
            max={20}
            step={1}
            value={[config.conversationHistoryCount]}
            onValueChange={(value) =>
              onConfigChange({ ...config, conversationHistoryCount: value[0] })
            }
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1件</span>
            <span>20件</span>
          </div>
          <p className="text-xs text-gray-500">
            過去の会話を何件まで参照するかを設定します
          </p>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="autoInjectUserInfo">友だち情報の自動注入</Label>
            <p className="text-sm text-gray-500">
              ユーザー名やタグなどの情報を自動的にコンテキストに含めます
            </p>
          </div>
          <Switch
            id="autoInjectUserInfo"
            checked={config.autoInjectUserInfo}
            onCheckedChange={(checked) =>
              onConfigChange({ ...config, autoInjectUserInfo: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="useCustomFields">カスタムフィールドの利用</Label>
            <p className="text-sm text-gray-500">
              友だちに設定されたカスタムフィールドを応答生成に活用します
            </p>
          </div>
          <Switch
            id="useCustomFields"
            checked={config.useCustomFields}
            onCheckedChange={(checked) =>
              onConfigChange({ ...config, useCustomFields: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
