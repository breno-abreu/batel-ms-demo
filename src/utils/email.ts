const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

export function isValidEmail(value: string | null | undefined): boolean {
  const normalized = normalizeEmail(value)

  if (!normalized || normalized.length > 254) {
    return false
  }

  return EMAIL_PATTERN.test(normalized)
}
