export function formatCurrencyBrl(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

export function formatCentsDigits(digits: string): string {
  if (!digits) {
    return ''
  }

  const cents = Number(digits)

  if (Number.isNaN(cents)) {
    return ''
  }

  return formatCurrencyBrl(cents / 100)
}

export function numberToCentsDigits(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return ''
  }

  return String(Math.round(Math.abs(value) * 100))
}

export function centsDigitsToNumber(digits: string): number | null {
  if (!digits) {
    return null
  }

  const cents = Number(digits)

  if (Number.isNaN(cents)) {
    return null
  }

  return cents / 100
}

export function extractDigitCharacters(value: string): string {
  return value.replace(/\D/g, '')
}
