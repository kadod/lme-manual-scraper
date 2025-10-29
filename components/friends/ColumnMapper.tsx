'use client'

import { CSVColumn, ColumnMapping } from '@/types/import'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

interface ColumnMapperProps {
  columns: CSVColumn[]
  mapping: ColumnMapping
  onMappingChange: (mapping: ColumnMapping) => void
}

const REQUIRED_FIELDS = ['line_user_id', 'display_name'] as const
const OPTIONAL_FIELDS = ['picture_url', 'language', 'status'] as const

const FIELD_LABELS: Record<string, { label: string; description: string }> = {
  line_user_id: {
    label: 'LINE User ID',
    description: '友だちを識別する一意のID（必須）',
  },
  display_name: {
    label: '表示名',
    description: '友だちの表示名（必須）',
  },
  picture_url: {
    label: 'プロフィール画像URL',
    description: '友だちのプロフィール画像URL（任意）',
  },
  language: {
    label: '言語',
    description: '友だちの言語設定（任意）',
  },
  status: {
    label: 'ステータス',
    description: 'active, blocked, unsubscribed（任意、デフォルト: active）',
  },
}

export function ColumnMapper({ columns, mapping, onMappingChange }: ColumnMapperProps) {
  const handleFieldMapping = (field: string, columnIndex: string) => {
    const newMapping = { ...mapping }

    if (columnIndex === 'none') {
      delete newMapping[field]
    } else {
      newMapping[field] = parseInt(columnIndex, 10)
    }

    onMappingChange(newMapping)
  }

  const getMappedColumns = () => {
    return new Set(Object.values(mapping).filter((v) => v !== undefined))
  }

  const getUnmappedColumns = () => {
    const mapped = getMappedColumns()
    return columns.filter((col) => !mapped.has(col.index))
  }

  const isRequiredFieldsMapped = () => {
    return REQUIRED_FIELDS.every((field) => mapping[field] !== undefined)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>列のマッピング</CardTitle>
          <CardDescription>
            CSVの列を対応するフィールドにマッピングしてください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Fields */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">必須フィールド</h3>
              <Badge variant="destructive">必須</Badge>
            </div>

            {REQUIRED_FIELDS.map((field) => (
              <FieldMapping
                key={field}
                field={field}
                label={FIELD_LABELS[field].label}
                description={FIELD_LABELS[field].description}
                columns={columns}
                mapping={mapping}
                onMappingChange={handleFieldMapping}
                required
              />
            ))}
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">オプションフィールド</h3>
              <Badge variant="secondary">任意</Badge>
            </div>

            {OPTIONAL_FIELDS.map((field) => (
              <FieldMapping
                key={field}
                field={field}
                label={FIELD_LABELS[field].label}
                description={FIELD_LABELS[field].description}
                columns={columns}
                mapping={mapping}
                onMappingChange={handleFieldMapping}
                required={false}
              />
            ))}
          </div>

          {/* Unmapped Columns as Custom Fields */}
          {getUnmappedColumns().length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">カスタムフィールド</h3>
                <Badge variant="outline">{getUnmappedColumns().length}列</Badge>
              </div>

              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-3">
                  マッピングされていない以下の列は、カスタムフィールドとして保存されます:
                </p>
                <div className="flex flex-wrap gap-2">
                  {getUnmappedColumns().map((col) => (
                    <Badge key={col.index} variant="secondary">
                      {col.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isRequiredFieldsMapped() && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600 font-medium">
                必須フィールド（LINE User IDと表示名）を全てマッピングしてください
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface FieldMappingProps {
  field: string
  label: string
  description: string
  columns: CSVColumn[]
  mapping: ColumnMapping
  onMappingChange: (field: string, columnIndex: string) => void
  required: boolean
}

function FieldMapping({
  field,
  label,
  description,
  columns,
  mapping,
  onMappingChange,
  required,
}: FieldMappingProps) {
  const selectedColumn = mapping[field]
  const column = selectedColumn !== undefined ? columns[selectedColumn] : null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={`mapping-${field}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>

      <p className="text-xs text-muted-foreground">{description}</p>

      <Select
        value={selectedColumn !== undefined ? selectedColumn.toString() : 'none'}
        onValueChange={(value) => onMappingChange(field, value)}
      >
        <SelectTrigger id={`mapping-${field}`}>
          <SelectValue placeholder="列を選択..." />
        </SelectTrigger>
        <SelectContent>
          {!required && (
            <SelectItem value="none">
              <span className="text-muted-foreground">マッピングしない</span>
            </SelectItem>
          )}
          {columns.map((col) => (
            <SelectItem key={col.index} value={col.index.toString()}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{col.name}</span>
                {col.sample.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    例: {col.sample[0].substring(0, 30)}
                    {col.sample[0].length > 30 ? '...' : ''}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {column && column.sample.length > 0 && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs">
          <p className="font-medium mb-1">サンプルデータ:</p>
          <ul className="space-y-1 text-muted-foreground">
            {column.sample.slice(0, 3).map((sample, i) => (
              <li key={i} className="truncate">
                • {sample}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
