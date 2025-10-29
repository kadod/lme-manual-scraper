'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  RectangleGroupIcon,
  ViewColumnsIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface Template {
  id: string
  name: string
  category: string | null
  description: string | null
  type: 'text' | 'image' | 'video' | 'flex' | 'carousel'
  content: any
  variables: string[]
}

interface TemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: Template[]
  onSelect: (template: Template, variableValues: Record<string, string>) => void
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
  flex: 'Flex',
  carousel: 'カルーセル',
}

export function TemplateSelector({
  open,
  onOpenChange,
  templates,
  onSelect,
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})

  const filteredTemplates = templates.filter(
    (template) =>
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    if (selectedTemplate) {
      const defaultValues: Record<string, string> = {}
      selectedTemplate.variables.forEach((variable) => {
        if (variable === 'name') defaultValues[variable] = ''
        else if (variable === 'line_user_id') defaultValues[variable] = ''
        else defaultValues[variable] = ''
      })
      setVariableValues(defaultValues)
    }
  }, [selectedTemplate])

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate, variableValues)
      setSelectedTemplate(null)
      setVariableValues({})
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setSelectedTemplate(null)
    setVariableValues({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>テンプレートを選択</DialogTitle>
          <DialogDescription>
            {selectedTemplate
              ? '変数の値を入力してください'
              : 'メッセージテンプレートを選択してください'}
          </DialogDescription>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="space-y-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="テンプレートを検索..."
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredTemplates.map((template) => {
                  const TypeIcon = TYPE_ICONS[template.type]
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={cn(
                        'w-full text-left p-4 rounded-lg border hover:border-primary hover:bg-accent transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <TypeIcon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{template.name}</h4>
                            {template.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {template.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {TYPE_LABELS[template.type]}
                              </Badge>
                              {template.category && (
                                <Badge variant="outline" className="text-xs">
                                  {template.category}
                                </Badge>
                              )}
                              {template.variables.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  変数: {template.variables.length}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>テンプレートが見つかりません</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const TypeIcon = TYPE_ICONS[selectedTemplate.type]
                  return <TypeIcon className="h-5 w-5 text-muted-foreground" />
                })()}
                <h4 className="font-semibold">{selectedTemplate.name}</h4>
              </div>
              {selectedTemplate.description && (
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              )}
            </div>

            {selectedTemplate.variables.length > 0 ? (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">変数の値を入力</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable} className="space-y-1">
                      <Label htmlFor={`var-${variable}`} className="text-xs">
                        {`{${variable}}`}
                        {variable === 'name' && ' (友だち名)'}
                        {variable === 'line_user_id' && ' (LINE ID)'}
                      </Label>
                      <Input
                        id={`var-${variable}`}
                        value={variableValues[variable] || ''}
                        onChange={(e) =>
                          setVariableValues({ ...variableValues, [variable]: e.target.value })
                        }
                        placeholder={
                          variable === 'name'
                            ? '送信時に自動挿入されます'
                            : variable === 'line_user_id'
                            ? '送信時に自動挿入されます'
                            : `${variable}の値`
                        }
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  ※ name と line_user_id は送信時に各友だちの情報が自動的に挿入されます
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                このテンプレートには変数がありません
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
              >
                戻る
              </Button>
              <Button onClick={handleSelect}>このテンプレートを使用</Button>
            </DialogFooter>
          </div>
        )}

        {!selectedTemplate && (
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              キャンセル
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
