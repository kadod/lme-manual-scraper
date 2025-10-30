"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AIConfigForm } from "@/components/auto-response/AIConfigForm"
import { PromptEditor } from "@/components/auto-response/PromptEditor"
import { ContextSettings } from "@/components/auto-response/ContextSettings"
import { FallbackSettings } from "@/components/auto-response/FallbackSettings"
import { AIResponseRules } from "@/components/auto-response/AIResponseRules"
import { AITester } from "@/components/auto-response/AITester"
import { AIUsageStats } from "@/components/auto-response/AIUsageStats"
import { SparklesIcon } from "@heroicons/react/24/outline"

export default function AIAutoResponsePage() {
  const [aiConfig, setAiConfig] = useState({
    apiKey: "",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 500
  })

  const [promptConfig, setPromptConfig] = useState({
    basePrompt: "あなたは親切なカスタマーサポートアシスタントです。ユーザーの質問に対して、正確で分かりやすい回答を提供してください。",
    characterSettings: "丁寧で親しみやすい口調で話します。専門用語は避け、誰にでも理解できる言葉を使用します。",
    responseStyle: "簡潔で分かりやすい回答を心がけます。必要に応じて箇条書きや段落分けを使用します。",
    forbiddenWords: [] as string[]
  })

  const [contextConfig, setContextConfig] = useState({
    conversationHistoryCount: 10,
    autoInjectUserInfo: true,
    useCustomFields: true
  })

  const [fallbackConfig, setFallbackConfig] = useState({
    defaultResponse: "申し訳ございません。現在、応答できません。しばらくしてから再度お試しいただくか、スタッフまでお問い合わせください。",
    timeout: 30,
    retryCount: 2
  })

  const [responseRules, setResponseRules] = useState<Array<{
    id: string;
    keywords: string[];
    condition: { type: "tag" | "segment" | "always"; value: string };
    priority: number;
  }>>([
    {
      id: "1",
      keywords: ["予約", "予約したい"],
      condition: { type: "always", value: "" },
      priority: 1
    }
  ])

  const [usageStats] = useState({
    totalTokens: 45230,
    apiCalls: 156,
    estimatedCost: 342.5,
    errorRate: 2.3,
    lastUpdated: new Date().toISOString()
  })

  const handleSaveConfig = async () => {
    console.log("Saving AI config:", aiConfig)
    // TODO: Implement save to database
  }

  const handleTest = async (message: string) => {
    console.log("Testing with message:", message)
    // TODO: Implement actual API call

    // Simulate API response
    await new Promise(resolve => setTimeout(resolve, 1500))

    return {
      response: `これはテスト応答です。入力されたメッセージ「${message}」に対する応答をシミュレーションしています。実際の設定では、OpenAI APIを使用してリアルタイムで応答が生成されます。`,
      usage: {
        prompt_tokens: 120,
        completion_tokens: 85,
        total_tokens: 205
      }
    }
  }

  const handleSaveAll = async () => {
    console.log("Saving all configurations:", {
      aiConfig,
      promptConfig,
      contextConfig,
      fallbackConfig,
      responseRules
    })
    // TODO: Implement save all to database
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SparklesIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI応答設定</h1>
        </div>
        <p className="text-gray-600">
          OpenAI APIを使用した自動応答の設定を行います
        </p>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="api">API設定</TabsTrigger>
          <TabsTrigger value="prompt">プロンプト</TabsTrigger>
          <TabsTrigger value="rules">応答ルール</TabsTrigger>
          <TabsTrigger value="test">テスト</TabsTrigger>
          <TabsTrigger value="stats">使用状況</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6">
          <AIConfigForm
            config={aiConfig}
            onConfigChange={setAiConfig}
            onSave={handleSaveConfig}
          />
          <ContextSettings
            config={contextConfig}
            onConfigChange={setContextConfig}
          />
          <FallbackSettings
            config={fallbackConfig}
            onConfigChange={setFallbackConfig}
          />
        </TabsContent>

        <TabsContent value="prompt" className="space-y-6">
          <PromptEditor
            config={promptConfig}
            onConfigChange={setPromptConfig}
          />
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <AIResponseRules
            rules={responseRules}
            onRulesChange={setResponseRules}
          />
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <AITester onTest={handleTest} />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              テスト機能について
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 現在の設定でAI応答をテストできます</li>
              <li>• APIキーが設定されている場合、実際にOpenAI APIを呼び出します</li>
              <li>• トークン使用量とコストの見積もりが表示されます</li>
              <li>• テスト結果は統計に含まれません</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <AIUsageStats stats={usageStats} />

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              使用状況の更新について
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              使用状況は1時間ごとに自動更新されます。リアルタイムの使用状況を確認したい場合は、下のボタンをクリックしてください。
            </p>
            <Button variant="outline">
              今すぐ更新
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end gap-4">
        <Button variant="outline">
          キャンセル
        </Button>
        <Button onClick={handleSaveAll}>
          すべての設定を保存
        </Button>
      </div>
    </div>
  )
}
