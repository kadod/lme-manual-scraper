export interface CSVColumn {
  index: number
  name: string
  sample: string[]
}

export interface ColumnMapping {
  line_user_id?: number
  display_name?: number
  picture_url?: number
  language?: number
  status?: number
  [key: string]: number | undefined
}

export interface ImportValidationError {
  row: number
  column: string
  message: string
  value?: any
}

export interface ImportPreviewRow {
  row: number
  line_user_id: string
  display_name: string
  picture_url?: string
  language?: string
  status?: string
  custom_fields?: Record<string, any>
  errors: ImportValidationError[]
}

export interface ImportResult {
  success: boolean
  totalRows: number
  successCount: number
  errorCount: number
  errors: ImportValidationError[]
  duplicates?: string[]
}

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'import' | 'complete'

export interface ImportState {
  step: ImportStep
  csvData: string[][] | null
  columns: CSVColumn[]
  mapping: ColumnMapping
  previewData: ImportPreviewRow[]
  validationErrors: ImportValidationError[]
  importResult: ImportResult | null
}
