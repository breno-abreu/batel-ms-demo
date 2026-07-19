<template>
  <section class="error-page error-page--warning">
    <article class="error-page__panel fluent-card">
      <div class="error-page__visual">
        <span class="error-page__icon-wrap" aria-hidden="true">
          <ShieldAlertIcon :size="28" />
        </span>
        <p class="error-page__code">
          401
        </p>
      </div>

      <div class="error-page__body">
        <p class="eyebrow">
          Acesso não autorizado
        </p>
        <h1 class="error-page__title">
          Sem permissão para acessar
        </h1>
        <p class="description error-page__description">
          {{ description }}
        </p>
      </div>

      <div class="error-page__actions">
        <button type="button" class="repertoire-button" @click="goHome">
          <HomeIcon :size="16" aria-hidden="true" />
          Voltar para o início
        </button>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { HomeIcon, ShieldAlertIcon } from '@lucide/vue'
import { useAuthStore } from '@/stores/authStore'

export default defineComponent({
  name: 'UnauthorizedView',
  components: {
    HomeIcon,
    ShieldAlertIcon
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    description(): string {
      if (this.authStore.isAuthenticated) {
        return 'Sua sessão está ativa, mas você não possui permissão para acessar este recurso.'
      }

      return 'Você precisa estar autenticado ou possuir permissão para acessar este recurso.'
    }
  },
  methods: {
    goHome(): void {
      this.$router.push({ name: 'home' })
    }
  }
})
</script>
