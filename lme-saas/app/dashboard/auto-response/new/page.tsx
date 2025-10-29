'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RuleTypeSelector } from '@/components/auto-response/RuleTypeSelector'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function NewAutoResponseRulePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const type = searchParams.get('type')

  useEffect(() => {
    if (!type) {
      setShowTypeSelector(true)
    }
  }, [type])

  if (!type) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/auto-response">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">新規ルール作成</h1>
            <p className="text-muted-foreground mt-2">
              ルールタイプを選択してください
            </p>
          </div>
        </div>

        <RuleTypeSelector
          open={showTypeSelector}
          onOpenChange={(open) => {
            setShowTypeSelector(open)
            if (!open) {
              router.push('/dashboard/auto-response')
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/auto-response">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {type === 'keyword' && 'キーワードルール作成'}
            {type === 'scenario' && 'シナリオルール作成'}
            {type === 'ai' && 'AIルール作成'}
          </h1>
          <p className="text-muted-foreground mt-2">
            ルールの詳細を設定してください
          </p>
        </div>
      </div>

      <div className="bg-accent/50 border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          ルール作成フォームは次のフェーズで実装されます
        </p>
      </div>
    </div>
  )
}
