'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ReservationStatusBadge } from './ReservationStatusBadge'
import { EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { Reservation } from '@/app/actions/reservations'

interface ReservationListProps {
  reservations: Reservation[]
  onViewDetail: (reservation: Reservation) => void
  onStatusChange: (id: string, status: 'confirmed' | 'cancelled') => Promise<void>
}

export function ReservationList({
  reservations,
  onViewDetail,
  onStatusChange,
}: ReservationListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleStatusChange = async (
    id: string,
    status: 'confirmed' | 'cancelled'
  ) => {
    setLoadingId(id)
    try {
      await onStatusChange(id, status)
    } finally {
      setLoadingId(null)
    }
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No reservations found</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell className="font-medium">
                {reservation.slot?.start_time ? (
                  <div>
                    <div>
                      {format(new Date(reservation.slot.start_time), 'PPP', {
                        locale: ja,
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(reservation.slot.start_time), 'HH:mm', {
                        locale: ja,
                      })}
                      -
                      {reservation.slot.end_time &&
                        format(new Date(reservation.slot.end_time), 'HH:mm', {
                          locale: ja,
                        })}
                    </div>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>{reservation.reservation_type?.name || '-'}</TableCell>
              <TableCell>
                <div>
                  <div>{reservation.customer_name}</div>
                  {reservation.friend && (
                    <div className="text-sm text-muted-foreground">
                      LINE Friend
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {reservation.customer_email && (
                    <div className="truncate max-w-[200px]">
                      {reservation.customer_email}
                    </div>
                  )}
                  {reservation.customer_phone && (
                    <div className="text-muted-foreground">
                      {reservation.customer_phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <ReservationStatusBadge status={reservation.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {reservation.created_at && format(new Date(reservation.created_at), 'PP', {
                  locale: ja,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(reservation)}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  {reservation.status === 'confirmed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                      disabled={loadingId === reservation.id}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
