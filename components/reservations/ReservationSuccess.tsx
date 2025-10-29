'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircleIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { ReservationType, Reservation } from '@/app/actions/public-reservations'

interface ReservationSuccessProps {
  reservationType: ReservationType
  reservation: Reservation
}

export function ReservationSuccess({ reservationType, reservation }: ReservationSuccessProps) {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ja })
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy年M月d日(E)', { locale: ja })
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircleIcon className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">予約が完了しました</CardTitle>
          <CardDescription className="text-base">
            予約確認メールを {reservation.customer_email} に送信しました。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">予約内容</p>
                <p className="text-lg font-semibold">{reservationType.name}</p>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-medium text-muted-foreground mb-1">日時</p>
              <p className="text-lg font-semibold">
                {/* Use slot start_time from reservation */}
                {reservation.created_at && formatDate(reservation.created_at)}
              </p>
              <p className="text-base">
                所要時間: {reservationType.duration_minutes}分
              </p>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-medium text-muted-foreground mb-1">予約番号</p>
              <p className="text-base font-mono">{reservation.id}</p>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-medium text-muted-foreground mb-1">予約者名</p>
              <p className="text-base">{reservation.customer_name}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">ご予約に関する注意事項</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 予約確認メールが届かない場合は、迷惑メールフォルダをご確認ください</li>
              <li>• キャンセルや変更は予約確認メールのリンクから行えます</li>
              <li>• ご不明な点がございましたら、お気軽にお問い合わせください</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => window.close()}
          className="w-full sm:w-auto"
        >
          閉じる
        </Button>
      </div>
    </div>
  )
}
