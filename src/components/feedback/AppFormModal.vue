<template>
  <Teleport to="body">
    <Transition name="app-form-modal">
      <div
        v-if="modelValue"
        class="app-form-modal-overlay"
        role="presentation"
      >
        <section
          ref="modalContainer"
          class="app-form-modal"
          :class="{
            'app-form-modal--wide': wide,
            'app-form-modal--scrollable-body': scrollableBody
          }"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <button
            type="button"
            class="app-form-modal__close"
            aria-label="Fechar modal"
            @click="handleCancel"
          >
            <XIcon :size="16" aria-hidden="true" />
          </button>

          <h2 :id="titleId" class="app-form-modal__title">
            {{ title }}
          </h2>

          <div
            ref="modalBody"
            class="app-form-modal__body"
            :class="{ 'app-form-modal__body--can-scroll': bodyCanScroll }"
          >
            <slot />
          </div>

          <div class="app-form-modal__actions">
            <div class="app-form-modal__actions-start">
              <slot name="actions-start" />
            </div>
            <div class="app-form-modal__actions-end">
              <button
                v-if="!singleAction"
                type="button"
                class="field-button field-button--ghost"
                :disabled="loading"
                @click="handleCancel"
              >
                {{ cancelLabel }}
              </button>
              <button
                type="button"
                class="field-button"
                :disabled="loading || confirmDisabled"
                @click="handleConfirm"
              >
                {{ loading ? loadingLabel : confirmLabel }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { XIcon } from '@lucide/vue'
import { promptUnsavedChanges } from '@/services/unsavedChangesPrompt'
import { unsavedChangesStore } from '@/stores/unsavedChangesStore'

const BODY_OVERFLOW_TOLERANCE_PX = 2

export default defineComponent({
  name: 'AppFormModal',
  components: {
    XIcon
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    confirmLabel: {
      type: String,
      default: 'Salvar'
    },
    cancelLabel: {
      type: String,
      default: 'Cancelar'
    },
    loadingLabel: {
      type: String,
      default: 'Salvando...'
    },
    loading: {
      type: Boolean,
      default: false
    },
    confirmDisabled: {
      type: Boolean,
      default: false
    },
    singleAction: {
      type: Boolean,
      default: false
    },
    wide: {
      type: Boolean,
      default: false
    },
    scrollableBody: {
      type: Boolean,
      default: false
    },
    closeOnEscape: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  data() {
    return {
      closePromptOpen: false,
      bodyCanScroll: false,
      bodyResizeObserver: null as ResizeObserver | null,
      bodyMutationObserver: null as MutationObserver | null
    }
  },
  computed: {
    titleId(): string {
      return 'app-form-modal-title'
    }
  },
  watch: {
    modelValue(isOpen: boolean): void {
      if (isOpen) {
        window.addEventListener('keydown', this.handleKeydown)
        this.$nextTick(() => {
          this.bindBodyObservers()
          this.updateBodyScrollState()
        })
        return
      }

      window.removeEventListener('keydown', this.handleKeydown)
      this.teardownBodyObservers()
      this.bodyCanScroll = false
    },
    scrollableBody(): void {
      this.$nextTick(() => {
        this.bindBodyObservers()
        this.updateBodyScrollState()
      })
    }
  },
  mounted() {
    if (this.modelValue) {
      window.addEventListener('keydown', this.handleKeydown)
      this.$nextTick(() => {
        this.bindBodyObservers()
        this.updateBodyScrollState()
      })
    }

    window.addEventListener('resize', this.updateBodyScrollState)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('resize', this.updateBodyScrollState)
    this.teardownBodyObservers()
  },
  methods: {
    bindBodyObservers(): void {
      this.teardownBodyObservers()

      if (!this.scrollableBody || !this.modelValue) {
        return
      }

      const body = this.$refs.modalBody as HTMLElement | undefined

      if (!body) {
        return
      }

      if (typeof ResizeObserver !== 'undefined') {
        this.bodyResizeObserver = new ResizeObserver(() => {
          this.updateBodyScrollState()
        })
        this.bodyResizeObserver.observe(body)

        const container = this.$refs.modalContainer as HTMLElement | undefined

        if (container) {
          this.bodyResizeObserver.observe(container)
        }
      }

      if (typeof MutationObserver !== 'undefined') {
        this.bodyMutationObserver = new MutationObserver(() => {
          this.updateBodyScrollState()
        })
        this.bodyMutationObserver.observe(body, {
          childList: true,
          subtree: true,
          characterData: true
        })
      }
    },
    teardownBodyObservers(): void {
      this.bodyResizeObserver?.disconnect()
      this.bodyResizeObserver = null
      this.bodyMutationObserver?.disconnect()
      this.bodyMutationObserver = null
    },
    updateBodyScrollState(): void {
      if (!this.scrollableBody || !this.modelValue) {
        this.bodyCanScroll = false
        return
      }

      const body = this.$refs.modalBody as HTMLElement | undefined
      const container = this.$refs.modalContainer as HTMLElement | undefined

      if (!body || !container) {
        this.bodyCanScroll = false
        return
      }

      const containerStyles = window.getComputedStyle(container)
      const maxHeightValue = containerStyles.maxHeight
      const maxHeight = maxHeightValue.endsWith('px')
        ? Number.parseFloat(maxHeightValue)
        : container.clientHeight

      if (!Number.isFinite(maxHeight) || maxHeight <= 0) {
        this.bodyCanScroll = false
        return
      }

      const title = container.querySelector('.app-form-modal__title') as HTMLElement | null
      const actions = container.querySelector('.app-form-modal__actions') as HTMLElement | null
      const bodyStyles = window.getComputedStyle(body)
      const actionsStyles = actions ? window.getComputedStyle(actions) : null

      const paddingY =
        Number.parseFloat(containerStyles.paddingTop)
        + Number.parseFloat(containerStyles.paddingBottom)
      const bodyMarginY =
        Number.parseFloat(bodyStyles.marginTop)
        + Number.parseFloat(bodyStyles.marginBottom)
      const actionsMarginY = actionsStyles
        ? Number.parseFloat(actionsStyles.marginTop)
          + Number.parseFloat(actionsStyles.marginBottom)
        : 0

      const chromeHeight =
        paddingY
        + bodyMarginY
        + actionsMarginY
        + (title?.offsetHeight ?? 0)
        + (actions?.offsetHeight ?? 0)

      const totalContentHeight = chromeHeight + body.scrollHeight
      const needsScroll = totalContentHeight > maxHeight + BODY_OVERFLOW_TOLERANCE_PX

      this.bodyCanScroll = needsScroll
    },
    handleConfirm(): void {
      const container = this.$refs.modalContainer as HTMLElement | undefined

      if (container) {
        unsavedChangesStore.signalSubmission(
          unsavedChangesStore.getDirtySources(container)
        )
      }

      this.$emit('confirm')
    },
    handleCancel(): void {
      void this.requestClose()
    },
    async requestClose(): Promise<void> {
      if (this.loading || this.closePromptOpen) {
        return
      }

      const container = this.$refs.modalContainer as HTMLElement | undefined
      const dirtySources = container
        ? unsavedChangesStore.getDirtySources(container)
        : []

      if (dirtySources.length > 0) {
        this.closePromptOpen = true

        try {
          const choice = await promptUnsavedChanges()

          if (choice === 'dismiss') {
            return
          }

          if (choice === 'confirm') {
            this.handleConfirm()
            return
          }

          unsavedChangesStore.discard(dirtySources)
        } finally {
          this.closePromptOpen = false
        }
      }

      this.$emit('update:modelValue', false)
      this.$emit('cancel')
    },
    handleKeydown(event: KeyboardEvent): void {
      if (!this.modelValue || !this.closeOnEscape || event.key !== 'Escape') {
        return
      }

      this.handleCancel()
    }
  }
})
</script>
