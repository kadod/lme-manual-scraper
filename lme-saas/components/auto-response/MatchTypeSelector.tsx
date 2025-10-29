'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MatchType } from '@/types/auto-response'

interface MatchTypeSelectorProps {
  value: MatchType
  onChange: (value: MatchType) => void
}

export function MatchTypeSelector({ value, onChange }: MatchTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>マッチタイプ</Label>
      <Select value={value} onValueChange={(v) => onChange(v as MatchType)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="exact">
            <div className="flex flex-col items-start">
              <div className="font-medium">完全一致</div>
              <div className="text-xs text-muted-foreground">
                キーワードと完全に一致する場合のみ反応
              </div>
            </div>
          </SelectItem>
          <SelectItem value="partial">
            <div className="flex flex-col items-start">
              <div className="font-medium">部分一致</div>
              <div className="text-xs text-muted-foreground">
                メッセージにキーワードが含まれていれば反応
              </div>
            </div>
          </SelectItem>
          <SelectItem value="regex">
            <div className="flex flex-col items-start">
              <div className="font-medium">正規表現</div>
              <div className="text-xs text-muted-foreground">
                正規表現パターンでマッチング
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
