import { CSVColumn } from '@/types/import'

export function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.split('\n').filter((line) => line.trim() !== '')
  const result: string[][] = []

  for (const line of lines) {
    const row: string[] = []
    let currentField = ''
    let insideQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"'
          i++
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes
        }
      } else if (char === ',' && !insideQuotes) {
        // Field separator
        row.push(currentField.trim())
        currentField = ''
      } else {
        currentField += char
      }
    }

    // Add last field
    row.push(currentField.trim())
    result.push(row)
  }

  return result
}

export function detectColumns(csvData: string[][]): CSVColumn[] {
  if (csvData.length === 0) return []

  const headers = csvData[0]
  const sampleRows = csvData.slice(1, Math.min(11, csvData.length))

  return headers.map((header, index) => ({
    index,
    name: header,
    sample: sampleRows.map((row) => row[index] || '').filter((val) => val !== ''),
  }))
}

export function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

export function suggestColumnMapping(columns: CSVColumn[]): Record<string, number> {
  const mapping: Record<string, number> = {}

  // Mapping rules
  const mappingRules: Record<string, RegExp[]> = {
    line_user_id: [
      /^line[\s_-]?user[\s_-]?id$/i,
      /^user[\s_-]?id$/i,
      /^line[\s_-]?id$/i,
      /^id$/i,
    ],
    display_name: [
      /^display[\s_-]?name$/i,
      /^name$/i,
      /^氏名$/i,
      /^名前$/i,
      /^ユーザー名$/i,
    ],
    picture_url: [
      /^picture[\s_-]?url$/i,
      /^image[\s_-]?url$/i,
      /^avatar[\s_-]?url$/i,
      /^photo$/i,
    ],
    language: [/^language$/i, /^lang$/i, /^言語$/i],
    status: [/^status$/i, /^state$/i, /^ステータス$/i],
  }

  for (const [field, patterns] of Object.entries(mappingRules)) {
    const matchedColumn = columns.find((col) =>
      patterns.some((pattern) => pattern.test(col.name))
    )

    if (matchedColumn) {
      mapping[field] = matchedColumn.index
    }
  }

  return mapping
}

export function validateCSVSize(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 50 * 1024 * 1024 // 50MB
  const MAX_ROWS = 100000 // 100,000 rows

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `ファイルサイズが大きすぎます（最大: 50MB）`,
    }
  }

  return { valid: true }
}
