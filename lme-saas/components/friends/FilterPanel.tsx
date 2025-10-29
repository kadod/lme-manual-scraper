'use client'

import { FunnelIcon } from '@heroicons/react/24/outline'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useCallback } from 'react'

export function FilterPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const status = searchParams.get('status') || 'all'
  const lastInteractionDays = searchParams.get('lastInteractionDays') || 'all'

  const handleFilterChange = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    params.set('page', '1') // Reset to first page on filter

    startTransition(() => {
      router.push(`/dashboard/friends?${params.toString()}`)
    })
  }, [router, searchParams])

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <FunnelIcon className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">フィルター:</span>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="status" className="text-sm">
          ステータス
        </Label>
        <Select
          value={status}
          onValueChange={(value) => handleFilterChange('status', value)}
          disabled={isPending}
        >
          <SelectTrigger id="status" className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="active">アクティブ</SelectItem>
            <SelectItem value="blocked">ブロック</SelectItem>
            <SelectItem value="unsubscribed">配信停止</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="last-interaction" className="text-sm">
          最終接触日
        </Label>
        <Select
          value={lastInteractionDays}
          onValueChange={(value) => handleFilterChange('lastInteractionDays', value)}
          disabled={isPending}
        >
          <SelectTrigger id="last-interaction" className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="7">7日以内</SelectItem>
            <SelectItem value="30">30日以内</SelectItem>
            <SelectItem value="90">90日以内</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
