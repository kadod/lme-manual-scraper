"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChatBubbleOvalLeftEllipsisIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"

interface PromptConfig {
  basePrompt: string
  characterSettings: string
  responseStyle: string
  forbiddenWords: string[]
}

interface PromptEditorProps {
  config: PromptConfig
  onConfigChange: (config: PromptConfig) => void
}

export function PromptEditor({ config, onConfigChange }: PromptEditorProps) {
  const addForbiddenWord = () => {
    onConfigChange({
      ...config,
      forbiddenWords: [...config.forbiddenWords, ""]
    })
  }

  const removeForbiddenWord = (index: number) => {
    const newWords = config.forbiddenWords.filter((_, i) => i !== index)
    onConfigChange({ ...config, forbiddenWords: newWords })
  }

  const updateForbiddenWord = (index: number, value: string) => {
    const newWords = [...config.forbiddenWords]
    newWords[index] = value
    onConfigChange({ ...config, forbiddenWords: newWords })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5" />
          システムプロンプト設定
        </CardTitle>
        <CardDescription>
          AIの振る舞いやキャラクターを定義します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="basePrompt">ベースプロンプト</Label>
          <Textarea
            id="basePrompt"
            value={config.basePrompt}
            onChange={(e) => onConfigChange({ ...config, basePrompt: e.target.value })}
            placeholder="あなたは親切なカスタマーサポートアシスタントです..."
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            AIの基本的な役割と目的を記述してください
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="characterSettings">キャラクター設定</Label>
          <Textarea
            id="characterSettings"
            value={config.characterSettings}
            onChange={(e) => onConfigChange({ ...config, characterSettings: e.target.value })}
            placeholder="丁寧で親しみやすい口調で話します..."
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            話し方や性格などの特徴を記述してください
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="responseStyle">応答スタイル</Label>
          <Textarea
            id="responseStyle"
            value={config.responseStyle}
            onChange={(e) => onConfigChange({ ...config, responseStyle: e.target.value })}
            placeholder="簡潔で分かりやすい回答を心がけます..."
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            応答の形式やトーンを記述してください
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>禁止ワード</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addForbiddenWord}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              追加
            </Button>
          </div>
          <div className="space-y-2">
            {config.forbiddenWords.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center border border-dashed rounded-lg">
                禁止ワードが設定されていません
              </p>
            ) : (
              config.forbiddenWords.map((word, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={word}
                    onChange={(e) => updateForbiddenWord(index, e.target.value)}
                    placeholder="禁止ワードを入力"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeForbiddenWord(index)}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500">
            AI応答に含めたくない単語を設定できます
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
