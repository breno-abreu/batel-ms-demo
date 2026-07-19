import { readonly, ref, type Ref } from 'vue'

export type UnsavedChangesSource = {
  id: string
  form: HTMLFormElement
  routeKey: string
}

type SourceState = UnsavedChangesSource & {
  dirty: boolean
  savingOperationId: string | null
}

export type SavingOperation = {
  id: string
  sourceId: string
  completion: Promise<boolean>
}

type SubmissionContext = {
  sourceIds: string[]
  expiresAt: number
}

type SaveStart = {
  completion: Promise<boolean>
}

const sources = new Map<string, SourceState>()
const sourceIdsByForm = new WeakMap<HTMLFormElement, string>()
const saveStartWaiters = new Map<string, Set<(saveStart: SaveStart | null) => void>>()
const dirtyCount = ref(0)
let submissionContext: SubmissionContext | null = null
let beforeUnloadEnabled = false

function handleBeforeUnload(event: BeforeUnloadEvent): void {
  event.preventDefault()
  event.returnValue = ''
}

function syncDirtyState(): void {
  dirtyCount.value = Array.from(sources.values()).filter((source) => source.dirty).length

  if (!beforeUnloadEnabled) {
    return
  }

  if (dirtyCount.value > 0) {
    window.addEventListener('beforeunload', handleBeforeUnload)
    return
  }

  window.removeEventListener('beforeunload', handleBeforeUnload)
}

function getState(sourceOrForm: UnsavedChangesSource | HTMLFormElement): SourceState | null {
  const sourceId = sourceOrForm instanceof HTMLFormElement
    ? sourceIdsByForm.get(sourceOrForm)
    : sourceOrForm.id

  return sourceId ? sources.get(sourceId) ?? null : null
}

function resolveSaveStartWaiters(
  sourceId: string,
  saveStart: SaveStart | null
): void {
  const waiters = saveStartWaiters.get(sourceId)

  if (!waiters) {
    return
  }

  saveStartWaiters.delete(sourceId)
  waiters.forEach((resolve) => resolve(saveStart))
}

function waitForSaveStart(sourceId: string): Promise<SaveStart | null> {
  const current = sources.get(sourceId)

  if (current?.savingOperationId) {
    const operation = savingOperations.get(current.savingOperationId)
    return Promise.resolve(operation ? { completion: operation.completion } : null)
  }

  return new Promise((resolve) => {
    const waiters = saveStartWaiters.get(sourceId) ?? new Set()
    let settled = false

    const finish = (saveStart: SaveStart | null): void => {
      if (settled) {
        return
      }

      settled = true
      window.clearTimeout(timeoutId)
      waiters.delete(finish)
      resolve(saveStart)
    }

    const timeoutId = window.setTimeout(() => finish(null), 2000)
    waiters.add(finish)
    saveStartWaiters.set(sourceId, waiters)
  })
}

function isInsideContainer(form: HTMLFormElement, container?: Element): boolean {
  return !container || container === form || container.contains(form)
}

export const unsavedChangesStore = {
  dirtyCount: readonly(dirtyCount) as Readonly<Ref<number>>,

  register(form: HTMLFormElement, routeKey: string): UnsavedChangesSource {
    const existingId = sourceIdsByForm.get(form)
    const existing = existingId ? sources.get(existingId) : null

    if (existing) {
      return existing
    }

    const source: SourceState = {
      id: crypto.randomUUID(),
      form,
      routeKey,
      dirty: false,
      savingOperationId: null
    }

    sources.set(source.id, source)
    sourceIdsByForm.set(form, source.id)
    return source
  },

  unregister(form: HTMLFormElement): void {
    const sourceId = sourceIdsByForm.get(form)

    if (!sourceId) {
      return
    }

    sourceIdsByForm.delete(form)
    sources.delete(sourceId)
    resolveSaveStartWaiters(sourceId, null)
    syncDirtyState()
  },

  updateRouteKey(form: HTMLFormElement, routeKey: string): void {
    const source = getState(form)

    if (source) {
      source.routeKey = routeKey
    }
  },

  markDirty(sourceOrForm: UnsavedChangesSource | HTMLFormElement): void {
    const source = getState(sourceOrForm)

    if (!source || source.dirty) {
      return
    }

    source.dirty = true
    syncDirtyState()
  },

  markClean(sourceOrForm: UnsavedChangesSource | HTMLFormElement): void {
    const source = getState(sourceOrForm)

    if (!source || !source.dirty) {
      return
    }

    source.dirty = false
    syncDirtyState()
  },

  getDirtySources(container?: Element): UnsavedChangesSource[] {
    return Array.from(sources.values())
      .filter((source) => source.dirty && isInsideContainer(source.form, container))
  },

  getDirtySourcesForRoute(routeKey: string): UnsavedChangesSource[] {
    return Array.from(sources.values())
      .filter((source) => source.dirty && source.routeKey === routeKey)
  },

  discard(sourceList: UnsavedChangesSource[]): void {
    sourceList.forEach((item) => {
      const source = sources.get(item.id)

      if (source) {
        source.dirty = false
      }
    })
    syncDirtyState()
  },

  signalSubmission(sourceList: UnsavedChangesSource[]): void {
    const dirtySourceIds = sourceList
      .map((source) => sources.get(source.id))
      .filter((source): source is SourceState => Boolean(source?.dirty))
      .map((source) => source.id)

    const context: SubmissionContext | null = dirtySourceIds.length > 0
      ? {
          sourceIds: dirtySourceIds,
          expiresAt: Date.now() + 1000
        }
      : null

    submissionContext = context

    if (context) {
      window.setTimeout(() => {
        if (submissionContext === context) {
          submissionContext = null
        }
      }, 0)
    }
  },

  signalFormSubmission(form: HTMLFormElement): void {
    const source = getState(form)

    if (source) {
      this.signalSubmission([source])
    }
  },

  beginSavingFromSubmission(method: string): SavingOperation | null {
    const normalizedMethod = method.toUpperCase()

    if (!['POST', 'PUT', 'PATCH'].includes(normalizedMethod)) {
      return null
    }

    if (!submissionContext || submissionContext.expiresAt < Date.now()) {
      submissionContext = null
      return null
    }

    const source = submissionContext.sourceIds
      .map((sourceId) => sources.get(sourceId))
      .find((candidate) => candidate?.dirty && !candidate.savingOperationId)

    if (!source) {
      submissionContext = null
      return null
    }

    submissionContext.sourceIds = submissionContext.sourceIds.filter(
      (sourceId) => sourceId !== source.id
    )

    if (submissionContext.sourceIds.length === 0) {
      submissionContext = null
    }

    const operationId = crypto.randomUUID()
    let resolveCompletion: (succeeded: boolean) => void = () => undefined
    const completion = new Promise<boolean>((resolve) => {
      resolveCompletion = resolve
    })

    source.savingOperationId = operationId
    const operation: SavingOperation & { resolveCompletion: (succeeded: boolean) => void } = {
      id: operationId,
      sourceId: source.id,
      completion,
      resolveCompletion
    }

    savingOperations.set(operation.id, operation)
    resolveSaveStartWaiters(source.id, { completion })
    return operation
  },

  finishSaving(operation: SavingOperation, succeeded: boolean): void {
    const trackedOperation = savingOperations.get(operation.id)
    const source = sources.get(operation.sourceId)

    if (!trackedOperation) {
      return
    }

    savingOperations.delete(operation.id)

    if (source?.savingOperationId === operation.id) {
      source.savingOperationId = null

      if (succeeded) {
        source.dirty = false
      }
    }

    trackedOperation.resolveCompletion(succeeded)
    syncDirtyState()
  },

  async save(sourceList: UnsavedChangesSource[]): Promise<boolean> {
    for (const item of sourceList) {
      const source = sources.get(item.id)

      if (!source?.dirty || !source.form.isConnected) {
        continue
      }

      if (!source.form.checkValidity()) {
        source.form.reportValidity()
        return false
      }

      const saveStarted = waitForSaveStart(source.id)
      this.signalSubmission([source])
      source.form.requestSubmit()
      const startedSave = await saveStarted

      if (!startedSave || !await startedSave.completion) {
        return false
      }
    }

    return true
  },

  setupBeforeUnload(): () => void {
    beforeUnloadEnabled = true
    syncDirtyState()

    return () => {
      beforeUnloadEnabled = false
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }
}

const savingOperations = new Map<
  string,
  SavingOperation & { resolveCompletion: (succeeded: boolean) => void }
>()
