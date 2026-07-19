<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <LibraryIcon :size="20" />
          </span>
          <h1>Cadastros</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Escolha um cadastro para gerenciar os registros auxiliares do sistema.
        </p>
      </div>
    </header>

    <section class="analytics-hub__grid registrations-hub" aria-label="Opções de cadastro">
      <RouterLink
        v-for="item in items"
        :key="item.name"
        class="fluent-card analytics-hub__card registrations-hub__card"
        :class="`registrations-hub__card--${item.colorGroup}`"
        :to="{ name: item.name }"
      >
        <span class="analytics-hub__card-icon" aria-hidden="true">
          <component :is="item.icon" :size="24" />
        </span>
        <span class="analytics-hub__card-body">
          <span class="analytics-hub__card-title">{{ item.label }}</span>
          <span class="analytics-hub__card-description">
            {{ item.description }}
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
import { ArrowRightIcon, LibraryIcon } from '@lucide/vue'
import { getAccessibleRegistrationNavItems } from '@/navigation/registrationNavItems'
import { useAuthStore } from '@/stores/authStore'

export default defineComponent({
  name: 'RegistrationsHubView',
  components: {
    ArrowRightIcon,
    LibraryIcon,
    RouterLink
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    items() {
      return getAccessibleRegistrationNavItems(this.authStore)
    }
  }
})
</script>
