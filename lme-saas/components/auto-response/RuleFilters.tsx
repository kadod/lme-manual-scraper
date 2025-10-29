'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

export function RuleFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (type && type !== 'all') params.set('type', type)
    if (status && status !== 'all') params.set('status', status)

    router.push(`/dashboard/auto-response?${params.toString()}`)
  }

  const handleClear = () => {
    setSearch('')
    setType('all')
    setStatus('all')
    router.push('/dashboard/auto-response')
  }

  const hasFilters = search || (type && type !== 'all') || (status && status !== 'all')

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="ルール名で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-10"
        />
      </div>

      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="タイプ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべてのタイプ</SelectItem>
          <SelectItem value="keyword">キーワード</SelectItem>
          <SelectItem value="scenario">シナリオ</SelectItem>
          <SelectItem value="ai">AI</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="ステータス" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          <SelectItem value="active">有効</SelectItem>
          <SelectItem value="inactive">無効</SelectItem>
          <SelectItem value="expired">期限切れ</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Button onClick={handleSearch}>
          <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
          検索
        </Button>
        {hasFilters && (
          <Button variant="outline" onClick={handleClear}>
            <XMarkIcon className="h-5 w-5 mr-2" />
            クリア
          </Button>
        )}
      </div>
    </div>
  )
}
