/**
 * Cron expression utilities
 */

export interface CronValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate cron expression format
 * Supports standard 5-field cron format: minute hour day month weekday
 */
export function validateCronExpression(expression: string): CronValidationResult {
  if (!expression || typeof expression !== 'string') {
    return { valid: false, error: 'Cron式を入力してください' }
  }

  const trimmed = expression.trim()
  const parts = trimmed.split(/\s+/)

  if (parts.length !== 5) {
    return {
      valid: false,
      error: 'Cron式は5つのフィールドで構成する必要があります (分 時 日 月 曜日)',
    }
  }

  const [minute, hour, day, month, weekday] = parts

  // Validate each field
  const minuteValid = validateCronField(minute, 0, 59)
  const hourValid = validateCronField(hour, 0, 23)
  const dayValid = validateCronField(day, 1, 31)
  const monthValid = validateCronField(month, 1, 12)
  const weekdayValid = validateCronField(weekday, 0, 6)

  if (!minuteValid.valid) {
    return { valid: false, error: `分フィールドが無効: ${minuteValid.error}` }
  }
  if (!hourValid.valid) {
    return { valid: false, error: `時フィールドが無効: ${hourValid.error}` }
  }
  if (!dayValid.valid) {
    return { valid: false, error: `日フィールドが無効: ${dayValid.error}` }
  }
  if (!monthValid.valid) {
    return { valid: false, error: `月フィールドが無効: ${monthValid.error}` }
  }
  if (!weekdayValid.valid) {
    return { valid: false, error: `曜日フィールドが無効: ${weekdayValid.error}` }
  }

  return { valid: true }
}

function validateCronField(
  field: string,
  min: number,
  max: number
): CronValidationResult {
  // Allow wildcard
  if (field === '*') {
    return { valid: true }
  }

  // Allow step values (*/5)
  if (field.startsWith('*/')) {
    const step = parseInt(field.substring(2))
    if (isNaN(step) || step <= 0) {
      return { valid: false, error: 'ステップ値が無効です' }
    }
    return { valid: true }
  }

  // Allow ranges (1-5)
  if (field.includes('-')) {
    const [start, end] = field.split('-').map((n) => parseInt(n))
    if (
      isNaN(start) ||
      isNaN(end) ||
      start < min ||
      end > max ||
      start > end
    ) {
      return { valid: false, error: `範囲は ${min}-${max} の間である必要があります` }
    }
    return { valid: true }
  }

  // Allow lists (1,3,5)
  if (field.includes(',')) {
    const values = field.split(',').map((n) => parseInt(n))
    for (const value of values) {
      if (isNaN(value) || value < min || value > max) {
        return {
          valid: false,
          error: `値は ${min}-${max} の間である必要があります`,
        }
      }
    }
    return { valid: true }
  }

  // Single value
  const value = parseInt(field)
  if (isNaN(value) || value < min || value > max) {
    return { valid: false, error: `値は ${min}-${max} の間である必要があります` }
  }

  return { valid: true }
}

/**
 * Convert cron expression to human-readable Japanese text
 */
export function cronToHumanReadable(expression: string): string {
  const validation = validateCronExpression(expression)
  if (!validation.valid) {
    return '無効なCron式'
  }

  const [minute, hour, day, month, weekday] = expression.trim().split(/\s+/)

  const parts: string[] = []

  // Month
  if (month !== '*') {
    if (month.includes(',')) {
      const months = month.split(',').map((m) => `${m}月`)
      parts.push(`${months.join(', ')}`)
    } else if (month.includes('-')) {
      const [start, end] = month.split('-')
      parts.push(`${start}月から${end}月`)
    } else {
      parts.push(`${month}月`)
    }
  }

  // Day of month
  if (day !== '*') {
    if (day.includes(',')) {
      const days = day.split(',').map((d) => `${d}日`)
      parts.push(`${days.join(', ')}`)
    } else if (day.includes('-')) {
      const [start, end] = day.split('-')
      parts.push(`${start}日から${end}日`)
    } else {
      parts.push(`${day}日`)
    }
  }

  // Day of week
  if (weekday !== '*') {
    const weekdayNames = ['日', '月', '火', '水', '木', '金', '土']
    if (weekday.includes(',')) {
      const days = weekday.split(',').map((w) => weekdayNames[parseInt(w)] + '曜日')
      parts.push(`${days.join(', ')}`)
    } else if (weekday.includes('-')) {
      const [start, end] = weekday.split('-')
      parts.push(
        `${weekdayNames[parseInt(start)]}曜日から${weekdayNames[parseInt(end)]}曜日`
      )
    } else {
      parts.push(`${weekdayNames[parseInt(weekday)]}曜日`)
    }
  }

  // Time
  let timeStr = ''
  if (hour === '*' && minute === '*') {
    timeStr = '毎分'
  } else if (hour === '*') {
    if (minute.startsWith('*/')) {
      const step = minute.substring(2)
      timeStr = `${step}分ごと`
    } else {
      timeStr = `毎時${minute}分`
    }
  } else {
    const hourStr = hour.startsWith('*/') ? `${hour.substring(2)}時間ごと` : `${hour}時`
    const minuteStr = minute === '0' ? '' : `${minute}分`
    timeStr = hourStr + minuteStr
  }

  if (parts.length === 0) {
    return timeStr
  }

  return `${parts.join('の')}の${timeStr}`
}

/**
 * Common cron expression presets
 */
export const CRON_PRESETS = [
  {
    label: '毎時',
    value: '0 * * * *',
    description: '毎時0分に実行',
  },
  {
    label: '毎日午前9時',
    value: '0 9 * * *',
    description: '毎日午前9時に実行',
  },
  {
    label: '毎週月曜日午前9時',
    value: '0 9 * * 1',
    description: '毎週月曜日の午前9時に実行',
  },
  {
    label: '毎月1日午前9時',
    value: '0 9 1 * *',
    description: '毎月1日の午前9時に実行',
  },
  {
    label: '平日午前9時',
    value: '0 9 * * 1-5',
    description: '平日(月〜金)の午前9時に実行',
  },
  {
    label: '6時間ごと',
    value: '0 */6 * * *',
    description: '0時、6時、12時、18時に実行',
  },
]

/**
 * Get timezone list
 */
export const TIMEZONES = [
  { value: 'Asia/Tokyo', label: '日本時間 (JST)' },
  { value: 'America/New_York', label: 'アメリカ東部時間 (EST)' },
  { value: 'America/Los_Angeles', label: 'アメリカ太平洋時間 (PST)' },
  { value: 'Europe/London', label: 'イギリス時間 (GMT)' },
  { value: 'Europe/Paris', label: '中央ヨーロッパ時間 (CET)' },
  { value: 'UTC', label: '協定世界時 (UTC)' },
]
