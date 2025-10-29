'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useState } from 'react'
import { uploadFormFile } from '@/app/actions/forms'

interface FormFieldProps {
  field: {
    id: string
    type: string
    title?: string
    label?: string
    placeholder?: string
    description?: string
    required?: boolean
    options?: string[]
    validation?: {
      min?: number
      max?: number
      pattern?: string
      message?: string
    }
  }
  value: any
  onChange: (value: any) => void
  error?: string
}

export function FormField({ field, value, onChange, error }: FormFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>()

  const label = field.title || field.label || 'Question'
  const displayLabel = field.required ? `${label} *` : label

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(undefined)

    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadFormFile(formData)

    if (result.success && result.url) {
      onChange(result.url)
    } else {
      setUploadError(result.error || 'アップロードに失敗しました')
    }

    setUploading(false)
  }

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    const currentValues = Array.isArray(value) ? value : []
    if (checked) {
      onChange([...currentValues, optionValue])
    } else {
      onChange(currentValues.filter((v: string) => v !== optionValue))
    }
  }

  switch (field.type) {
    case 'short_text':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{displayLabel}</Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          <Input
            id={field.id}
            type="text"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            aria-invalid={!!error}
            maxLength={field.validation?.max}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )

    case 'long_text':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{displayLabel}</Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            aria-invalid={!!error}
            rows={4}
            maxLength={field.validation?.max}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )

    case 'email':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{displayLabel}</Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          <Input
            id={field.id}
            type="email"
            placeholder={field.placeholder || 'example@email.com'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            aria-invalid={!!error}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )

    case 'tel':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{displayLabel}</Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          <Input
            id={field.id}
            type="tel"
            placeholder={field.placeholder || '090-1234-5678'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            aria-invalid={!!error}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )

    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{displayLabel}</Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            aria-invalid={!!error}
            min={field.validation?.min}
            max={field.validation?.max}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )

    case 'url':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{displayLabel}</Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          <Input
            id={field.id}
            type="url"
            placeholder={field.placeholder || 'https://example.com'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            aria-invalid={!!error}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )

    case 'date':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{displayLabel}</Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          <Input
            id={field.id}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            aria-invalid={!!error}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )

    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{displayLabel}</Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          <Select value={value || ''} onValueChange={onChange} required={field.required}>
            <SelectTrigger id={field.id} aria-invalid={!!error}>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )

    case 'radio':
      return (
        <div className="space-y-2">
          <Label>{displayLabel}</Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          <RadioGroup value={value || ''} onValueChange={onChange} required={field.required}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )

    case 'checkbox':
      return (
        <div className="space-y-2">
          <Label>{displayLabel}</Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          <div className="space-y-2">
            {field.options?.map((option, index) => {
              const checked = Array.isArray(value) && value.includes(option)
              return (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${field.id}-${index}`}
                    checked={checked}
                    onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor={`${field.id}-${index}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              )
            })}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )

    case 'file':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{displayLabel}</Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          <Input
            id={field.id}
            type="file"
            onChange={handleFileChange}
            required={field.required}
            disabled={uploading}
            aria-invalid={!!error}
          />
          {uploading && <p className="text-sm text-muted-foreground">アップロード中...</p>}
          {value && !uploading && (
            <p className="text-sm text-green-600">ファイルがアップロードされました</p>
          )}
          {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )

    default:
      return null
  }
}
