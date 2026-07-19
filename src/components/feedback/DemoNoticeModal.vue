<template>
  <Teleport to="body">
    <Transition name="demo-notice">
      <div
        v-if="visible"
        class="demo-notice-overlay"
        role="presentation"
      >
        <section
          class="demo-notice fluent-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-notice-title"
          aria-describedby="demo-notice-message"
        >
          <div class="demo-notice__header">
            <span class="demo-notice__icon" aria-hidden="true">
              <InfoIcon :size="22" />
            </span>
            <div>
              <h2 id="demo-notice-title" class="demo-notice__title">
                Versão de demonstração
              </h2>
              <p id="demo-notice-message" class="demo-notice__lead">
                Esta é uma versão demo com dados fictícios, pensada apenas para
                explorar a interface.
              </p>
            </div>
          </div>

          <p class="demo-notice__body">
            A versão completa conta com backend em ASP.NET, banco de dados
            PostgreSQL e roda em uma VPS containerizada com Docker.
          </p>

          <div class="demo-notice__actions">
            <button
              type="button"
              class="repertoire-button"
              @click="dismiss"
            >
              Entendi
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { InfoIcon } from '@lucide/vue'

export default defineComponent({
  name: 'DemoNoticeModal',
  components: {
    InfoIcon
  },
  props: {
    enabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false
    }
  },
  watch: {
    enabled: {
      immediate: true,
      handler(isEnabled: boolean) {
        this.visible = isEnabled
      }
    }
  },
  methods: {
    dismiss(): void {
      this.visible = false
    }
  }
})
</script>
