'use client';

import { useState } from 'react';
import { ValidationRule } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ValidationEditorProps {
  validation: ValidationRule[];
  onChange: (validation: ValidationRule[]) => void;
  availableRules?: string[];
}

const validationTypeLabels: Record<string, string> = {
  required: '必須',
  minLength: '最小文字数',
  maxLength: '最大文字数',
  pattern: '正規表現',
  min: '最小値',
  max: '最大値',
};

export function ValidationEditor({
  validation,
  onChange,
  availableRules = ['required', 'minLength', 'maxLength', 'pattern'],
}: ValidationEditorProps) {
  const [showAddRule, setShowAddRule] = useState(false);

  const addRule = (type: ValidationRule['type']) => {
    const newRule: ValidationRule = {
      type,
      message: `${validationTypeLabels[type]}エラー`,
      value: type === 'required' ? true : '',
    };
    onChange([...validation, newRule]);
    setShowAddRule(false);
  };

  const updateRule = (index: number, updates: Partial<ValidationRule>) => {
    const updated = [...validation];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeRule = (index: number) => {
    onChange(validation.filter((_, i) => i !== index));
  };

  const existingTypes = validation.map((r) => r.type);
  const availableTypes = availableRules.filter((r) => !existingTypes.includes(r as any));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>バリデーション</Label>
        {availableTypes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddRule(!showAddRule)}
          >
            <PlusIcon className="size-4" />
            ルールを追加
          </Button>
        )}
      </div>

      {showAddRule && (
        <div className="rounded-md border border-border bg-muted/50 p-3">
          <div className="grid grid-cols-2 gap-2">
            {availableTypes.map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => addRule(type as ValidationRule['type'])}
              >
                {validationTypeLabels[type]}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {validation.map((rule, index) => (
          <div
            key={index}
            className="rounded-md border border-border bg-background p-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {validationTypeLabels[rule.type]}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeRule(index)}
              >
                <TrashIcon className="size-4 text-destructive" />
              </Button>
            </div>

            {rule.type !== 'required' && (
              <div className="space-y-2">
                <Label htmlFor={`rule-value-${index}`}>
                  {rule.type === 'pattern' ? 'パターン' : '値'}
                </Label>
                <Input
                  id={`rule-value-${index}`}
                  value={rule.value as string}
                  onChange={(e) => updateRule(index, { value: e.target.value })}
                  placeholder={
                    rule.type === 'pattern'
                      ? '^[a-zA-Z0-9]+$'
                      : rule.type.includes('Length')
                      ? '10'
                      : '0'
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor={`rule-message-${index}`}>エラーメッセージ</Label>
              <Input
                id={`rule-message-${index}`}
                value={rule.message}
                onChange={(e) => updateRule(index, { message: e.target.value })}
                placeholder="エラーメッセージを入力"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
