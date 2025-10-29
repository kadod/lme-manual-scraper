import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarView } from '@/components/reservations/CalendarView'

export default async function ReservationCalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">予約カレンダー</h1>
        <p className="text-gray-600 mt-2">予約状況を確認し、新規予約を管理します</p>
      </div>

      <CalendarView />
    </div>
  )
}
