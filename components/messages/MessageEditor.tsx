'use client'

import { useState, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FaceSmileIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { MessageType } from './MessageTypeSelector'

interface MessageEditorProps {
  type: MessageType
  content: string
  mediaUrl?: string | null
  flexJson?: string | null
  onChange: (field: string, value: string | null) => void
}

export function MessageEditor({ type, content, mediaUrl, flexJson, onChange }: MessageEditorProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      // TODO: ファイルをアップロード
      const reader = new FileReader()
      reader.onload = (event) => {
        onChange('mediaUrl', event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [onChange])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const insertVariable = (variable: string) => {
    const newContent = content + `{${variable}}`
    onChange('content', newContent)
  }

  if (type === 'text') {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="content">メッセージ内容</Label>
          <div className="mt-2 space-y-2">
            <Textarea
              id="content"
              value={content}
              onChange={(e) => onChange('content', e.target.value)}
              placeholder="メッセージを入力してください&#10;改行も入力できます"
              className="min-h-[200px] resize-y"
              maxLength={5000}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('name')}
                >
                  <FaceSmileIcon className="h-4 w-4 mr-1" />
                  名前を挿入
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('custom_field')}
                >
                  カスタムフィールドを挿入
                </Button>
              </div>
              <span>{content.length} / 5000</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            変数を使用できます: {'{name}'}, {'{custom_field}'}
          </p>
        </div>
      </div>
    )
  }

  if (type === 'image' || type === 'video') {
    return (
      <div className="space-y-4">
        <div>
          <Label>
            {type === 'image' ? '画像' : '動画'}アップロード
          </Label>
          <div
            className={`
              mt-2 border-2 border-dashed rounded-lg p-8 text-center
              transition-colors cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5' : 'border-muted'}
              ${mediaUrl ? 'bg-muted/20' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {mediaUrl ? (
              <div className="relative">
                {type === 'image' ? (
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                ) : (
                  <video
                    src={mediaUrl}
                    controls
                    className="max-h-64 mx-auto rounded-lg"
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  className="absolute top-2 right-2"
                  onClick={() => onChange('mediaUrl', null)}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {type === 'image' ? (
                  <PhotoIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                ) : (
                  <VideoCameraIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    ドラッグ&ドロップまたはクリックして{type === 'image' ? '画像' : '動画'}を選択
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {type === 'image' ? 'PNG, JPG, GIF (最大10MB)' : 'MP4, MOV (最大200MB)'}
                  </p>
                </div>
                <Input
                  type="file"
                  accept={type === 'image' ? 'image/*' : 'video/*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        onChange('mediaUrl', event.target?.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="max-w-xs mx-auto"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="caption">キャプション（任意）</Label>
          <Textarea
            id="caption"
            value={content}
            onChange={(e) => onChange('content', e.target.value)}
            placeholder="メッセージを入力してください"
            className="mt-2"
            maxLength={1000}
          />
        </div>
      </div>
    )
  }

  if (type === 'flex') {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="flexJson">Flex Message JSON</Label>
          <Textarea
            id="flexJson"
            value={flexJson || ''}
            onChange={(e) => onChange('flexJson', e.target.value)}
            placeholder={'{\n  "type": "bubble",\n  "body": {\n    "type": "box",\n    "layout": "vertical",\n    "contents": []\n  }\n}'}
            className="mt-2 min-h-[400px] font-mono text-sm"
          />
          <p className="text-sm text-muted-foreground mt-2">
            LINE Flex Messageのフォーマットに従ってJSONを入力してください
          </p>
        </div>
      </div>
    )
  }

  if (type === 'carousel') {
    return (
      <div className="space-y-4">
        <div className="border rounded-lg p-4 bg-muted/20">
          <p className="text-sm text-muted-foreground">
            カルーセルメッセージは現在準備中です。
          </p>
        </div>
      </div>
    )
  }

  return null
}
