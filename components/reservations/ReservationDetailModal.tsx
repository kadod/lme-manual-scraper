"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReservationSlotData } from "./ReservationSlot"
import {
  UserIcon,
  ClockIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline"

interface ReservationDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: ReservationSlotData | null
  date?: Date
  onEdit?: () => void
  onCancel?: () => void
}

export function ReservationDetailModal({
  open,
  onOpenChange,
  reservation,
  date,
  onEdit,
  onCancel
}: ReservationDetailModalProps) {
  if (!reservation) return null

  const statusConfig = {
    available: { label: "空き", variant: "outline" as const },
    booked: { label: "予約済", variant: "default" as const },
    pending: { label: "保留中", variant: "secondary" as const },
    cancelled: { label: "キャンセル", variant: "destructive" as const }
  }

  const config = statusConfig[reservation.status]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            予約詳細
            <Badge variant={config.variant}>{config.label}</Badge>
          </DialogTitle>
          <DialogDescription>
            予約の詳細情報を確認・編集できます
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarIcon className="h-4 w-4" />
                <span>日付</span>
              </div>
              <p className="text-sm font-medium">
                {date ? date.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short'
                }) : '未設定'}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ClockIcon className="h-4 w-4" />
                <span>時間</span>
              </div>
              <p className="text-sm font-medium">{reservation.time}</p>
            </div>
          </div>

          {/* Customer Info */}
          {reservation.status !== 'available' && (
            <>
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <UserIcon className="h-4 w-4" />
                  <span>お客様情報</span>
                </div>
                <div className="space-y-3 ml-6">
                  <div>
                    <p className="text-xs text-gray-500">氏名</p>
                    <p className="text-sm font-medium">
                      {reservation.customerName || '未設定'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <PhoneIcon className="h-3 w-3" />
                      <span>電話番号</span>
                    </div>
                    <p className="text-sm">03-1234-5678</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <EnvelopeIcon className="h-3 w-3" />
                      <span>メールアドレス</span>
                    </div>
                    <p className="text-sm">customer@example.com</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {reservation.notes && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>備考</span>
                  </div>
                  <p className="text-sm ml-6 text-gray-700">
                    {reservation.notes}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {reservation.status === 'available' ? (
            <Button onClick={() => onOpenChange(false)} className="w-full">
              予約を作成
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button onClick={onEdit} className="flex-1">
                編集
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
