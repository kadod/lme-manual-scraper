'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SegmentCondition, ConditionField, ConditionOperator, LogicOperator } from '@/lib/supabase/queries/segments'
import { getTags } from '@/app/actions/tags'

interface ConditionBuilderProps {
  conditions: SegmentCondition[]
  onChange: (conditions: SegmentCondition[]) => void
}

interface FieldOption {
  value: ConditionField
  label: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'tags'
}

const fieldOptions: FieldOption[] = [
  { value: 'follow_status', label: 'フォロー状態', type: 'string' },
  { value: 'is_blocked', label: 'ブロック状態', type: 'boolean' },
  { value: 'last_interaction_at', label: '最終接触日', type: 'date' },
  { value: 'created_at', label: '友だち追加日', type: 'date' },
  { value: 'tags', label: 'タグ', type: 'tags' },
  { value: 'metadata', label: 'カスタムフィールド', type: 'string' },
]

const operatorsByType: Record<string, { value: ConditionOperator; label: string }[]> = {
  string: [
    { value: 'eq', label: '等しい' },
    { value: 'ne', label: '等しくない' },
    { value: 'contains', label: '含む' },
  ],
  number: [
    { value: 'eq', label: '等しい' },
    { value: 'ne', label: '等しくない' },
    { value: 'gt', label: 'より大きい' },
    { value: 'lt', label: 'より小さい' },
    { value: 'gte', label: '以上' },
    { value: 'lte', label: '以下' },
  ],
  boolean: [
    { value: 'eq', label: '等しい' },
  ],
  date: [
    { value: 'gt', label: 'より後' },
    { value: 'lt', label: 'より前' },
    { value: 'gte', label: '以降' },
    { value: 'lte', label: '以前' },
    { value: 'exists', label: '存在する' },
  ],
  tags: [
    { value: 'in', label: 'いずれかを含む' },
    { value: 'contains', label: 'すべて含む' },
  ],
}

export function ConditionBuilder({ conditions, onChange }: ConditionBuilderProps) {
  const [tags, setTags] = useState<any[]>([])

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    const result = await getTags()
    if (result.success) {
      setTags(result.data)
    }
  }

  const addCondition = () => {
    const newCondition: SegmentCondition = {
      field: 'follow_status',
      operator: 'eq',
      value: 'following',
      logicOperator: conditions.length > 0 ? 'AND' : undefined,
    }
    onChange([...conditions, newCondition])
  }

  const updateCondition = (index: number, updates: Partial<SegmentCondition>) => {
    const updated = [...conditions]
    updated[index] = { ...updated[index], ...updates }
    onChange(updated)
  }

  const removeCondition = (index: number) => {
    const updated = conditions.filter((_, i) => i !== index)
    // Remove logicOperator from first condition
    if (updated.length > 0 && updated[0].logicOperator) {
      updated[0] = { ...updated[0], logicOperator: undefined }
    }
    onChange(updated)
  }

  const getFieldType = (field: ConditionField): string => {
    return fieldOptions.find((f) => f.value === field)?.type || 'string'
  }

  const getOperators = (field: ConditionField) => {
    const type = getFieldType(field)
    return operatorsByType[type] || operatorsByType.string
  }

  const renderValueInput = (condition: SegmentCondition, index: number) => {
    const fieldType = getFieldType(condition.field)

    if (fieldType === 'boolean') {
      return (
        <Select
          value={condition.value?.toString()}
          onValueChange={(value) => updateCondition(index, { value: value === 'true' })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">はい</SelectItem>
            <SelectItem value="false">いいえ</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    if (fieldType === 'date') {
      if (condition.operator === 'exists') {
        return (
          <div className="text-sm text-muted-foreground italic">
            値の入力は不要です
          </div>
        )
      }
      return (
        <Input
          type="date"
          value={condition.value || ''}
          onChange={(e) => updateCondition(index, { value: e.target.value })}
        />
      )
    }

    if (fieldType === 'tags') {
      return (
        <Select
          value={condition.value}
          onValueChange={(value) => updateCondition(index, { value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="タグを選択" />
          </SelectTrigger>
          <SelectContent>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color || '#3B82F6' }}
                  />
                  {tag.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (condition.field === 'follow_status') {
      return (
        <Select
          value={condition.value}
          onValueChange={(value) => updateCondition(index, { value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="following">フォロー中</SelectItem>
            <SelectItem value="blocked">ブロック中</SelectItem>
            <SelectItem value="unfollowed">フォロー解除</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    return (
      <Input
        type={fieldType === 'number' ? 'number' : 'text'}
        placeholder="値を入力"
        value={condition.value || ''}
        onChange={(e) => updateCondition(index, { value: e.target.value })}
      />
    )
  }

  return (
    <div className="space-y-4">
      {conditions.map((condition, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-4">
            {/* Logic Operator */}
            {index > 0 && (
              <div className="flex items-center gap-2">
                <Select
                  value={condition.logicOperator || 'AND'}
                  onValueChange={(value) =>
                    updateCondition(index, { logicOperator: value as LogicOperator })
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              {/* Field */}
              <div className="space-y-2">
                <Label>フィールド</Label>
                <Select
                  value={condition.field}
                  onValueChange={(value) => {
                    const newField = value as ConditionField
                    const fieldType = getFieldType(newField)
                    const operators = getOperators(newField)
                    updateCondition(index, {
                      field: newField,
                      operator: operators[0].value,
                      value: '',
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Operator */}
              <div className="space-y-2">
                <Label>演算子</Label>
                <Select
                  value={condition.operator}
                  onValueChange={(value) =>
                    updateCondition(index, { operator: value as ConditionOperator })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperators(condition.field).map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Value */}
              <div className="space-y-2">
                <Label>値</Label>
                {renderValueInput(condition, index)}
              </div>
            </div>

            {/* Remove Button */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCondition(index)}
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                削除
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {/* Add Condition Button */}
      <Button
        variant="outline"
        onClick={addCondition}
        className="w-full"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        条件を追加
      </Button>

      {/* Summary */}
      {conditions.length > 0 && (
        <div className="bg-muted/50 p-4 rounded-md">
          <div className="text-sm font-medium mb-2">条件の概要:</div>
          <div className="flex flex-wrap gap-2">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {condition.logicOperator}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {fieldOptions.find((f) => f.value === condition.field)?.label}{' '}
                  {getOperators(condition.field).find((o) => o.value === condition.operator)?.label}{' '}
                  {condition.operator !== 'exists' && condition.value}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
