/** Monta URL absoluta respeitando o base path (ex.: `/batel-ms-demo/` no GitHub Pages). */
export function buildAppAbsoluteUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const relative = `${normalizedBase}${normalizedPath}`

  if (typeof window === 'undefined') {
    return relative
  }

  return `${window.location.origin}${relative}`
}

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
