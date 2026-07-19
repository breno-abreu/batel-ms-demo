import type { Router } from 'vue-router'
import { promptUnsavedChanges } from '@/services/unsavedChangesPrompt'
import { unsavedChangesStore } from '@/stores/unsavedChangesStore'

export function setupUnsavedChangesGuard(router: Router): void {
  router.beforeEach(async (to, from) => {
    if (to.fullPath === from.fullPath) {
      return true
    }

    const dirtySources = unsavedChangesStore.getDirtySourcesForRoute(from.fullPath)

    if (dirtySources.length === 0) {
      return true
    }

    const choice = await promptUnsavedChanges()

    if (choice === 'dismiss') {
      return false
    }

    if (choice === 'secondary') {
      unsavedChangesStore.discard(dirtySources)
      return true
    }

    return unsavedChangesStore.save(dirtySources)
  })
}
