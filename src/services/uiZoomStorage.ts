const STORAGE_KEY = 'batelms.ui.zoom'

export const UI_ZOOM_DEFAULT = 1
export const UI_ZOOM_MIN = 0.7
export const UI_ZOOM_MAX = 1.3
export const UI_ZOOM_STEP = 0.1

function clampZoom(value: number): number {
  const stepped = Math.round(value / UI_ZOOM_STEP) * UI_ZOOM_STEP
  const clamped = Math.min(UI_ZOOM_MAX, Math.max(UI_ZOOM_MIN, stepped))
  return Number(clamped.toFixed(1))
}

function getVisualViewportSize(): { width: number; height: number } {
  const width = window.visualViewport?.width
    ?? document.documentElement.clientWidth
    ?? window.innerWidth
  const height = window.visualViewport?.height
    ?? document.documentElement.clientHeight
    ?? window.innerHeight

  return {
    width: Math.max(1, Math.floor(width)),
    height: Math.max(1, Math.floor(height))
  }
}

export function getUiZoom(): number {
  const rawValue = localStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    return UI_ZOOM_DEFAULT
  }

  const parsed = Number(rawValue)

  if (!Number.isFinite(parsed)) {
    return UI_ZOOM_DEFAULT
  }

  return clampZoom(parsed)
}

/**
 * Em 100%: layout normal (sem zoom/transform) — Chart.js precisa disso.
 * Em outros níveis: CSS `zoom` no body + frame = viewport/zoom.
 * Evita `transform: scale()`, que corrompe a área de plotagem do Chart.js.
 */
export function syncAppFrameSize(zoom = getUiZoom()): void {
  const { width, height } = getVisualViewportSize()
  const root = document.documentElement

  root.style.setProperty('--app-ui-zoom', String(zoom))

  if (zoom === UI_ZOOM_DEFAULT) {
    root.style.setProperty('--app-frame-width', `${width}px`)
    root.style.setProperty('--app-frame-height', `${height}px`)
    return
  }

  root.style.setProperty('--app-frame-width', `${Math.max(1, Math.floor(width / zoom))}px`)
  root.style.setProperty('--app-frame-height', `${Math.max(1, Math.floor(height / zoom))}px`)
}

export function applyUiZoom(zoom = getUiZoom()): void {
  const root = document.documentElement
  const body = document.body
  const isDefaultZoom = zoom === UI_ZOOM_DEFAULT

  root.dataset.uiZoom = String(Math.round(zoom * 100))
  root.classList.toggle('app-ui-zoomed', !isDefaultZoom)

  // Nunca usar transform:scale no shell — quebra Chart.js.
  root.style.removeProperty('zoom')
  if (body) {
    body.style.removeProperty('transform')
    if (isDefaultZoom) {
      body.style.removeProperty('zoom')
    } else {
      body.style.zoom = String(zoom)
    }
  }

  syncAppFrameSize(zoom)
  window.dispatchEvent(new CustomEvent('batelms:ui-zoom-changed', { detail: { zoom } }))
}

export function setUiZoom(zoom: number): number {
  const nextZoom = clampZoom(zoom)
  localStorage.setItem(STORAGE_KEY, String(nextZoom))
  applyUiZoom(nextZoom)
  return nextZoom
}

export function increaseUiZoom(): number {
  return setUiZoom(getUiZoom() + UI_ZOOM_STEP)
}

export function decreaseUiZoom(): number {
  return setUiZoom(getUiZoom() - UI_ZOOM_STEP)
}

export function setupAppFrameHeightSync(): void {
  const sync = (): void => {
    syncAppFrameSize(getUiZoom())
  }

  window.addEventListener('resize', sync)
  window.visualViewport?.addEventListener('resize', sync)
  window.visualViewport?.addEventListener('scroll', sync)
  sync()
}
