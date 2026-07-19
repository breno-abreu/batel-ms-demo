<template>
  <section class="error-page">
    <article class="error-page__panel fluent-card">
      <div class="error-page__visual">
        <span class="error-page__icon-wrap" aria-hidden="true">
          <SearchXIcon :size="28" />
        </span>
        <p class="error-page__code">
          404
        </p>
      </div>

      <div class="error-page__body">
        <p class="eyebrow">
          Página não encontrada
        </p>
        <h1 class="error-page__title">
          Não encontramos essa página
        </h1>
        <p class="description error-page__description">
          O endereço solicitado não existe ou o recurso retornado pela API não foi localizado.
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
import { HomeIcon, SearchXIcon } from '@lucide/vue'

export default defineComponent({
  name: 'NotFoundView',
  components: {
    HomeIcon,
    SearchXIcon
  },
  methods: {
    goHome(): void {
      this.$router.push({ name: 'home' })
    }
  }
})
</script>
