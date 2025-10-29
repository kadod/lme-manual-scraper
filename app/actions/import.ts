'use server'

import { createClient } from '@/lib/supabase/server'
import {
  ImportValidationError,
  ImportPreviewRow,
  ImportResult,
  ColumnMapping,
} from '@/types/import'

interface ValidateRowResult {
  isValid: boolean
  errors: ImportValidationError[]
  data: {
    line_user_id: string
    display_name: string
    picture_url?: string
    language?: string
    status?: string
    custom_fields?: Record<string, any>
  }
}

function validateRow(
  row: string[],
  rowIndex: number,
  mapping: ColumnMapping
): ValidateRowResult {
  const errors: ImportValidationError[] = []
  const data: any = {
    custom_fields: {},
  }

  // Validate line_user_id (required)
  if (mapping.line_user_id !== undefined) {
    const value = row[mapping.line_user_id]?.trim()
    if (!value) {
      errors.push({
        row: rowIndex,
        column: 'line_user_id',
        message: 'LINE User IDは必須です',
      })
    } else if (value.length > 255) {
      errors.push({
        row: rowIndex,
        column: 'line_user_id',
        message: 'LINE User IDが長すぎます（最大255文字）',
        value,
      })
    } else {
      data.line_user_id = value
    }
  } else {
    errors.push({
      row: rowIndex,
      column: 'line_user_id',
      message: 'LINE User IDのマッピングが必要です',
    })
  }

  // Validate display_name (required)
  if (mapping.display_name !== undefined) {
    const value = row[mapping.display_name]?.trim()
    if (!value) {
      errors.push({
        row: rowIndex,
        column: 'display_name',
        message: '表示名は必須です',
      })
    } else if (value.length > 255) {
      errors.push({
        row: rowIndex,
        column: 'display_name',
        message: '表示名が長すぎます（最大255文字）',
        value,
      })
    } else {
      data.display_name = value
    }
  } else {
    errors.push({
      row: rowIndex,
      column: 'display_name',
      message: '表示名のマッピングが必要です',
    })
  }

  // Optional fields
  if (mapping.picture_url !== undefined) {
    const value = row[mapping.picture_url]?.trim()
    if (value) {
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        errors.push({
          row: rowIndex,
          column: 'picture_url',
          message: 'URLの形式が正しくありません',
          value,
        })
      } else {
        data.picture_url = value
      }
    }
  }

  if (mapping.language !== undefined) {
    const value = row[mapping.language]?.trim()
    if (value) {
      data.language = value
    }
  }

  if (mapping.status !== undefined) {
    const value = row[mapping.status]?.trim().toLowerCase()
    if (value) {
      if (!['active', 'blocked', 'unsubscribed'].includes(value)) {
        errors.push({
          row: rowIndex,
          column: 'status',
          message: 'ステータスは active, blocked, unsubscribed のいずれかです',
          value,
        })
      } else {
        data.status = value
      }
    }
  }

  // Handle custom fields
  for (const [key, colIndex] of Object.entries(mapping)) {
    if (
      colIndex !== undefined &&
      !['line_user_id', 'display_name', 'picture_url', 'language', 'status'].includes(key)
    ) {
      const value = row[colIndex]?.trim()
      if (value) {
        data.custom_fields[key] = value
      }
    }
  }

  // Set default values
  if (!data.status) {
    data.status = 'active'
  }

  return {
    isValid: errors.length === 0,
    errors,
    data,
  }
}

export async function validateImportData(
  csvData: string[][],
  mapping: ColumnMapping
): Promise<{
  previewData: ImportPreviewRow[]
  validationErrors: ImportValidationError[]
}> {
  const previewData: ImportPreviewRow[] = []
  const validationErrors: ImportValidationError[] = []
  const lineUserIds = new Set<string>()

  // Skip header row, process data rows
  const dataRows = csvData.slice(1)
  const previewLimit = 10

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    const rowIndex = i + 2 // +2 because: +1 for header, +1 for 1-based indexing

    const validation = validateRow(row, rowIndex, mapping)

    // Check for duplicate line_user_id
    if (validation.data.line_user_id) {
      if (lineUserIds.has(validation.data.line_user_id)) {
        validation.errors.push({
          row: rowIndex,
          column: 'line_user_id',
          message: 'LINE User IDが重複しています',
          value: validation.data.line_user_id,
        })
        validation.isValid = false
      } else {
        lineUserIds.add(validation.data.line_user_id)
      }
    }

    // Add to preview (first 10 rows)
    if (i < previewLimit) {
      previewData.push({
        row: rowIndex,
        line_user_id: validation.data.line_user_id || '',
        display_name: validation.data.display_name || '',
        picture_url: validation.data.picture_url,
        language: validation.data.language,
        status: validation.data.status,
        custom_fields: validation.data.custom_fields,
        errors: validation.errors,
      })
    }

    // Collect all validation errors
    validationErrors.push(...validation.errors)
  }

  return {
    previewData,
    validationErrors,
  }
}

export async function importFriends(
  csvData: string[][],
  mapping: ColumnMapping,
  organizationId: string,
  channelId: string
): Promise<ImportResult> {
  const supabase = await createClient()
  const dataRows = csvData.slice(1)

  let successCount = 0
  let errorCount = 0
  const errors: ImportValidationError[] = []
  const duplicates: string[] = []

  // Check for existing line_user_ids in database
  const lineUserIds = dataRows
    .map((row, i) => {
      const validation = validateRow(row, i + 2, mapping)
      return validation.data.line_user_id
    })
    .filter(Boolean)

  const { data: existingFriends } = await supabase
    .from('line_friends')
    .select('line_user_id')
    .eq('channel_id', channelId)
    .in('line_user_id', lineUserIds)

  const existingUserIds = new Set(
    existingFriends?.map((f) => f.line_user_id) || []
  )

  // Process in batches of 100
  const BATCH_SIZE = 100
  const batches: any[][] = []

  for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
    const batch = dataRows.slice(i, i + BATCH_SIZE)
    const batchData: any[] = []

    for (let j = 0; j < batch.length; j++) {
      const row = batch[j]
      const rowIndex = i + j + 2

      const validation = validateRow(row, rowIndex, mapping)

      if (!validation.isValid) {
        errorCount++
        errors.push(...validation.errors)
        continue
      }

      // Check if already exists
      if (existingUserIds.has(validation.data.line_user_id)) {
        errorCount++
        duplicates.push(validation.data.line_user_id)
        errors.push({
          row: rowIndex,
          column: 'line_user_id',
          message: 'このLINE User IDは既に登録されています',
          value: validation.data.line_user_id,
        })
        continue
      }

      batchData.push({
        organization_id: organizationId,
        channel_id: channelId,
        line_user_id: validation.data.line_user_id,
        display_name: validation.data.display_name,
        picture_url: validation.data.picture_url,
        language: validation.data.language,
        status: validation.data.status || 'active',
        custom_fields: validation.data.custom_fields,
        first_added_at: new Date().toISOString(),
        last_interaction_at: new Date().toISOString(),
      })
    }

    if (batchData.length > 0) {
      batches.push(batchData)
    }
  }

  // Execute batch inserts
  for (const batchData of batches) {
    const { error: insertError } = await supabase
      .from('line_friends')
      .insert(batchData)

    if (insertError) {
      console.error('Batch insert error:', insertError)
      errorCount += batchData.length
      batchData.forEach((item, index) => {
        errors.push({
          row: 0, // Row number not available in batch
          column: 'database',
          message: insertError.message,
          value: item.line_user_id,
        })
      })
    } else {
      successCount += batchData.length
    }
  }

  return {
    success: errorCount === 0,
    totalRows: dataRows.length,
    successCount,
    errorCount,
    errors,
    duplicates,
  }
}

export async function getOrganizationChannel(organizationId: string) {
  const supabase = await createClient()

  const { data: channel, error } = await supabase
    .from('line_channels')
    .select('id, channel_name')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching channel:', error)
    return null
  }

  return channel
}
