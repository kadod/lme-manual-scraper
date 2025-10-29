"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, XMarkIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline"

interface ResponseRule {
  id: string
  keywords: string[]
  condition: {
    type: "tag" | "segment" | "always"
    value: string
  }
  priority: number
}

interface AIResponseRulesProps {
  rules: ResponseRule[]
  onRulesChange: (rules: ResponseRule[]) => void
}

export function AIResponseRules({ rules, onRulesChange }: AIResponseRulesProps) {
  const addRule = () => {
    const newRule: ResponseRule = {
      id: Date.now().toString(),
      keywords: [""],
      condition: { type: "always", value: "" },
      priority: rules.length + 1
    }
    onRulesChange([...rules, newRule])
  }

  const removeRule = (id: string) => {
    onRulesChange(rules.filter(rule => rule.id !== id))
  }

  const updateRule = (id: string, updates: Partial<ResponseRule>) => {
    onRulesChange(rules.map(rule =>
      rule.id === id ? { ...rule, ...updates } : rule
    ))
  }

  const addKeyword = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId)
    if (rule) {
      updateRule(ruleId, { keywords: [...rule.keywords, ""] })
    }
  }

  const removeKeyword = (ruleId: string, index: number) => {
    const rule = rules.find(r => r.id === ruleId)
    if (rule) {
      updateRule(ruleId, { keywords: rule.keywords.filter((_, i) => i !== index) })
    }
  }

  const updateKeyword = (ruleId: string, index: number, value: string) => {
    const rule = rules.find(r => r.id === ruleId)
    if (rule) {
      const newKeywords = [...rule.keywords]
      newKeywords[index] = value
      updateRule(ruleId, { keywords: newKeywords })
    }
  }

  const movePriority = (id: string, direction: "up" | "down") => {
    const index = rules.findIndex(r => r.id === id)
    if (index === -1) return

    const newRules = [...rules]
    if (direction === "up" && index > 0) {
      [newRules[index], newRules[index - 1]] = [newRules[index - 1], newRules[index]]
    } else if (direction === "down" && index < rules.length - 1) {
      [newRules[index], newRules[index + 1]] = [newRules[index + 1], newRules[index]]
    }

    onRulesChange(newRules.map((rule, idx) => ({ ...rule, priority: idx + 1 })))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI応答ルール</CardTitle>
            <CardDescription>
              AI応答を使用する条件を設定します
            </CardDescription>
          </div>
          <Button onClick={addRule} size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            ルール追加
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-sm text-gray-500">
              ルールが設定されていません
            </p>
          </div>
        ) : (
          rules.map((rule, index) => (
            <div
              key={rule.id}
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    優先度 {index + 1}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => movePriority(rule.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUpIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => movePriority(rule.id, "down")}
                      disabled={index === rules.length - 1}
                    >
                      <ArrowDownIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeRule(rule.id)}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>キーワード</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addKeyword(rule.id)}
                  >
                    <PlusIcon className="h-3 w-3 mr-1" />
                    追加
                  </Button>
                </div>
                <div className="space-y-2">
                  {rule.keywords.map((keyword, keywordIndex) => (
                    <div key={keywordIndex} className="flex items-center gap-2">
                      <Input
                        value={keyword}
                        onChange={(e) => updateKeyword(rule.id, keywordIndex, e.target.value)}
                        placeholder="例: 予約、質問、問い合わせ"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeKeyword(rule.id, keywordIndex)}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>条件タイプ</Label>
                  <Select
                    value={rule.condition.type}
                    onValueChange={(value) =>
                      updateRule(rule.id, {
                        condition: { ...rule.condition, type: value as any }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">常に適用</SelectItem>
                      <SelectItem value="tag">タグ指定</SelectItem>
                      <SelectItem value="segment">セグメント指定</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {rule.condition.type !== "always" && (
                  <div className="space-y-2">
                    <Label>条件値</Label>
                    <Input
                      value={rule.condition.value}
                      onChange={(e) =>
                        updateRule(rule.id, {
                          condition: { ...rule.condition, value: e.target.value }
                        })
                      }
                      placeholder={
                        rule.condition.type === "tag"
                          ? "タグ名を入力"
                          : "セグメント名を入力"
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
