<template>
  <DatePicker
    :model-value="parsedValue"
    :input-id="inputId"
    time-only
    hour-format="24"
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
import { minutesToTimeInputValue, parseTimeToMinutes } from '@/utils/eventCalendar'

export default defineComponent({
  name: 'AppTimePicker',
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
      default: 'Selecione o horário'
    }
  },
  emits: ['update:modelValue'],
  computed: {
    parsedValue(): Date | null {
      if (!this.modelValue) {
        return null
      }

      const totalMinutes = parseTimeToMinutes(this.modelValue)

      if (totalMinutes === null) {
        return null
      }

      const date = new Date()
      date.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0)

      return date
    }
  },
  methods: {
    handleUpdate(value: Date | Date[] | (Date | null)[] | null | undefined): void {
      const rawValue = Array.isArray(value) ? value[0] : value
      const date = rawValue ?? null

      if (!date) {
        this.$emit('update:modelValue', '')
        return
      }

      this.$emit(
        'update:modelValue',
        minutesToTimeInputValue(date.getHours() * 60 + date.getMinutes())
      )
    }
  }
})
</script>
