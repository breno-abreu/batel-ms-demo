<template>
  <Teleport to="body">
    <Transition name="app-confirm">
      <div
        v-if="confirmation"
        class="app-confirm-overlay"
        role="presentation"
      >
        <section
          class="app-confirm"
          :class="`app-confirm--${confirmation.tone}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="messageId"
        >
          <button
            type="button"
            class="app-confirm__close"
            aria-label="Fechar confirmação"
            @click="dismiss"
          >
            <XIcon :size="16" aria-hidden="true" />
          </button>

          <div class="app-confirm__content">
            <span class="app-confirm__icon" aria-hidden="true">
              <TriangleAlertIcon :size="20" />
            </span>

            <div>
              <h2 :id="titleId" class="app-confirm__title">
                {{ confirmation.title }}
              </h2>
              <p :id="messageId" class="app-confirm__message">
                {{ confirmation.message }}
              </p>
            </div>
          </div>

          <div class="app-confirm__actions">
            <button
              type="button"
              class="field-button field-button--ghost"
              @click="secondary"
            >
              {{ confirmation.secondaryLabel }}
            </button>
            <button
              type="button"
              class="field-button app-confirm__confirm"
              @click="confirm"
            >
              {{ confirmation.confirmLabel }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { TriangleAlertIcon, XIcon } from '@lucide/vue'
import { useConfirmDialogStore } from '@/stores/confirmDialogStore'

export default defineComponent({
  name: 'AppConfirmDialog',
  components: {
    TriangleAlertIcon,
    XIcon
  },
  computed: {
    confirmDialogStore() {
      return useConfirmDialogStore()
    },
    confirmation() {
      return this.confirmDialogStore.current
    },
    titleId(): string {
      return this.confirmation ? `confirm-title-${this.confirmation.id}` : 'confirm-title'
    },
    messageId(): string {
      return this.confirmation ? `confirm-message-${this.confirmation.id}` : 'confirm-message'
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    confirm(): void {
      this.confirmDialogStore.confirm()
    },
    secondary(): void {
      this.confirmDialogStore.secondary()
    },
    dismiss(): void {
      this.confirmDialogStore.dismiss()
    },
    handleKeydown(event: KeyboardEvent): void {
      if (!this.confirmation || event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      event.stopImmediatePropagation()
      this.dismiss()
    }
  }
})
</script>
