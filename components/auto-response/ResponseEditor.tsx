'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ResponseContent } from '@/types/auto-response'

interface ResponseEditorProps {
  response: ResponseContent
  onChange: (response: ResponseContent) => void
  templates?: Array<{ id: string; name: string; type: string }>
}

export function ResponseEditor({
  response,
  onChange,
  templates = [],
}: ResponseEditorProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'template' | 'flex'>(
    response.type
  )

  const handleTabChange = (value: string) => {
    const type = value as 'text' | 'template' | 'flex'
    setActiveTab(type)
    onChange({ ...response, type })
  }

  const handleTextChange = (text: string) => {
    onChange({ ...response, text })
  }

  const handleTemplateChange = (templateId: string) => {
    onChange({ ...response, templateId })
  }

  const handleFlexJsonChange = (flexJson: string) => {
    onChange({ ...response, flexJson })
  }

  const insertVariable = (variable: string) => {
    const currentText = response.text || ''
    const newText = currentText + `{${variable}}`
    onChange({ ...response, text: newText })
  }

  const variables = [
    { name: 'name', label: '友だち名' },
    { name: 'tag', label: 'タグ' },
    { name: 'keyword', label: 'マッチしたキーワード' },
  ]

  return (
    <div className="space-y-4">
      <Label>応答内容</Label>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">テキスト</TabsTrigger>
          <TabsTrigger value="template">テンプレート</TabsTrigger>
          <TabsTrigger value="flex">Flexメッセージ</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <div>
            <Textarea
              value={response.text || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="応答メッセージを入力してください"
              rows={6}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground mt-2">
              変数を使用できます: {'{name}'}, {'{tag}'}, {'{keyword}'}
            </p>
          </div>

          <div>
            <Label className="text-sm">変数挿入</Label>
            <div className="flex gap-2 mt-2">
              {variables.map((variable) => (
                <Button
                  key={variable.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable(variable.name)}
                >
                  {variable.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <Label className="text-sm text-muted-foreground">プレビュー</Label>
            <div className="mt-2 whitespace-pre-wrap">
              {response.text || 'プレビューが表示されます'}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="template" className="space-y-4">
          <div>
            <Label>テンプレート選択</Label>
            <Select
              value={response.templateId || ''}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="テンプレートを選択" />
              </SelectTrigger>
              <SelectContent>
                {templates.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    テンプレートがありません
                  </div>
                ) : (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col items-start">
                        <div>{template.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.type}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="flex" className="space-y-4">
          <div>
            <Label>Flex Message JSON</Label>
            <Textarea
              value={response.flexJson || ''}
              onChange={(e) => handleFlexJsonChange(e.target.value)}
              placeholder='{"type": "bubble", "body": {...}}'
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground mt-2">
              LINE Flex Message Simulator で作成したJSONを貼り付けてください
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
