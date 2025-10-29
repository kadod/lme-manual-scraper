'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  RectangleGroupIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline'

interface TemplatePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: {
    id: string
    name: string
    category: string | null
    description: string | null
    type: 'text' | 'image' | 'video' | 'flex' | 'carousel'
    content: any
    variables: string[]
  } | null
}

const TYPE_ICONS = {
  text: DocumentTextIcon,
  image: PhotoIcon,
  video: VideoCameraIcon,
  flex: RectangleGroupIcon,
  carousel: ViewColumnsIcon,
}

const TYPE_LABELS = {
  text: 'テキスト',
  image: '画像',
  video: '動画',
  flex: 'Flexメッセージ',
  carousel: 'カルーセル',
}

export function TemplatePreviewDialog({
  open,
  onOpenChange,
  template,
}: TemplatePreviewDialogProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [previewContent, setPreviewContent] = useState<any>(null)

  useEffect(() => {
    if (template) {
      const defaultValues: Record<string, string> = {}
      template.variables.forEach((variable) => {
        if (variable === 'name') defaultValues[variable] = '山田太郎'
        else if (variable === 'line_user_id') defaultValues[variable] = 'U1234567890abcdef'
        else defaultValues[variable] = `{${variable}}`
      })
      setVariableValues(defaultValues)
    }
  }, [template])

  useEffect(() => {
    if (template) {
      let content = JSON.parse(JSON.stringify(template.content))
      const contentString = JSON.stringify(content)
      let replacedContent = contentString

      for (const [key, value] of Object.entries(variableValues)) {
        const regex = new RegExp(`\\{${key}\\}`, 'g')
        replacedContent = replacedContent.replace(regex, value)
      }

      setPreviewContent(JSON.parse(replacedContent))
    }
  }, [template, variableValues])

  if (!template) return null

  const TypeIcon = TYPE_ICONS[template.type]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TypeIcon className="h-5 w-5 text-muted-foreground" />
            <DialogTitle>{template.name}</DialogTitle>
            <Badge variant="outline">{template.category || 'その他'}</Badge>
          </div>
          {template.description && (
            <DialogDescription>{template.description}</DialogDescription>
          )}
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">プレビュー</TabsTrigger>
            <TabsTrigger value="raw">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            {template.variables.length > 0 && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <Label className="text-sm font-semibold">変数値 (プレビュー用)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {template.variables.map((variable) => (
                    <div key={variable} className="space-y-1">
                      <Label htmlFor={`var-${variable}`} className="text-xs">
                        {`{${variable}}`}
                      </Label>
                      <Input
                        id={`var-${variable}`}
                        value={variableValues[variable] || ''}
                        onChange={(e) =>
                          setVariableValues({ ...variableValues, [variable]: e.target.value })
                        }
                        placeholder={`${variable}の値`}
                        size={30}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-semibold">メッセージプレビュー</Label>
              <div className="border rounded-lg p-4 bg-white min-h-[200px]">
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <div className="bg-[#06c755] text-white p-3 rounded-t-lg">
                      <p className="text-sm font-semibold">LINE Bot</p>
                    </div>
                    <div className="border border-t-0 rounded-b-lg p-4 bg-gray-50">
                      {template.type === 'text' && previewContent && (
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {previewContent.text}
                          </p>
                        </div>
                      )}
                      {template.type === 'image' && previewContent && (
                        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={previewContent.previewImageUrl || previewContent.originalContentUrl}
                            alt="Preview"
                            className="w-full"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImage Preview%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                      )}
                      {template.type === 'video' && previewContent && (
                        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={previewContent.previewImageUrl}
                            alt="Video Preview"
                            className="w-full"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EVideo Preview%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                      )}
                      {(template.type === 'flex' || template.type === 'carousel') && (
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-muted-foreground mb-2">
                            {TYPE_LABELS[template.type]}メッセージ
                          </p>
                          <div className="text-xs font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                            <pre>{JSON.stringify(previewContent, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="space-y-2">
            <Label className="text-sm font-semibold">テンプレート情報</Label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-semibold">タイプ:</div>
                <div>{TYPE_LABELS[template.type]}</div>
                <div className="font-semibold">カテゴリ:</div>
                <div>{template.category || 'その他'}</div>
                <div className="font-semibold">変数:</div>
                <div>
                  {template.variables.length > 0
                    ? template.variables.map((v) => `{${v}}`).join(', ')
                    : 'なし'}
                </div>
              </div>
            </div>

            <Label className="text-sm font-semibold mt-4">Content JSON</Label>
            <div className="border rounded-lg p-4 bg-muted">
              <pre className="text-xs font-mono overflow-x-auto">
                {JSON.stringify(template.content, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
