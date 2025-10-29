'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Keyword, MatchType } from '@/types/auto-response'

interface KeywordInputProps {
  keywords: Keyword[]
  onChange: (keywords: Keyword[]) => void
}

export function KeywordInput({ keywords, onChange }: KeywordInputProps) {
  const [newKeyword, setNewKeyword] = useState('')
  const [matchType, setMatchType] = useState<MatchType>('partial')

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return

    const keyword: Keyword = {
      id: crypto.randomUUID(),
      text: newKeyword.trim(),
      matchType,
    }

    onChange([...keywords, keyword])
    setNewKeyword('')
  }

  const handleRemoveKeyword = (id: string) => {
    onChange(keywords.filter((k) => k.id !== id))
  }

  const handleUpdateMatchType = (id: string, matchType: MatchType) => {
    onChange(
      keywords.map((k) => (k.id === id ? { ...k, matchType } : k))
    )
  }

  const getMatchTypeLabel = (type: MatchType) => {
    switch (type) {
      case 'exact':
        return '完全一致'
      case 'partial':
        return '部分一致'
      case 'regex':
        return '正規表現'
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>キーワード</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="キーワードを入力"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddKeyword()
              }
            }}
          />
          <Select
            value={matchType}
            onValueChange={(value) => setMatchType(value as MatchType)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exact">完全一致</SelectItem>
              <SelectItem value="partial">部分一致</SelectItem>
              <SelectItem value="regex">正規表現</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" onClick={handleAddKeyword} size="icon">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            登録済みキーワード ({keywords.length})
          </Label>
          <div className="space-y-2">
            {keywords.map((keyword) => (
              <div
                key={keyword.id}
                className="flex items-center gap-2 p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{keyword.text}</div>
                  <div className="text-sm text-muted-foreground">
                    {getMatchTypeLabel(keyword.matchType)}
                  </div>
                </div>
                <Select
                  value={keyword.matchType}
                  onValueChange={(value) =>
                    handleUpdateMatchType(keyword.id, value as MatchType)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact">完全一致</SelectItem>
                    <SelectItem value="partial">部分一致</SelectItem>
                    <SelectItem value="regex">正規表現</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveKeyword(keyword.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
