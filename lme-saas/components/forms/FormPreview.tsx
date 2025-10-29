'use client';

import { FormField } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormPreviewProps {
  title: string;
  description?: string;
  fields: FormField[];
  thanksMessage?: string;
}

export function FormPreview({
  title,
  description,
  fields,
  thanksMessage,
}: FormPreviewProps) {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const renderField = (field: FormField) => {
    const fieldId = `preview-${field.id}`;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <Input
            id={fieldId}
            type={field.type}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
          />
        );

      case 'select':
        return (
          <Select required={field.required}>
            <SelectTrigger id={fieldId} className="w-full">
              <SelectValue placeholder={field.placeholder || '選択してください'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup required={field.required}>
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${fieldId}-${option.value}`} />
                <Label htmlFor={`${fieldId}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox id={`${fieldId}-${option.value}`} />
                <Label htmlFor={`${fieldId}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        );

      case 'date':
        return (
          <Input
            id={fieldId}
            type="date"
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'time':
        return (
          <Input
            id={fieldId}
            type="time"
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'file':
        return (
          <Input
            id={fieldId}
            type="file"
            required={field.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-background rounded-lg border border-border shadow-sm">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title || 'フォームタイトル'}</h2>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {sortedFields.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            フィールドを追加してください
          </div>
        ) : (
          <form className="space-y-6">
            {sortedFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={`preview-${field.id}`}>
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                {renderField(field)}
                {field.helpText && (
                  <p className="text-xs text-muted-foreground">{field.helpText}</p>
                )}
              </div>
            ))}

            <Button type="submit" className="w-full">
              送信
            </Button>

            {thanksMessage && (
              <div className="mt-6 p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">送信後メッセージ:</span>
                  <br />
                  {thanksMessage}
                </p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
