import type { Directive, DirectiveBinding } from 'vue'
import { promptUnsavedChanges } from '@/services/unsavedChangesPrompt'
import { unsavedChangesStore } from '@/stores/unsavedChangesStore'

type DirectiveListeners = {
  markDirty: () => void
  signalSubmission: () => void
  requestClose: (event: MouseEvent) => void
}

type ComponentWithRoute = {
  $route?: {
    fullPath?: string
  }
}

const listenersByForm = new WeakMap<HTMLFormElement, DirectiveListeners>()
const allowedCloseButtons = new WeakSet<HTMLElement>()

function getRouteKey(binding: DirectiveBinding): string {
  const instance = binding.instance as ComponentWithRoute | null
  return instance?.$route?.fullPath ?? window.location.pathname + window.location.search
}

export const unsavedChangesDirective: Directive<HTMLElement> = {
  mounted(element, binding): void {
    if (!(element instanceof HTMLFormElement)) {
      console.warn('A diretiva v-unsaved-changes deve ser aplicada a um elemento <form>.')
      return
    }

    const source = unsavedChangesStore.register(element, getRouteKey(binding))
    const listeners: DirectiveListeners = {
      markDirty: () => unsavedChangesStore.markDirty(source),
      signalSubmission: () => unsavedChangesStore.signalSubmission([source]),
      requestClose: (event: MouseEvent) => {
        const eventTarget = event.target instanceof Element ? event.target : null
        const changeTarget = eventTarget?.closest<HTMLElement>('[data-unsaved-change]')

        if (changeTarget && element.contains(changeTarget)) {
          unsavedChangesStore.markDirty(source)
        }

        const target = eventTarget?.closest<HTMLElement>('[data-unsaved-close]') ?? null

        if (!target || !element.contains(target)) {
          return
        }

        if (allowedCloseButtons.has(target)) {
          allowedCloseButtons.delete(target)
          return
        }

        const dirtySources = unsavedChangesStore.getDirtySources(element)

        if (dirtySources.length === 0) {
          return
        }

        event.preventDefault()
        event.stopImmediatePropagation()

        void promptUnsavedChanges().then(async (choice) => {
          if (choice === 'confirm') {
            await unsavedChangesStore.save(dirtySources)
            return
          }

          if (choice === 'secondary') {
            unsavedChangesStore.discard(dirtySources)
            allowedCloseButtons.add(target)
            target.click()
          }
        })
      }
    }

    element.addEventListener('input', listeners.markDirty)
    element.addEventListener('change', listeners.markDirty)
    element.addEventListener('submit', listeners.signalSubmission, true)
    element.addEventListener('click', listeners.requestClose, true)
    listenersByForm.set(element, listeners)
  },

  updated(element, binding): void {
    if (element instanceof HTMLFormElement) {
      unsavedChangesStore.updateRouteKey(element, getRouteKey(binding))
    }
  },

  beforeUnmount(element): void {
    if (!(element instanceof HTMLFormElement)) {
      return
    }

    const listeners = listenersByForm.get(element)

    if (listeners) {
      element.removeEventListener('input', listeners.markDirty)
      element.removeEventListener('change', listeners.markDirty)
      element.removeEventListener('submit', listeners.signalSubmission, true)
      element.removeEventListener('click', listeners.requestClose, true)
      listenersByForm.delete(element)
    }

    unsavedChangesStore.unregister(element)
  }
}
