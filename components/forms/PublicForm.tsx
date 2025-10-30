'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { FormField } from './FormField'
import { Form } from '@/app/actions/forms'
import { submitPublicForm, FormSubmission, FormValidationError } from '@/app/actions/forms'
import { ThankYouPage } from './ThankYouPage'

interface PublicFormProps {
  form: Form
  lineUserId?: string
}

export function PublicForm({ form, lineUserId }: PublicFormProps) {
  const [formData, setFormData] = useState<FormSubmission>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string>()

  // Use 'fields' or 'questions' (backwards compatibility)
  const questions = (form.fields || form.questions || []) as any[]
  const settings = (form.settings as any) || {}

  const answeredCount = questions.filter(q => {
    const value = formData[q.id]
    if (Array.isArray(value)) {
      return value.length > 0
    }
    return value !== undefined && value !== null && value !== ''
  }).length

  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))

    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(undefined)
    setErrors({})

    try {
      const result = await submitPublicForm(form.id, formData, lineUserId)

      if (result.success) {
        setIsSubmitted(true)
      } else {
        // Handle validation errors if they exist (future enhancement)
        // For now, just show the general error message
        setSubmitError(result.error || '送信に失敗しました')
      }
    } catch (error) {
      console.error('Submit error:', error)
      setSubmitError('予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <ThankYouPage
        message={settings.thank_you_message || 'ご回答ありがとうございました'}
        redirectUrl={settings.redirect_url}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl md:text-3xl">{form.title}</CardTitle>
            {form.description && (
              <CardDescription className="text-base">{form.description}</CardDescription>
            )}
            {settings.show_progress !== false && (
              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>回答済み</span>
                  <span>{answeredCount} / {questions.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="pb-4 border-b last:border-0">
                  <div className="mb-2 text-sm text-muted-foreground">
                    質問 {index + 1} / {questions.length}
                  </div>
                  <FormField
                    field={question}
                    value={formData[question.id]}
                    onChange={(value) => handleFieldChange(question.id, value)}
                    error={errors[question.id]}
                  />
                </div>
              ))}

              {submitError && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
                  {submitError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-w-[200px]"
                  size="lg"
                >
                  {isSubmitting ? '送信中...' : (settings.submit_button_text || '送信')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({})
                    setErrors({})
                    setSubmitError(undefined)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  クリア
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                * は必須項目です
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>このフォームは安全に送信されます</p>
        </div>
      </div>
    </div>
  )
}
