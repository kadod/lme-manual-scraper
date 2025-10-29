"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ChatBubbleLeftRightIcon, BeakerIcon } from "@heroicons/react/24/outline"

interface AITesterProps {
  onTest: (message: string) => Promise<{ response: string; usage: any }>
}

export function AITester({ onTest }: AITesterProps) {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [usage, setUsage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTest = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    setError("")
    setResponse("")
    setUsage(null)

    try {
      const result = await onTest(message)
      setResponse(result.response)
      setUsage(result.usage)
    } catch (err) {
      setError(err instanceof Error ? err.message : "テストに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const sampleMessages = [
    "営業時間を教えてください",
    "予約をキャンセルしたいです",
    "商品について質問があります"
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BeakerIcon className="h-5 w-5" />
          AIテスター
        </CardTitle>
        <CardDescription>
          設定したプロンプトでAI応答をテストできます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="testMessage">テストメッセージ</Label>
          <Textarea
            id="testMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="テストしたいメッセージを入力してください..."
            rows={4}
            className="resize-none"
          />
          <div className="flex flex-wrap gap-2">
            {sampleMessages.map((sample, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setMessage(sample)}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleTest}
          disabled={isLoading || !message.trim()}
          className="w-full"
        >
          {isLoading ? "応答生成中..." : "テスト実行"}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {response && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>AI応答</Label>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{response}</p>
                </div>
              </div>
            </div>

            {usage && (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">プロンプトトークン</p>
                  <p className="text-lg font-semibold">{usage.prompt_tokens || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">応答トークン</p>
                  <p className="text-lg font-semibold">{usage.completion_tokens || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">合計トークン</p>
                  <p className="text-lg font-semibold">{usage.total_tokens || 0}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
