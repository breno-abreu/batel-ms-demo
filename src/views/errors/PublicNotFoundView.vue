<template>
  <section class="error-page error-page--public">
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
          Conteúdo não encontrado
        </p>
        <h1 class="error-page__title">
          Este link não está disponível
        </h1>
        <p class="description error-page__description">
          O endereço pode estar incorreto, ter expirado ou ter sido desativado pelo responsável.
        </p>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { SearchXIcon } from '@lucide/vue'

export default defineComponent({
  name: 'PublicNotFoundView',
  components: {
    SearchXIcon
  }
})
</script>
