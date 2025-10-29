'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ReservationList } from '@/components/reservations/ReservationList'
import { ReservationFilters } from '@/components/reservations/ReservationFilters'
import { ReservationDetail } from '@/components/reservations/ReservationDetail'
import {
  getReservations,
  updateReservationStatus,
  exportReservationsToCSV,
  getReservationTypes,
  type Reservation,
  type ReservationFilters as Filters,
} from '@/app/actions/reservations'
import { ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'

export default function ReservationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [reservationTypes, setReservationTypes] = useState<Array<{ id: string; name: string }>>([])

  const [filters, setFilters] = useState<Filters>({
    status: searchParams.get('status') || 'all',
    search: searchParams.get('search') || '',
    page: 1,
    limit: 50,
  })

  useEffect(() => {
    loadReservationTypes()
  }, [])

  useEffect(() => {
    loadReservations()
  }, [filters])

  const loadReservationTypes = async () => {
    try {
      const types = await getReservationTypes()
      setReservationTypes(types)
    } catch (error) {
      console.error('Failed to load reservation types:', error)
    }
  }

  const loadReservations = async () => {
    try {
      setLoading(true)
      const result = await getReservations(filters)
      setReservations(result.data)
      setTotal(result.total)
      setPage(result.page)
    } catch (error) {
      console.error('Failed to load reservations:', error)
      toast.error('Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters({ ...newFilters, page: 1, limit: 50 })
    const params = new URLSearchParams()
    if (newFilters.status && newFilters.status !== 'all') {
      params.set('status', newFilters.status)
    }
    if (newFilters.search) {
      params.set('search', newFilters.search)
    }
    router.push(`/dashboard/reservations${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handleStatusChange = async (
    id: string,
    status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  ) => {
    try {
      await updateReservationStatus(id, status)
      toast.success('Status updated successfully')
      loadReservations()
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleViewDetail = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setDetailOpen(true)
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const result = await exportReservationsToCSV(filters)
      if (result.success && result.data) {
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = result.filename || 'reservations.csv'
        link.click()
        toast.success('CSV file downloaded')
      } else {
        toast.error('Export failed')
      }
    } catch (error) {
      console.error('Failed to export:', error)
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground mt-2">Manage and view reservations</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadReservations}
            disabled={loading}
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting || reservations.length === 0}
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <ReservationFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        reservationTypes={reservationTypes}
      />

      <div className="mb-4 text-sm text-muted-foreground">
        {total} reservations
      </div>

      {loading ? (
        <div className="text-center py-12">
          <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <ReservationList
          reservations={reservations}
          onViewDetail={handleViewDetail}
          onStatusChange={handleStatusChange}
        />
      )}

      <ReservationDetail
        reservation={selectedReservation}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
