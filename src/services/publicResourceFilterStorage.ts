const STORAGE_KEY = 'batelms.public.resourceFilter'

export type PublicResourceFilter =
  | 'all'
  | 'reference1'
  | 'reference2'
  | 'lyrics'
  | 'playback'
  | 'soprano'
  | 'contralto'
  | 'tenor'
  | 'chord'
  | 'sheetMusic'

const VALID_FILTERS: ReadonlySet<PublicResourceFilter> = new Set([
  'all',
  'reference1',
  'reference2',
  'lyrics',
  'playback',
  'soprano',
  'contralto',
  'tenor',
  'chord',
  'sheetMusic'
])

export function getPublicResourceFilter(): PublicResourceFilter {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY)

    if (!rawValue || !VALID_FILTERS.has(rawValue as PublicResourceFilter)) {
      return 'all'
    }

    return rawValue as PublicResourceFilter
  } catch {
    return 'all'
  }
}

export function setPublicResourceFilter(value: PublicResourceFilter): void {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Ignore storage failures (private mode, quota, etc).
  }
}

export function resolvePublicResourceFilter(
  availableValues: readonly PublicResourceFilter[]
): PublicResourceFilter {
  const saved = getPublicResourceFilter()

  if (availableValues.includes(saved)) {
    return saved
  }

  return 'all'
}
