'use client';

import { useState } from 'react';
import { FormField, SelectOption } from '@/types/form';
import { fieldConfigs } from '@/lib/field-configs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ValidationEditor } from './ValidationEditor';
import {
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

interface FieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

export function FieldEditor({
  field,
  onUpdate,
  onDelete,
  dragHandleProps,
}: FieldEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = fieldConfigs[field.type];
  const Icon = config.icon;

  const updateField = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  const addOption = () => {
    const newOption: SelectOption = {
      label: `選択肢 ${(field.options?.length || 0) + 1}`,
      value: `option_${Date.now()}`,
    };
    updateField({ options: [...(field.options || []), newOption] });
  };

  const updateOption = (index: number, updates: Partial<SelectOption>) => {
    const updated = [...(field.options || [])];
    updated[index] = { ...updated[index], ...updates };
    updateField({ options: updated });
  };

  const removeOption = (index: number) => {
    updateField({
      options: field.options?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <Bars3Icon className="size-5 text-muted-foreground" />
        </div>
        <Icon className="size-5 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {field.label || '未設定'}
          </div>
          <div className="text-xs text-muted-foreground">{config.label}</div>
        </div>
        {field.required && (
          <span className="text-xs text-destructive font-medium">必須</span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <TrashIcon className="size-4 text-destructive" />
        </Button>
      </div>

      {isExpanded && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`field-label-${field.id}`}>ラベル</Label>
            <Input
              id={`field-label-${field.id}`}
              value={field.label}
              onChange={(e) => updateField({ label: e.target.value })}
              placeholder="フィールドのラベル"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`field-placeholder-${field.id}`}>
              プレースホルダー
            </Label>
            <Input
              id={`field-placeholder-${field.id}`}
              value={field.placeholder || ''}
              onChange={(e) => updateField({ placeholder: e.target.value })}
              placeholder={config.defaultPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`field-help-${field.id}`}>ヘルプテキスト</Label>
            <Textarea
              id={`field-help-${field.id}`}
              value={field.helpText || ''}
              onChange={(e) => updateField({ helpText: e.target.value })}
              placeholder="フィールドの説明"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor={`field-required-${field.id}`}>必須項目</Label>
            <Switch
              id={`field-required-${field.id}`}
              checked={field.required || false}
              onCheckedChange={(checked) => updateField({ required: checked })}
            />
          </div>

          {config.supportsOptions && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>選択肢</Label>
                <Button variant="ghost" size="sm" onClick={addOption}>
                  <PlusIcon className="size-4" />
                  追加
                </Button>
              </div>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option.label}
                      onChange={(e) =>
                        updateOption(index, { label: e.target.value })
                      }
                      placeholder="ラベル"
                    />
                    <Input
                      value={option.value}
                      onChange={(e) =>
                        updateOption(index, { value: e.target.value })
                      }
                      placeholder="値"
                      className="w-32"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeOption(index)}
                    >
                      <XMarkIcon className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ValidationEditor
            validation={field.validation || []}
            onChange={(validation) => updateField({ validation })}
            availableRules={config.defaultValidation}
          />
        </div>
      )}
    </div>
  );
}
