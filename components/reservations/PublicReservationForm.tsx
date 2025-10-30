'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserIcon, EnvelopeIcon, PhoneIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import {
  ReservationType,
  SlotWithAvailability,
  createReservation,
  Reservation
} from '@/app/actions/public-reservations'
import { validateReservationData } from '@/lib/validation/reservation'
import { SlotSelector } from './SlotSelector'
import { ReservationConfirm } from './ReservationConfirm'
import { ReservationSuccess } from './ReservationSuccess'

interface PublicReservationFormProps {
  reservationType: ReservationType
  lineUserId?: string
}

type Step = 'slot' | 'form' | 'confirm' | 'success'

export function PublicReservationForm({ reservationType, lineUserId }: PublicReservationFormProps) {
  const [step, setStep] = useState<Step>('slot')
  const [selectedSlot, setSelectedSlot] = useState<SlotWithAvailability | null>(null)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_memo: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSlotSelect = (slot: SlotWithAvailability) => {
    setSelectedSlot(slot)
    setStep('form')
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    const validation = validateReservationData(formData)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setErrors({})
    setStep('confirm')
  }

  const handleConfirm = async () => {
    if (!selectedSlot) return

    setLoading(true)
    setApiError(null)

    try {
      const result = await createReservation({
        reservation_type_id: reservationType.id,
        schedule_id: selectedSlot.schedule_id,
        schedule_slot_id: selectedSlot.id,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone || undefined,
        notes: formData.customer_memo || undefined,
        line_user_id: lineUserId,
        organization_id: reservationType.organization_id
      })

      if (result.success && result.data) {
        setReservation(result.data)
        setStep('success')
      } else {
        setApiError(result.error || '予約の作成に失敗しました')
      }
    } catch (error) {
      setApiError('予約の作成中にエラーが発生しました')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('form')
    } else if (step === 'form') {
      setStep('slot')
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{reservationType.name}</h1>
        {reservationType.description && (
          <p className="text-muted-foreground">{reservationType.description}</p>
        )}
        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
          <span>所要時間: {reservationType.duration_minutes}分</span>
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <Alert className="mb-6" variant="destructive">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2">
          <div className={`flex items-center gap-2 ${step === 'slot' ? 'text-primary' : step === 'form' || step === 'confirm' || step === 'success' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === 'slot' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground bg-muted'}`}>
              1
            </div>
            <span className="text-sm font-medium hidden sm:inline">日時選択</span>
          </div>
          <div className="w-12 h-0.5 bg-muted" />
          <div className={`flex items-center gap-2 ${step === 'form' ? 'text-primary' : step === 'confirm' || step === 'success' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === 'form' ? 'border-primary bg-primary text-primary-foreground' : step === 'confirm' || step === 'success' ? 'border-muted-foreground bg-muted' : 'border-muted bg-muted'}`}>
              2
            </div>
            <span className="text-sm font-medium hidden sm:inline">情報入力</span>
          </div>
          <div className="w-12 h-0.5 bg-muted" />
          <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-primary' : step === 'success' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === 'confirm' ? 'border-primary bg-primary text-primary-foreground' : step === 'success' ? 'border-muted-foreground bg-muted' : 'border-muted bg-muted'}`}>
              3
            </div>
            <span className="text-sm font-medium hidden sm:inline">確認</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {step === 'slot' && (
        <SlotSelector
          reservationTypeId={reservationType.id}
          onSlotSelect={handleSlotSelect}
          selectedSlot={selectedSlot}
        />
      )}

      {step === 'form' && selectedSlot && (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>予約者情報</CardTitle>
              <CardDescription>
                ご予約に必要な情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  お名前 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleFormChange('customer_name', e.target.value)}
                  placeholder="山田 太郎"
                  aria-invalid={!!errors.customer_name}
                />
                {errors.customer_name && (
                  <p className="text-sm text-red-500">{errors.customer_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_email" className="flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4" />
                  メールアドレス <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleFormChange('customer_email', e.target.value)}
                  placeholder="example@email.com"
                  aria-invalid={!!errors.customer_email}
                />
                {errors.customer_email && (
                  <p className="text-sm text-red-500">{errors.customer_email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_phone" className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4" />
                  電話番号
                </Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => handleFormChange('customer_phone', e.target.value)}
                  placeholder="090-1234-5678"
                  aria-invalid={!!errors.customer_phone}
                />
                {errors.customer_phone && (
                  <p className="text-sm text-red-500">{errors.customer_phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_memo" className="flex items-center gap-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  備考（任意）
                </Label>
                <Textarea
                  id="customer_memo"
                  value={formData.customer_memo}
                  onChange={(e) => handleFormChange('customer_memo', e.target.value)}
                  placeholder="ご質問やご要望がございましたらご記入ください"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="w-full sm:w-auto"
            >
              戻る
            </Button>
            <Button type="submit" className="w-full sm:flex-1">
              確認画面へ
            </Button>
          </div>
        </form>
      )}

      {step === 'confirm' && selectedSlot && (
        <ReservationConfirm
          reservationType={reservationType}
          slot={selectedSlot}
          formData={formData}
          onConfirm={handleConfirm}
          onBack={handleBack}
          loading={loading}
        />
      )}

      {step === 'success' && reservation && (
        <ReservationSuccess
          reservationType={reservationType}
          reservation={reservation}
        />
      )}
    </div>
  )
}
