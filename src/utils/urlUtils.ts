export function normalizeOptionalUrl(value: string): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}

export function isValidOptionalUrl(value: string): boolean {
  const normalized = normalizeOptionalUrl(value)

  if (!normalized) {
    return true
  }

  try {
    const url = new URL(normalized)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
