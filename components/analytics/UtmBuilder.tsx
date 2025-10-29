'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface UtmParameters {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

interface UtmBuilderProps {
  onUtmChange: (utm: UtmParameters) => void
  initialUtm?: UtmParameters
}

const UTM_INFO = {
  source: 'トラフィックの発生源（例：google, facebook, newsletter）',
  medium: 'メディアの種類（例：cpc, email, social）',
  campaign: 'キャンペーン名（例：summer_sale, product_launch）',
  term: '検索キーワード（主に有料検索で使用）',
  content: '同じキャンペーン内での区別（例：banner_a, link_text）',
}

export function UtmBuilder({ onUtmChange, initialUtm = {} }: UtmBuilderProps) {
  const [utm, setUtm] = useState<UtmParameters>(initialUtm)

  const handleChange = (field: keyof UtmParameters, value: string) => {
    const newUtm = { ...utm, [field]: value || undefined }
    setUtm(newUtm)
    onUtmChange(newUtm)
  }

  const handleReset = () => {
    setUtm({})
    onUtmChange({})
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">UTMパラメータ</CardTitle>
        <CardDescription>
          トラッキング用のパラメータを設定します（オプション）
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="utm_source">ソース</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <InformationCircleIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="text-sm">
                {UTM_INFO.source}
              </PopoverContent>
            </Popover>
          </div>
          <Input
            id="utm_source"
            placeholder="例：google, facebook"
            value={utm.utm_source || ''}
            onChange={(e) => handleChange('utm_source', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="utm_medium">メディア</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <InformationCircleIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="text-sm">
                {UTM_INFO.medium}
              </PopoverContent>
            </Popover>
          </div>
          <Input
            id="utm_medium"
            placeholder="例：cpc, email, social"
            value={utm.utm_medium || ''}
            onChange={(e) => handleChange('utm_medium', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="utm_campaign">キャンペーン</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <InformationCircleIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="text-sm">
                {UTM_INFO.campaign}
              </PopoverContent>
            </Popover>
          </div>
          <Input
            id="utm_campaign"
            placeholder="例：summer_sale"
            value={utm.utm_campaign || ''}
            onChange={(e) => handleChange('utm_campaign', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="utm_term">検索キーワード</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <InformationCircleIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="text-sm">
                {UTM_INFO.term}
              </PopoverContent>
            </Popover>
          </div>
          <Input
            id="utm_term"
            placeholder="例：running+shoes"
            value={utm.utm_term || ''}
            onChange={(e) => handleChange('utm_term', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="utm_content">コンテンツ</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <InformationCircleIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="text-sm">
                {UTM_INFO.content}
              </PopoverContent>
            </Popover>
          </div>
          <Input
            id="utm_content"
            placeholder="例：banner_a"
            value={utm.utm_content || ''}
            onChange={(e) => handleChange('utm_content', e.target.value)}
          />
        </div>

        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            リセット
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
