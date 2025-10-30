import { Suspense } from 'react'
import { ReservationOverallSettings } from '@/components/reservations/ReservationOverallSettings'

export default function ReservationOverallSettingsPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <ReservationOverallSettings
          reservationId="demo-reservation-id"
          reservationName="無料相談"
        />
      </Suspense>
    </div>
  )
}
