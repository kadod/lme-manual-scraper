"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { KeyIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"

interface AIConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

interface AIConfigFormProps {
  config: AIConfig
  onConfigChange: (config: AIConfig) => void
  onSave: () => void
}

export function AIConfigForm({ config, onConfigChange, onSave }: AIConfigFormProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave()
    setIsSaving(false)
  }

  const maskApiKey = (key: string) => {
    if (!key) return ""
    if (key.length <= 8) return "*".repeat(key.length)
    return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyIcon className="h-5 w-5" />
          OpenAI API設定
        </CardTitle>
        <CardDescription>
          OpenAI APIの認証情報とモデル設定を構成します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="apiKey">APIキー</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={showApiKey ? config.apiKey : maskApiKey(config.apiKey)}
              onChange={(e) => onConfigChange({ ...config, apiKey: e.target.value })}
              placeholder="sk-..."
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showApiKey ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            APIキーは暗号化して安全に保存されます
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">モデル</Label>
          <Select
            value={config.model}
            onValueChange={(value) => onConfigChange({ ...config, model: value })}
          >
            <SelectTrigger id="model">
              <SelectValue placeholder="モデルを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            より高性能なモデルほどコストが高くなります
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="temperature">温度パラメータ</Label>
            <span className="text-sm font-medium">{config.temperature.toFixed(1)}</span>
          </div>
          <Slider
            id="temperature"
            min={0}
            max={2}
            step={0.1}
            value={[config.temperature]}
            onValueChange={(value) => onConfigChange({ ...config, temperature: value[0] })}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>正確（0.0）</span>
            <span>創造的（2.0）</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxTokens">最大トークン数</Label>
          <Input
            id="maxTokens"
            type="number"
            min={100}
            max={4000}
            step={100}
            value={config.maxTokens}
            onChange={(e) => onConfigChange({ ...config, maxTokens: parseInt(e.target.value) || 500 })}
          />
          <p className="text-xs text-gray-500">
            応答の最大長を制限します（100-4000）
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? "保存中..." : "設定を保存"}
        </Button>
      </CardContent>
    </Card>
  )
}
