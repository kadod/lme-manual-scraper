'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ReservationStatusBadge } from './ReservationStatusBadge'
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline'
import type { Reservation } from '@/app/actions/reservations'

interface ReservationDetailProps {
  reservation: Reservation | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (id: string, status: 'confirmed' | 'cancelled') => Promise<void>
}

export function ReservationDetail({
  reservation,
  open,
  onOpenChange,
  onStatusChange,
}: ReservationDetailProps) {
  if (!reservation) return null

  const handleStatusChange = async (status: 'confirmed' | 'cancelled') => {
    await onStatusChange(reservation.id, status)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reservation Details</DialogTitle>
          <DialogDescription>View and manage reservation information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {reservation.reservation_type?.name || 'Reservation'}
              </h3>
              <ReservationStatusBadge status={reservation.status} />
            </div>
          </div>

          <div className="grid gap-4">
            {reservation.slot && (
              <>
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Date</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(reservation.slot.start_time), 'PPP', {
                        locale: ja,
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ClockIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Time</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(reservation.slot.start_time), 'HH:mm', {
                        locale: ja,
                      })}
                      -
                      {reservation.slot.end_time &&
                        format(new Date(reservation.slot.end_time), 'HH:mm', {
                          locale: ja,
                        })}
                      {reservation.reservation_type?.duration_minutes && (
                        <span className="ml-2">
                          ({reservation.reservation_type.duration_minutes} min)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-start gap-3">
              <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Customer</div>
                <div className="text-sm text-muted-foreground">
                  {reservation.customer_name}
                  {reservation.friend && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      LINE Friend
                    </span>
                  )}
                </div>
              </div>
            </div>

            {reservation.customer_email && (
              <div className="flex items-start gap-3">
                <EnvelopeIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">
                    {reservation.customer_email}
                  </div>
                </div>
              </div>
            )}

            {reservation.customer_phone && (
              <div className="flex items-start gap-3">
                <PhoneIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Phone</div>
                  <div className="text-sm text-muted-foreground">
                    {reservation.customer_phone}
                  </div>
                </div>
              </div>
            )}

            {reservation.notes && (
              <div className="flex items-start gap-3">
                <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Notes</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {reservation.notes}
                  </div>
                </div>
              </div>
            )}

            {reservation.reservation_type?.description && (
              <div className="pt-4 border-t">
                <div className="font-medium mb-2">Reservation Type Description</div>
                <div className="text-sm text-muted-foreground">
                  {reservation.reservation_type.description}
                </div>
              </div>
            )}

            {reservation.created_at && (
              <div className="pt-4 border-t text-xs text-muted-foreground">
                <div>Created: {format(new Date(reservation.created_at), 'PPp', { locale: ja })}</div>
                {reservation.cancelled_at && (
                  <div>Cancelled: {format(new Date(reservation.cancelled_at), 'PPp', { locale: ja })}</div>
                )}
                {reservation.confirmed_at && (
                  <div>Confirmed: {format(new Date(reservation.confirmed_at), 'PPp', { locale: ja })}</div>
                )}
              </div>
            )}
          </div>

          {reservation.status === 'confirmed' && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => handleStatusChange('cancelled')}
                className="flex-1"
              >
                Cancel Reservation
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
