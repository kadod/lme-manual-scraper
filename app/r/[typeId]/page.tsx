import { notFound } from 'next/navigation'
import { getPublicReservationType } from '@/app/actions/public-reservations'
import { PublicReservationForm } from '@/components/reservations/PublicReservationForm'

interface PageProps {
  params: Promise<{ typeId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PublicReservationPage({ params, searchParams }: PageProps) {
  const { typeId } = await params
  const search = await searchParams
  const lineUserId = typeof search.userId === 'string' ? search.userId : undefined

  const reservationType = await getPublicReservationType(typeId)

  if (!reservationType) {
    notFound()
  }

  return <PublicReservationForm reservationType={reservationType} lineUserId={lineUserId} />
}

export async function generateMetadata({ params }: PageProps) {
  const { typeId } = await params
  const reservationType = await getPublicReservationType(typeId)

  if (!reservationType) {
    return {
      title: '予約ページが見つかりません'
    }
  }

  return {
    title: `${reservationType.name} - 予約フォーム`,
    description: reservationType.description || '予約フォーム'
  }
}
