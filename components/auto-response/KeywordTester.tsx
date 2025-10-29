'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Keyword } from '@/types/auto-response'

interface KeywordTesterProps {
  keywords: Keyword[]
}

export function KeywordTester({ keywords }: KeywordTesterProps) {
  const [testMessage, setTestMessage] = useState('')
  const [matchResult, setMatchResult] = useState<{
    matched: boolean
    keyword?: Keyword
  } | null>(null)

  const handleTest = () => {
    if (!testMessage.trim()) {
      setMatchResult(null)
      return
    }

    for (const keyword of keywords) {
      let matched = false

      switch (keyword.matchType) {
        case 'exact':
          matched = testMessage.trim() === keyword.text
          break
        case 'partial':
          matched = testMessage.includes(keyword.text)
          break
        case 'regex':
          try {
            const regex = new RegExp(keyword.text)
            matched = regex.test(testMessage)
          } catch (e) {
            // Invalid regex
            matched = false
          }
          break
      }

      if (matched) {
        setMatchResult({ matched: true, keyword })
        return
      }
    }

    setMatchResult({ matched: false })
  }

  const getMatchTypeLabel = (type: Keyword['matchType']) => {
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
    <Card>
      <CardHeader>
        <CardTitle>キーワードマッチテスト</CardTitle>
        <CardDescription>
          メッセージを入力してキーワードがマッチするか確認できます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>テストメッセージ</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="テストメッセージを入力"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleTest()
                }
              }}
            />
            <Button
              type="button"
              onClick={handleTest}
              disabled={!testMessage.trim() || keywords.length === 0}
            >
              テスト
            </Button>
          </div>
        </div>

        {matchResult && (
          <Alert
            variant={matchResult.matched ? 'default' : 'destructive'}
            className={
              matchResult.matched
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
            }
          >
            <div className="flex items-start gap-3">
              {matchResult.matched ? (
                <CheckIcon className="h-5 w-5 text-green-600" />
              ) : (
                <XMarkIcon className="h-5 w-5 text-red-600" />
              )}
              <div className="flex-1">
                <AlertDescription>
                  {matchResult.matched ? (
                    <div className="space-y-2">
                      <div className="font-semibold text-green-900">
                        マッチしました
                      </div>
                      {matchResult.keyword && (
                        <div className="text-sm text-green-800">
                          <div>キーワード: {matchResult.keyword.text}</div>
                          <div>
                            マッチタイプ:{' '}
                            {getMatchTypeLabel(matchResult.keyword.matchType)}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-900">
                      どのキーワードにもマッチしませんでした
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {keywords.length === 0 && (
          <Alert>
            <AlertDescription className="text-muted-foreground">
              キーワードを追加してください
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
