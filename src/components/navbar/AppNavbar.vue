<template>
  <header class="app-navbar">
    <div class="app-navbar__inner">
      <nav class="app-navbar__actions">
        <button
          v-if="hasBirthdaysToday"
          type="button"
          class="app-navbar__birthdays"
          aria-label="Aniversários de hoje"
          @click="openBirthdayGreeting"
        >
          <CakeIcon :size="18" aria-hidden="true" />
          <span>Aniversários</span>
          <span
            class="app-navbar__birthdays-badge"
            aria-hidden="true"
          />
        </button>

        <RouterLink
          class="app-navbar__support"
          :class="{ 'router-link-active': isSupportActive }"
          :to="{ name: 'support-tickets' }"
          aria-label="Suporte"
        >
          <LifeBuoyIcon :size="18" aria-hidden="true" />
          <span>Suporte</span>
        </RouterLink>

        <div class="app-navbar__zoom" role="group" aria-label="Zoom da interface">
          <button
            type="button"
            class="app-navbar__zoom-button"
            aria-label="Diminuir zoom"
            :disabled="!canZoomOut"
            @click="zoomOut"
          >
            <ZoomOutIcon :size="18" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="app-navbar__zoom-button app-navbar__zoom-button--reset"
            :aria-label="isDefaultZoom ? 'Zoom padrão' : `Restabelecer zoom padrão (atual ${zoomPercent}%)`"
            :title="isDefaultZoom ? 'Zoom padrão' : `Voltar para 100%`"
            :disabled="isDefaultZoom"
            @click="resetZoom"
          >
            <span aria-hidden="true">{{ zoomPercent }}%</span>
          </button>
          <button
            type="button"
            class="app-navbar__zoom-button"
            aria-label="Aumentar zoom"
            :disabled="!canZoomIn"
            @click="zoomIn"
          >
            <ZoomInIcon :size="18" aria-hidden="true" />
          </button>
        </div>

        <div ref="profileMenu" class="app-navbar__profile-menu">
          <button
            type="button"
            class="app-navbar__profile"
            :aria-expanded="isMenuOpen"
            aria-haspopup="menu"
            @click="toggleMenu"
          >
            <span class="app-navbar__profile-name">{{ displayName }}</span>
            <span class="app-navbar__avatar" aria-hidden="true">
              {{ userInitials }}
            </span>
          </button>

          <div v-if="isMenuOpen" class="app-navbar__dropdown fluent-card" role="menu">
            <RouterLink
              class="app-navbar__dropdown-item"
              role="menuitem"
              :to="{ name: 'account-profile' }"
              @click="closeMenu"
            >
              <UserIcon :size="18" />
              Meus dados
            </RouterLink>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { CakeIcon, LifeBuoyIcon, UserIcon, ZoomInIcon, ZoomOutIcon } from '@lucide/vue'
import { DEMO_USER, getDemoDisplayName } from '@/demo/demoUser'
import {
  decreaseUiZoom,
  getUiZoom,
  increaseUiZoom,
  setUiZoom,
  UI_ZOOM_DEFAULT,
  UI_ZOOM_MAX,
  UI_ZOOM_MIN
} from '@/services/uiZoomStorage'
import { useBirthdayGreetingStore } from '@/stores/birthdayGreetingStore'

function buildInitials(fullName: string, preferredName: string | null): string {
  const source = preferredName?.trim() || fullName.trim()

  if (!source) {
    return '?'
  }

  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  const firstInitial = parts[0].charAt(0)
  const lastInitial = parts[parts.length - 1].charAt(0)

  return `${firstInitial}${lastInitial}`.toUpperCase()
}

export default defineComponent({
  name: 'AppNavbar',
  components: {
    CakeIcon,
    LifeBuoyIcon,
    RouterLink,
    UserIcon,
    ZoomInIcon,
    ZoomOutIcon
  },
  data() {
    return {
      isMenuOpen: false,
      uiZoom: getUiZoom()
    }
  },
  computed: {
    birthdayStore() {
      return useBirthdayGreetingStore()
    },
    hasBirthdaysToday(): boolean {
      return this.birthdayStore.hasBirthdaysToday
    },
    displayName(): string {
      return getDemoDisplayName(DEMO_USER)
    },
    userInitials(): string {
      return buildInitials(DEMO_USER.fullName, DEMO_USER.preferredName)
    },
    isSupportActive(): boolean {
      return this.$route.name === 'support-tickets'
    },
    canZoomIn(): boolean {
      return this.uiZoom < UI_ZOOM_MAX
    },
    canZoomOut(): boolean {
      return this.uiZoom > UI_ZOOM_MIN
    },
    isDefaultZoom(): boolean {
      return this.uiZoom === UI_ZOOM_DEFAULT
    },
    zoomPercent(): number {
      return Math.round(this.uiZoom * 100)
    }
  },
  mounted() {
    this.uiZoom = getUiZoom()
    document.addEventListener('click', this.handleDocumentClick)
    void this.birthdayStore.loadToday()
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleDocumentClick)
  },
  methods: {
    openBirthdayGreeting(): void {
      void this.birthdayStore.open()
    },

    zoomIn(): void {
      this.uiZoom = increaseUiZoom()
    },

    zoomOut(): void {
      this.uiZoom = decreaseUiZoom()
    },

    resetZoom(): void {
      this.uiZoom = setUiZoom(UI_ZOOM_DEFAULT)
    },

    toggleMenu(): void {
      this.isMenuOpen = !this.isMenuOpen
    },

    closeMenu(): void {
      this.isMenuOpen = false
    },

    handleDocumentClick(event: MouseEvent): void {
      const menuRoot = this.$refs.profileMenu as HTMLElement | undefined

      if (!menuRoot || menuRoot.contains(event.target as Node)) {
        return
      }

      this.closeMenu()
    }
  }
})
</script>
