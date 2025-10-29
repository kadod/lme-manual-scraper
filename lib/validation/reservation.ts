/**
 * Validate reservation form data
 */
export function validateReservationData(data: {
  customer_name: string
  customer_email: string
  customer_phone?: string
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Name validation
  if (!data.customer_name || data.customer_name.trim().length === 0) {
    errors.customer_name = '名前を入力してください'
  } else if (data.customer_name.trim().length < 2) {
    errors.customer_name = '名前は2文字以上で入力してください'
  }

  // Email validation
  if (!data.customer_email || data.customer_email.trim().length === 0) {
    errors.customer_email = 'メールアドレスを入力してください'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customer_email)) {
    errors.customer_email = '有効なメールアドレスを入力してください'
  }

  // Phone validation (optional)
  if (data.customer_phone && data.customer_phone.trim().length > 0) {
    const phoneDigits = data.customer_phone.replace(/[^\d]/g, '')
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      errors.customer_phone = '有効な電話番号を入力してください'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
