<template>
  <Teleport to="body">
    <Transition name="event-form-card">
      <div
        v-if="modelValue"
        class="event-series-scope-overlay"
        role="presentation"
      >
        <section
          class="event-series-scope-modal fluent-card"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <header class="event-series-scope-modal__header">
            <h2 :id="titleId" class="event-series-scope-modal__title">
              {{ title }}
            </h2>
          </header>

          <div class="event-series-scope-modal__body">
            <p class="event-series-scope-modal__message">
              {{ message }}
            </p>

            <div class="event-series-scope-modal__options" role="radiogroup" :aria-labelledby="titleId">
              <label
                v-for="option in scopeOptions"
                :key="option.value"
                class="event-series-scope-modal__option"
                :class="{ 'event-series-scope-modal__option--selected': selectedScope === option.value }"
              >
                <input
                  v-model="selectedScope"
                  type="radio"
                  class="event-series-scope-modal__radio"
                  name="event-series-scope"
                  :value="option.value"
                >
                <span class="event-series-scope-modal__option-body">
                  <span class="event-series-scope-modal__option-label">{{ option.label }}</span>
                  <span class="event-series-scope-modal__option-hint">{{ option.hint }}</span>
                </span>
              </label>
            </div>
          </div>

          <div class="event-series-scope-modal__actions">
            <button
              type="button"
              class="field-button field-button--ghost"
              @click="handleCancel"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="field-button"
              :class="{ 'field-button--danger': tone === 'danger' }"
              @click="handleConfirm"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { SeriesEditScope } from '@/types/events'

type ScopeOption = {
  value: SeriesEditScope
  label: string
  hint: string
}

export default defineComponent({
  name: 'EventSeriesScopeModal',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    confirmLabel: {
      type: String,
      default: 'Confirmar'
    },
    tone: {
      type: String as PropType<'danger' | 'info'>,
      default: 'info'
    }
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  data() {
    return {
      selectedScope: 'thisOnly' as SeriesEditScope,
      titleId: `event-series-scope-title-${Math.random().toString(36).slice(2, 9)}`,
      scopeOptions: [
        {
          value: 'thisOnly',
          label: 'Só este',
          hint: 'Altera ou remove apenas esta ocorrência.'
        },
        {
          value: 'thisAndFuture',
          label: 'Este e os futuros',
          hint: 'Aplica a partir desta data até o fim da série.'
        },
        {
          value: 'entireSeries',
          label: 'Toda a série',
          hint: 'Inclui todas as ocorrências desta série.'
        }
      ] as ScopeOption[]
    }
  },
  watch: {
    modelValue(isOpen: boolean) {
      if (isOpen) {
        this.selectedScope = 'thisOnly'
      }
    }
  },
  methods: {
    handleCancel() {
      this.$emit('update:modelValue', false)
      this.$emit('cancel')
    },
    handleConfirm() {
      this.$emit('confirm', this.selectedScope)
      this.$emit('update:modelValue', false)
    }
  }
})
</script>
