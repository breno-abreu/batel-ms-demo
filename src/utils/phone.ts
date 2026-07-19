const BRAZILIAN_MOBILE_DIGITS = 11

export function normalizePhoneDigits(value: string | null | undefined): string {
  let digits = (value ?? '').replace(/\D/g, '')

  // Remove DDI do Brasil quando o número é colado com código do país.
  if (digits.startsWith('55') && digits.length >= 12) {
    digits = digits.slice(2)
  }

  return digits.slice(0, BRAZILIAN_MOBILE_DIGITS)
}

export function formatBrazilianMobilePhone(value: string | null | undefined): string {
  const digits = normalizePhoneDigits(value)

  if (!digits) {
    return ''
  }

  if (digits.length <= 2) {
    return `(${digits}${digits.length === 2 ? ')' : ''}`
  }

  const areaCode = digits.slice(0, 2)
  const number = digits.slice(2)

  if (number.length <= 5) {
    return `(${areaCode}) ${number}`
  }

  return `(${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`
}

export function isValidBrazilianMobilePhone(value: string | null | undefined): boolean {
  const digits = normalizePhoneDigits(value)
  return digits.length === BRAZILIAN_MOBILE_DIGITS && digits[2] === '9'
}
