<template>
  <section class="error-page error-page--mobile-unsupported">
    <article class="error-page__panel fluent-card">
      <div class="error-page__visual">
        <span class="error-page__icon-wrap" aria-hidden="true">
          <MonitorSmartphoneIcon :size="28" />
        </span>
      </div>

      <div class="error-page__body">
        <p class="eyebrow">
          Dispositivo não suportado
        </p>
        <h1 class="error-page__title">
          Use um computador ou tablet
        </h1>
        <p class="description error-page__description">
          Este aplicativo não é apropriado para uso em celular.
          Para utilizá-lo, acesse pelo computador ou tablet.
        </p>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { MonitorSmartphoneIcon } from '@lucide/vue'

export default defineComponent({
  name: 'MobileUnsupportedView',
  components: {
    MonitorSmartphoneIcon
  }
})
</script>
