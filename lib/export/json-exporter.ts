/**
 * JSON Exporter Utility
 * Handles conversion of database records to JSON format
 */

interface JSONExportOptions {
  pretty?: boolean
  includeMetadata?: boolean
}

/**
 * Convert data to JSON string
 */
export function arrayToJSON(
  data: Record<string, any>[],
  options: JSONExportOptions = {}
): string {
  const { pretty = true, includeMetadata = true } = options

  const output = includeMetadata
    ? {
        metadata: {
          exportedAt: new Date().toISOString(),
          recordCount: data.length,
          version: '1.0',
        },
        data,
      }
    : data

  return pretty ? JSON.stringify(output, null, 2) : JSON.stringify(output)
}

/**
 * Export any data type to JSON
 */
export function exportToJSON(
  data: any[],
  dataType: string,
  options: JSONExportOptions = {}
): string {
  const { pretty = true } = options

  const output = {
    metadata: {
      dataType,
      exportedAt: new Date().toISOString(),
      recordCount: data.length,
      version: '1.0',
    },
    data,
  }

  return pretty ? JSON.stringify(output, null, 2) : JSON.stringify(output)
}
