<template>
  <Teleport to="body">
    <div
      class="app-toast-container"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup name="app-toast">
        <article
          v-for="toast in toastItems"
          :key="toast.id"
          class="app-toast"
          :class="`app-toast--${toast.type}`"
          role="status"
        >
          <component
            :is="iconByType[toast.type]"
            class="app-toast__icon"
            :size="18"
            aria-hidden="true"
          />
          <p class="app-toast__message">
            {{ toast.message }}
          </p>
          <button
            type="button"
            class="app-toast__close"
            aria-label="Fechar notificação"
            @click="dismissToast(toast.id)"
          >
            <XIcon :size="16" aria-hidden="true" />
          </button>
        </article>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, type Component } from 'vue'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon
} from '@lucide/vue'
import { useToastStore } from '@/stores/toastStore'
import type { ToastType } from '@/types/toast'

export default defineComponent({
  name: 'AppToastContainer',
  components: {
    CircleAlertIcon,
    CircleCheckIcon,
    InfoIcon,
    TriangleAlertIcon,
    XIcon
  },
  computed: {
    toastStore() {
      return useToastStore()
    },
    toastItems() {
      return this.toastStore.items
    },
    iconByType(): Record<ToastType, Component> {
      return {
        success: CircleCheckIcon,
        error: CircleAlertIcon,
        info: InfoIcon,
        warning: TriangleAlertIcon
      }
    }
  },
  methods: {
    dismissToast(id: string): void {
      this.toastStore.dismiss(id)
    }
  }
})
</script>
