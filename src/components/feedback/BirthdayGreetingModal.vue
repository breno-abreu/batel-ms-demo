<template>
  <Teleport to="body">
    <Transition name="birthday-greeting">
      <div
        v-if="store.visible"
        class="birthday-greeting-overlay"
        role="presentation"
      >
        <section
          class="birthday-greeting-modal fluent-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="birthday-greeting-title"
        >
          <div class="birthday-greeting-modal__hero" aria-hidden="true">
            <span class="birthday-greeting-modal__icon-ring">
              <PartyPopperIcon :size="36" />
            </span>
          </div>

          <h2 id="birthday-greeting-title" class="birthday-greeting-modal__title">
            Tem aniversário hoje!
          </h2>
          <p class="birthday-greeting-modal__subtitle">
            {{ store.greetingCopy }}
          </p>

          <ul class="birthday-greeting-modal__list" aria-label="Aniversariantes de hoje">
            <li
              v-for="item in store.items"
              :key="item.id"
              class="birthday-greeting-modal__item"
            >
              <span class="birthday-greeting-modal__cake" aria-hidden="true">
                <CakeIcon :size="18" />
              </span>
              <span class="birthday-greeting-modal__name">{{ displayName(item) }}</span>
            </li>
          </ul>

          <div class="birthday-greeting-modal__actions">
            <button
              type="button"
              class="repertoire-button"
              @click="store.close()"
            >
              Que legal!
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CakeIcon, PartyPopperIcon } from '@lucide/vue'
import { useBirthdayGreetingStore } from '@/stores/birthdayGreetingStore'
import type { PersonBirthdayItem } from '@/types/people'

export default defineComponent({
  name: 'BirthdayGreetingModal',
  components: {
    CakeIcon,
    PartyPopperIcon
  },
  props: {
    enabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    store() {
      return useBirthdayGreetingStore()
    }
  },
  watch: {
    enabled: {
      immediate: true,
      async handler(isEnabled: boolean) {
        if (!isEnabled) {
          this.store.close()
          this.store.reset()
          return
        }

        await this.store.tryAutoShow()
      }
    }
  },
  methods: {
    displayName(item: PersonBirthdayItem): string {
      return item.preferredName || item.fullName
    }
  }
})
</script>
