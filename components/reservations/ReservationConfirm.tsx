'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, ClockIcon, UserIcon, EnvelopeIcon, PhoneIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { ReservationType, SlotWithAvailability } from '@/app/actions/public-reservations'

interface ReservationConfirmProps {
  reservationType: ReservationType
  slot: SlotWithAvailability
  formData: {
    customer_name: string
    customer_email: string
    customer_phone?: string
    customer_memo?: string
  }
  onConfirm: () => void
  onBack: () => void
  loading: boolean
}

export function ReservationConfirm({
  reservationType,
  slot,
  formData,
  onConfirm,
  onBack,
  loading
}: ReservationConfirmProps) {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ja })
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy年M月d日(E)', { locale: ja })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>予約内容の確認</CardTitle>
          <CardDescription>
            以下の内容で予約を確定します。内容をご確認ください。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">予約タイプ</p>
                <p className="text-base">{reservationType.name}</p>
                {reservationType.description && (
                  <p className="text-sm text-muted-foreground">{reservationType.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">日時</p>
                <p className="text-base">{formatDate(slot.start_time)}</p>
                <p className="text-base font-semibold">
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </p>
                <p className="text-sm text-muted-foreground">
                  所要時間: {reservationType.duration_minutes}分
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h3 className="font-medium">予約者情報</h3>

            <div className="flex items-start gap-3">
              <UserIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">お名前</p>
                <p className="text-base">{formData.customer_name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <EnvelopeIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">メールアドレス</p>
                <p className="text-base">{formData.customer_email}</p>
              </div>
            </div>

            {formData.customer_phone && (
              <div className="flex items-start gap-3">
                <PhoneIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">電話番号</p>
                  <p className="text-base">{formData.customer_phone}</p>
                </div>
              </div>
            )}

            {formData.customer_memo && (
              <div className="flex items-start gap-3">
                <DocumentTextIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">備考</p>
                  <p className="text-base whitespace-pre-wrap">{formData.customer_memo}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          戻る
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="w-full sm:flex-1"
        >
          {loading ? '予約中...' : '予約を確定する'}
        </Button>
      </div>
    </div>
  )
}
