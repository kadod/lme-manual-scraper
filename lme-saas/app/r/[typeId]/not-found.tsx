import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">予約ページが見つかりません</CardTitle>
          <CardDescription className="text-base">
            指定された予約タイプは存在しないか、現在公開されていません。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-6">
            URLが正しいかご確認いただくか、予約URLを再度ご確認ください。
          </p>
          <Button asChild variant="outline">
            <Link href="/">トップページへ戻る</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
