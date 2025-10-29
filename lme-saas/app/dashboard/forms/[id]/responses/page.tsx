'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ResponseStats } from '@/components/forms/ResponseStats'
import { ResponseList } from '@/components/forms/ResponseList'
import {
  getFormResponses,
  getFormStats,
  deleteFormResponse,
  FormResponse,
  FormStats,
} from '@/app/actions/forms'

export default function FormResponsesPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  const [responses, setResponses] = useState<FormResponse[]>([])
  const [stats, setStats] = useState<FormStats>({
    totalResponses: 0,
    responseRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<{
    startDate?: string
    endDate?: string
    searchTerm?: string
  }>({})

  useEffect(() => {
    loadData()
  }, [formId, filters])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [responsesResult, statsResult] = await Promise.all([
        getFormResponses(formId, filters),
        getFormStats(formId),
      ])

      if (responsesResult.success) {
        setResponses(responsesResult.data || [])
      } else {
        console.error('Failed to load responses:', responsesResult.error)
      }

      if (statsResult.success) {
        setStats(statsResult.data)
      } else {
        console.error('Failed to load stats:', statsResult.error)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (newFilters: {
    startDate?: string
    endDate?: string
    searchTerm?: string
  }) => {
    setFilters(newFilters)
  }

  const handleDelete = async (responseId: string) => {
    const result = await deleteFormResponse(responseId)
    if (result.success) {
      await loadData()
    } else {
      alert('削除に失敗しました: ' + result.error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/forms')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">フォーム回答</h1>
            <p className="text-muted-foreground mt-1">
              フォームに寄せられた回答を確認・管理できます
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <ResponseStats stats={stats} />

        <ResponseList
          formId={formId}
          responses={responses}
          onFilterChange={handleFilterChange}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
