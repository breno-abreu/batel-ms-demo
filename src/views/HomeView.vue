<template>
  <section class="repertoire-page repertoire-page--wide home-page">
    <header class="repertoire-page__header">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <HomeIcon :size="20" />
          </span>
          <h1>Início</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Acesso rápido às principais áreas do Bless App.
        </p>
      </div>
    </header>

    <section class="analytics-hub__grid" aria-label="Atalhos do sistema">
      <RouterLink
        v-for="shortcut in shortcuts"
        :key="shortcut.name"
        class="fluent-card analytics-hub__card registrations-hub__card"
        :class="`registrations-hub__card--${shortcut.colorGroup}`"
        :to="{ name: shortcut.name }"
      >
        <span class="analytics-hub__card-icon" aria-hidden="true">
          <component :is="shortcut.icon" :size="24" />
        </span>
        <span class="analytics-hub__card-body">
          <span class="analytics-hub__card-title">{{ shortcut.label }}</span>
          <span class="analytics-hub__card-description">
            {{ shortcut.description }}
          </span>
        </span>
        <ArrowRightIcon class="analytics-hub__card-arrow" :size="18" aria-hidden="true" />
      </RouterLink>
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRightIcon, HomeIcon } from '@lucide/vue'
import { getHomeShortcutItems } from '@/navigation/sidebarNavItems'
import { useAuthStore } from '@/stores/authStore'

export default defineComponent({
  name: 'HomeView',
  components: {
    ArrowRightIcon,
    HomeIcon,
    RouterLink
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    shortcuts() {
      return getHomeShortcutItems(this.authStore)
    }
  }
})
</script>
