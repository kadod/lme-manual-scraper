/**
 * CSV Exporter Utility
 * Handles conversion of database records to CSV format
 */

interface CSVExportOptions {
  delimiter?: string
  includeHeaders?: boolean
  dateFormat?: string
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(
  data: Record<string, any>[],
  options: CSVExportOptions = {}
): string {
  const {
    delimiter = ',',
    includeHeaders = true,
    dateFormat = 'YYYY-MM-DD HH:mm:ss',
  } = options

  if (!data || data.length === 0) {
    return ''
  }

  // Extract headers from first row
  const headers = Object.keys(data[0])
  const rows: string[] = []

  // Add header row
  if (includeHeaders) {
    rows.push(headers.map((h) => escapeCSVValue(h)).join(delimiter))
  }

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header]
      return escapeCSVValue(formatValue(value))
    })
    rows.push(values.join(delimiter))
  }

  return rows.join('\n')
}

/**
 * Escape CSV value to handle special characters
 */
function escapeCSVValue(value: string): string {
  if (value == null) return ''

  const stringValue = String(value)

  // If value contains delimiter, quotes, or newlines, wrap in quotes
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    // Escape existing quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Format value for CSV output
 */
function formatValue(value: any): string {
  if (value == null) return ''

  // Handle dates
  if (value instanceof Date) {
    return value.toISOString()
  }

  // Handle objects and arrays
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  // Handle numbers
  if (typeof value === 'number') {
    return String(value)
  }

  return String(value)
}

/**
 * Export friends data to CSV
 */
export function exportFriendsToCSV(friends: any[]): string {
  const data = friends.map((friend) => ({
    ID: friend.id,
    LINE_User_ID: friend.line_user_id,
    Display_Name: friend.display_name,
    Status_Message: friend.status_message || '',
    Is_Blocked: friend.is_blocked ? 'Yes' : 'No',
    Last_Interaction: friend.last_interaction_at || '',
    Created_At: friend.created_at,
    Tags: Array.isArray(friend.tags)
      ? friend.tags.map((t: any) => t.name).join('; ')
      : '',
  }))

  return arrayToCSV(data)
}

/**
 * Export tags data to CSV
 */
export function exportTagsToCSV(tags: any[]): string {
  const data = tags.map((tag) => ({
    ID: tag.id,
    Name: tag.name,
    Color: tag.color || '',
    Description: tag.description || '',
    Friend_Count: tag.friend_count || 0,
    Created_At: tag.created_at,
  }))

  return arrayToCSV(data)
}

/**
 * Export segments data to CSV
 */
export function exportSegmentsToCSV(segments: any[]): string {
  const data = segments.map((segment) => ({
    ID: segment.id,
    Name: segment.name,
    Description: segment.description || '',
    Conditions: JSON.stringify(segment.conditions),
    Member_Count: segment.member_count || 0,
    Created_At: segment.created_at,
  }))

  return arrayToCSV(data)
}

/**
 * Export messages data to CSV
 */
export function exportMessagesToCSV(messages: any[]): string {
  const data = messages.map((message) => ({
    ID: message.id,
    Type: message.type,
    Status: message.status,
    Target_Type: message.target_type,
    Total_Recipients: message.total_recipients || 0,
    Sent_Count: message.sent_count || 0,
    Delivered_Count: message.delivered_count || 0,
    Read_Count: message.read_count || 0,
    Click_Count: message.click_count || 0,
    Error_Count: message.error_count || 0,
    Scheduled_At: message.scheduled_at || '',
    Sent_At: message.sent_at || '',
    Created_At: message.created_at,
  }))

  return arrayToCSV(data)
}

/**
 * Export forms data to CSV
 */
export function exportFormsToCSV(forms: any[]): string {
  const data = forms.map((form) => ({
    ID: form.id,
    Title: form.title,
    Description: form.description || '',
    Status: form.status,
    Total_Responses: form.total_responses || 0,
    Response_Rate: form.response_rate || 0,
    Published_At: form.published_at || '',
    Closed_At: form.closed_at || '',
    Created_At: form.created_at,
  }))

  return arrayToCSV(data)
}

/**
 * Export reservations data to CSV
 */
export function exportReservationsToCSV(reservations: any[]): string {
  const data = reservations.map((reservation) => ({
    ID: reservation.id,
    Customer_Name: reservation.customer_name,
    Customer_Email: reservation.customer_email,
    Customer_Phone: reservation.customer_phone || '',
    Status: reservation.status,
    Reservation_Type: reservation.reservation_type?.name || '',
    Start_Time: reservation.slot?.start_time || '',
    End_Time: reservation.slot?.end_time || '',
    Customer_Memo: reservation.customer_memo || '',
    Created_At: reservation.created_at,
    Cancelled_At: reservation.cancelled_at || '',
    Completed_At: reservation.completed_at || '',
  }))

  return arrayToCSV(data)
}

/**
 * Export analytics data to CSV
 */
export function exportAnalyticsToCSV(analytics: any[]): string {
  const data = analytics.map((stat) => ({
    Date: stat.date,
    Total_Friends: stat.total_friends || 0,
    New_Friends: stat.new_friends || 0,
    Blocked_Friends: stat.blocked_friends || 0,
    Messages_Sent: stat.messages_sent || 0,
    Messages_Delivered: stat.messages_delivered || 0,
    Messages_Read: stat.messages_read || 0,
    Messages_Clicked: stat.messages_clicked || 0,
    Form_Responses: stat.form_responses || 0,
    Reservations_Created: stat.reservations_created || 0,
    URL_Clicks: stat.url_clicks || 0,
  }))

  return arrayToCSV(data)
}
