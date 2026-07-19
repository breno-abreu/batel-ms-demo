<template>
  <label
    class="selectable-card"
    :class="{
      'selectable-card--selected': modelValue,
      'selectable-card--disabled': disabled
    }"
    :for="inputId"
  >
    <input
      :id="inputId"
      class="selectable-card__input"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
    >

    <span class="selectable-card__icon" aria-hidden="true">
      <slot name="icon" />
    </span>

    <span class="selectable-card__content">
      <span class="selectable-card__title">{{ title }}</span>
      <span
        v-if="description"
        class="selectable-card__description"
      >
        {{ description }}
      </span>
    </span>

    <span
      class="selectable-card__indicator"
      aria-hidden="true"
    >
      <CheckIcon
        v-if="modelValue"
        :size="14"
      />
    </span>
  </label>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CheckIcon } from '@lucide/vue'

export default defineComponent({
  name: 'AppSelectableCard',
  components: {
    CheckIcon
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    inputId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  methods: {
    handleChange(event: Event): void {
      const target = event.target as HTMLInputElement
      this.$emit('update:modelValue', target.checked)
    }
  }
})
</script>
