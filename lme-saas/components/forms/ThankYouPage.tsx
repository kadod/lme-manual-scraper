'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface ThankYouPageProps {
  message: string
  redirectUrl?: string | null
}

export function ThankYouPage({ message, redirectUrl }: ThankYouPageProps) {
  useEffect(() => {
    if (redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [redirectUrl])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center py-8 px-4">
      <Card className="max-w-lg w-full shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">送信完了</h2>
            <p className="text-muted-foreground">{message}</p>
          </div>

          {redirectUrl && (
            <div className="text-sm text-muted-foreground">
              <p>3秒後に自動的にリダイレクトします...</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {redirectUrl && (
              <Button
                onClick={() => window.location.href = redirectUrl}
                className="w-full sm:w-auto"
              >
                今すぐ移動
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto"
            >
              新しい回答を送信
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
