import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Lara from '@primeuix/themes/lara'
import { definePreset, palette } from '@primeuix/themes'
import { createPinia } from 'pinia'
import 'primeicons/primeicons.css'
import '@/style.css'
import App from '@/App.vue'
import { unsavedChangesDirective } from '@/directives/unsavedChanges'
import router from '@/router'
import { setupAuthGuard } from '@/router/authGuard'
import { setupUnsavedChangesGuard } from '@/router/unsavedChangesGuard'
import { applyUiZoom, setupAppFrameHeightSync } from '@/services/uiZoomStorage'
import { useAuthStore } from '@/stores/authStore'
import { unsavedChangesStore } from '@/stores/unsavedChangesStore'

function initializeUiZoom(): void {
  applyUiZoom()
  setupAppFrameHeightSync()
}

if (document.body) {
  initializeUiZoom()
} else {
  document.addEventListener('DOMContentLoaded', initializeUiZoom, { once: true })
}

const BatelPreset = definePreset(Lara, {
  semantic: {
    primary: palette('#2f557f'),
    borderRadius: {
      none: '0',
      xs: '0',
      sm: '0',
      md: '0',
      lg: '0',
      xl: '0'
    }
  }
})

async function bootstrap(): Promise<void> {
  const app = createApp(App)
  const pinia = createPinia()

  app.config.errorHandler = (error, _instance, info) => {
    console.error('[Bless App] Erro na interface:', error, info)
  }

  app.directive('unsaved-changes', unsavedChangesDirective)
  app.use(pinia)
  app.use(router)
  setupAuthGuard(router)
  setupUnsavedChangesGuard(router)
  unsavedChangesStore.setupBeforeUnload()
  app.use(PrimeVue, {
    theme: {
      preset: BatelPreset
    }
  })

  const authStore = useAuthStore(pinia)
  authStore.initializeFromStorage()
  await authStore.ensureValidSession()

  app.mount('#app')
}

void bootstrap()
