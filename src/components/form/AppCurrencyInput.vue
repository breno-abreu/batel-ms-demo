<template>
  <input
    :id="inputId"
    class="field-control app-currency-input"
    :class="{ 'field-control--invalid': invalid }"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    :value="displayValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-invalid="invalid ? 'true' : 'false'"
    @keydown="handleKeydown"
    @paste="handlePaste"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
  >
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import {
  centsDigitsToNumber,
  extractDigitCharacters,
  formatCentsDigits,
  numberToCentsDigits
} from '@/utils/currencyInput'

export default defineComponent({
  name: 'AppCurrencyInput',
  props: {
    modelValue: {
      type: Number as PropType<number | null>,
      default: null
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
      default: 'R$ 0,00'
    },
    maxCentsDigits: {
      type: Number,
      default: 14
    }
  },
  emits: ['update:modelValue', 'focus', 'blur', 'input'],
  data() {
    return {
      digits: numberToCentsDigits(this.modelValue)
    }
  },
  computed: {
    displayValue(): string {
      return formatCentsDigits(this.digits)
    }
  },
  watch: {
    modelValue(value: number | null): void {
      const nextDigits = numberToCentsDigits(value)

      if (nextDigits !== this.digits) {
        this.digits = nextDigits
      }
    }
  },
  methods: {
    emitValue(): void {
      const nextValue = centsDigitsToNumber(this.digits)
      this.$emit('update:modelValue', nextValue)
      this.$emit('input', nextValue)
    },

    appendDigit(digit: string): void {
      if (!/^\d$/.test(digit)) {
        return
      }

      if (this.digits.length >= this.maxCentsDigits) {
        return
      }

      const nextDigits = `${this.digits}${digit}`.replace(/^0+(?=\d)/, '')
      this.digits = nextDigits
      this.emitValue()
    },

    removeLastDigit(): void {
      if (!this.digits) {
        return
      }

      this.digits = this.digits.slice(0, -1)
      this.emitValue()
    },

    clearDigits(): void {
      if (!this.digits) {
        return
      }

      this.digits = ''
      this.emitValue()
    },

    isFullySelected(event: KeyboardEvent): boolean {
      const input = event.target

      if (!(input instanceof HTMLInputElement)) {
        return false
      }

      if (!input.value || input.selectionStart === null || input.selectionEnd === null) {
        return false
      }

      return input.selectionStart === 0 && input.selectionEnd === input.value.length
    },

    setDigitsFromRaw(raw: string): void {
      const extracted = extractDigitCharacters(raw).slice(0, this.maxCentsDigits)
      this.digits = extracted.replace(/^0+(?=\d)/, '')
      this.emitValue()
    },

    handleKeydown(event: KeyboardEvent): void {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return
      }

      const hasFullSelection = this.isFullySelected(event)

      if (event.key >= '0' && event.key <= '9') {
        event.preventDefault()

        if (hasFullSelection) {
          this.digits = ''
        }

        this.appendDigit(event.key)
        return
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()

        if (hasFullSelection) {
          this.clearDigits()
          return
        }

        if (event.key === 'Delete') {
          this.clearDigits()
          return
        }

        this.removeLastDigit()
      }

      const allowedKeys = [
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End'
      ]

      if (allowedKeys.includes(event.key)) {
        return
      }

      event.preventDefault()
    },

    handlePaste(event: ClipboardEvent): void {
      event.preventDefault()
      const pasted = event.clipboardData?.getData('text') ?? ''
      this.setDigitsFromRaw(pasted)
    }
  }
})
</script>
