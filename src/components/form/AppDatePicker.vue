<template>
  <DatePicker
    :model-value="parsedValue"
    :input-id="inputId"
    date-format="dd/mm/yy"
    show-icon
    icon-display="input"
    fluid
    :invalid="invalid"
    :disabled="disabled"
    :placeholder="placeholder"
    class="app-field-picker"
    @update:model-value="handleUpdate"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DatePicker from 'primevue/datepicker'
import { formatDateOnly, parseDateOnly } from '@/utils/eventCalendar'

export default defineComponent({
  name: 'AppDatePicker',
  components: {
    DatePicker
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    inputId: {
      type: String,
      default: undefined
    },
    invalid: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: 'Selecione a data'
    }
  },
  emits: ['update:modelValue'],
  computed: {
    parsedValue(): Date | null {
      if (!this.modelValue) {
        return null
      }

      return parseDateOnly(this.modelValue)
    }
  },
  methods: {
    handleUpdate(value: Date | Date[] | (Date | null)[] | null | undefined): void {
      const rawValue = Array.isArray(value) ? value[0] : value
      const date = rawValue ?? null

      this.$emit('update:modelValue', date ? formatDateOnly(date) : '')
    }
  }
})
</script>
