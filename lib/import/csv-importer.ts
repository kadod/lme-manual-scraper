/**
 * CSV Importer Utility
 * Handles parsing and validation of CSV files for import
 */

import type { ImportPreviewRow } from '@/types/system'

interface ParseOptions {
  delimiter?: string
  hasHeaders?: boolean
  skipEmptyLines?: boolean
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV(
  csvText: string,
  options: ParseOptions = {}
): Record<string, string>[] {
  const {
    delimiter = ',',
    hasHeaders = true,
    skipEmptyLines = true,
  } = options

  const lines = csvText.split(/\r?\n/)
  const result: Record<string, string>[] = []

  if (lines.length === 0) return result

  // Parse headers
  const headers = hasHeaders
    ? parseCSVLine(lines[0], delimiter)
    : Array.from({ length: parseCSVLine(lines[0], delimiter).length }, (_, i) =>
        `Column${i + 1}`
      )

  const startIndex = hasHeaders ? 1 : 0

  // Parse data rows
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()

    if (skipEmptyLines && !line) continue

    const values = parseCSVLine(line, delimiter)
    const row: Record<string, string> = {}

    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || ''
    }

    result.push(row)
  }

  return result
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      // End of field
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  // Add last field
  values.push(current.trim())

  return values
}

/**
 * Validate friends import data
 */
export function validateFriendsImport(
  rows: Record<string, string>[]
): ImportPreviewRow[] {
  return rows.map((row, index) => {
    const messages: string[] = []
    let status: 'valid' | 'warning' | 'error' = 'valid'

    // Required fields
    if (!row.line_user_id && !row.LINE_User_ID) {
      messages.push('Missing required field: LINE User ID')
      status = 'error'
    }

    if (!row.display_name && !row.Display_Name) {
      messages.push('Missing required field: Display Name')
      status = 'error'
    }

    // Optional field warnings
    if (!row.email && !row.Email) {
      messages.push('No email provided')
      if (status === 'valid') status = 'warning'
    }

    // Validate email format if provided
    const email = row.email || row.Email
    if (email && !isValidEmail(email)) {
      messages.push('Invalid email format')
      status = 'error'
    }

    return {
      rowNumber: index + 1,
      data: {
        line_user_id: row.line_user_id || row.LINE_User_ID || '',
        display_name: row.display_name || row.Display_Name || '',
        email: email || '',
        status_message: row.status_message || row.Status_Message || '',
      },
      status,
      messages,
    }
  })
}

/**
 * Validate tags import data
 */
export function validateTagsImport(
  rows: Record<string, string>[]
): ImportPreviewRow[] {
  return rows.map((row, index) => {
    const messages: string[] = []
    let status: 'valid' | 'warning' | 'error' = 'valid'

    // Required fields
    if (!row.name && !row.Name) {
      messages.push('Missing required field: Name')
      status = 'error'
    }

    // Validate color format if provided
    const color = row.color || row.Color
    if (color && !isValidColor(color)) {
      messages.push('Invalid color format (use #RRGGBB)')
      if (status === 'valid') status = 'warning'
    }

    return {
      rowNumber: index + 1,
      data: {
        name: row.name || row.Name || '',
        color: color || '#808080',
        description: row.description || row.Description || '',
      },
      status,
      messages,
    }
  })
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate color format
 */
function isValidColor(color: string): boolean {
  const colorRegex = /^#[0-9A-Fa-f]{6}$/
  return colorRegex.test(color)
}

/**
 * Get import summary statistics
 */
export function getImportSummary(rows: ImportPreviewRow[]) {
  const validRows = rows.filter((r) => r.status === 'valid').length
  const warningRows = rows.filter((r) => r.status === 'warning').length
  const errorRows = rows.filter((r) => r.status === 'error').length

  return {
    totalRows: rows.length,
    validRows,
    warningRows,
    errorRows,
    canImport: errorRows === 0,
  }
}
