<template>
  <div
    ref="root"
    class="app-searchable-select"
    :class="{
      'app-searchable-select--open': isOpen,
      'app-searchable-select--disabled': disabled
    }"
  >
    <div
      class="app-searchable-select__trigger"
      :class="{
        'app-searchable-select__trigger--placeholder': !selectedLabel,
        'app-searchable-select__trigger--disabled': disabled
      }"
      role="combobox"
      :id="inputId"
      :tabindex="disabled ? -1 : 0"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="listboxId"
      aria-haspopup="listbox"
      :aria-disabled="disabled ? 'true' : 'false'"
      @click="toggleOpen"
      @keydown="handleTriggerKeydown"
    >
      <span class="app-searchable-select__value">
        {{ selectedLabel || placeholder }}
      </span>

      <span class="app-searchable-select__icons">
        <button
          v-if="allowClear && hasValue"
          type="button"
          class="app-searchable-select__clear"
          tabindex="-1"
          aria-label="Limpar seleção"
          :disabled="disabled"
          @click.stop="clearSelection"
        >
          <XIcon :size="14" aria-hidden="true" />
        </button>
        <ChevronDownIcon
          class="app-searchable-select__chevron"
          :size="16"
          aria-hidden="true"
        />
      </span>
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="panel"
        class="app-searchable-select__panel fluent-card"
        :style="panelStyle"
        role="presentation"
      >
        <div class="app-searchable-select__search">
          <SearchIcon
            class="app-searchable-select__search-icon"
            :size="16"
            aria-hidden="true"
          />
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="search"
            class="field-control app-searchable-select__search-input"
            :placeholder="searchPlaceholder"
            autocomplete="off"
            aria-label="Buscar opção"
            @keydown="handleSearchKeydown"
          >
        </div>

        <ul
          :id="listboxId"
          class="app-searchable-select__list"
          role="listbox"
          :aria-activedescendant="activeOptionId"
        >
          <li
            v-if="allowClear"
            :id="`${listboxId}-clear`"
            class="app-searchable-select__option"
            :class="{
              'app-searchable-select__option--selected': !hasValue,
              'app-searchable-select__option--active': activeIndex === -1
            }"
            role="option"
            :aria-selected="!hasValue ? 'true' : 'false'"
            @mouseenter="activeIndex = -1"
            @click="selectOption(null)"
          >
            {{ clearLabel }}
          </li>

          <li
            v-for="(option, index) in filteredOptions"
            :id="`${listboxId}-option-${index}`"
            :key="String(option.value)"
            class="app-searchable-select__option"
            :class="{
              'app-searchable-select__option--selected': isSelected(option.value),
              'app-searchable-select__option--active': activeIndex === index
            }"
            role="option"
            :aria-selected="isSelected(option.value) ? 'true' : 'false'"
            @mouseenter="activeIndex = index"
            @click="selectOption(option.value)"
          >
            {{ option.label }}
          </li>

          <li
            v-if="filteredOptions.length === 0"
            class="app-searchable-select__empty"
            role="presentation"
          >
            {{ normalizedSearchQuery ? emptyFilterMessage : emptyMessage }}
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { ChevronDownIcon, SearchIcon, XIcon } from '@lucide/vue'

export type AppSearchableSelectOption = {
  value: string | number
  label: string
}

type PanelStyle = {
  top: string
  left: string
  width: string
}

export default defineComponent({
  name: 'AppSearchableSelect',
  components: {
    ChevronDownIcon,
    SearchIcon,
    XIcon
  },
  props: {
    modelValue: {
      type: [String, Number] as PropType<string | number | null>,
      default: null
    },
    options: {
      type: Array as PropType<AppSearchableSelectOption[]>,
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Selecione'
    },
    searchPlaceholder: {
      type: String,
      default: 'Buscar...'
    },
    clearLabel: {
      type: String,
      default: 'Nenhuma'
    },
    emptyMessage: {
      type: String,
      default: 'Nenhuma opção disponível'
    },
    emptyFilterMessage: {
      type: String,
      default: 'Nenhuma opção encontrada'
    },
    allowClear: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    inputId: {
      type: String,
      default: undefined
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isOpen: false,
      searchQuery: '',
      activeIndex: -1,
      panelStyle: {
        top: '0px',
        left: '0px',
        width: '0px'
      } as PanelStyle,
      listboxId: `app-searchable-select-${Math.random().toString(36).slice(2, 9)}`
    }
  },
  computed: {
    hasValue(): boolean {
      return !(this.modelValue === null || this.modelValue === undefined || this.modelValue === '')
    },
    normalizedSearchQuery(): string {
      return this.searchQuery.trim().toLocaleLowerCase('pt-BR')
    },
    filteredOptions(): AppSearchableSelectOption[] {
      if (!this.normalizedSearchQuery) {
        return this.options
      }

      return this.options.filter((option) =>
        option.label.toLocaleLowerCase('pt-BR').includes(this.normalizedSearchQuery)
      )
    },
    selectedLabel(): string {
      if (!this.hasValue) {
        return ''
      }

      const selected = this.options.find((option) => option.value === this.modelValue)
      return selected?.label ?? ''
    },
    activeOptionId(): string | undefined {
      if (!this.isOpen) {
        return undefined
      }

      if (this.activeIndex === -1 && this.allowClear) {
        return `${this.listboxId}-clear`
      }

      if (this.activeIndex >= 0) {
        return `${this.listboxId}-option-${this.activeIndex}`
      }

      return undefined
    }
  },
  watch: {
    isOpen(isOpen: boolean) {
      if (isOpen) {
        this.searchQuery = ''
        this.syncActiveIndex()
        this.$nextTick(() => {
          this.updatePanelPosition()
          const input = this.$refs.searchInput as HTMLInputElement | undefined
          input?.focus()
        })
        window.addEventListener('mousedown', this.handleDocumentMouseDown)
        window.addEventListener('keydown', this.handleWindowKeydown)
        window.addEventListener('resize', this.updatePanelPosition)
        window.addEventListener('scroll', this.updatePanelPosition, true)
        return
      }

      this.removeWindowListeners()
    },
    options() {
      if (this.isOpen) {
        this.syncActiveIndex()
        this.$nextTick(() => this.updatePanelPosition())
      }
    },
    searchQuery() {
      this.syncActiveIndex()
    }
  },
  beforeUnmount() {
    this.removeWindowListeners()
  },
  methods: {
    isSelected(value: string | number): boolean {
      return this.modelValue === value
    },
    syncActiveIndex() {
      if (!this.hasValue) {
        this.activeIndex = this.allowClear ? -1 : 0
        return
      }

      const index = this.filteredOptions.findIndex((option) => option.value === this.modelValue)
      this.activeIndex = index >= 0 ? index : (this.allowClear ? -1 : 0)
    },
    toggleOpen() {
      if (this.disabled) {
        return
      }

      this.isOpen = !this.isOpen
    },
    close() {
      this.isOpen = false
    },
    selectOption(value: string | number | null) {
      this.$emit('update:modelValue', value)
      this.close()
    },
    clearSelection() {
      if (this.disabled) {
        return
      }

      this.$emit('update:modelValue', null)
    },
    updatePanelPosition() {
      const root = this.$refs.root as HTMLElement | undefined
      const panel = this.$refs.panel as HTMLElement | undefined

      if (!root) {
        return
      }

      const rect = root.getBoundingClientRect()
      const viewportPadding = 8
      const panelHeight = panel?.offsetHeight ?? 280
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding
      const openUpward = spaceBelow < panelHeight && rect.top > spaceBelow

      this.panelStyle = {
        top: openUpward
          ? `${Math.max(viewportPadding, rect.top - panelHeight - 4)}px`
          : `${rect.bottom + 4}px`,
        left: `${Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - rect.width - viewportPadding))}px`,
        width: `${rect.width}px`
      }
    },
    handleDocumentMouseDown(event: MouseEvent) {
      const root = this.$refs.root as HTMLElement | undefined
      const panel = this.$refs.panel as HTMLElement | undefined
      const target = event.target as Node | null

      if (!target) {
        return
      }

      if (root?.contains(target) || panel?.contains(target)) {
        return
      }

      this.close()
    },
    handleTriggerKeydown(event: KeyboardEvent) {
      if (this.disabled) {
        return
      }

      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()

        if (!this.isOpen) {
          this.isOpen = true
        }
      }
    },
    handleWindowKeydown(event: KeyboardEvent) {
      if (!this.isOpen) {
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        this.close()
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        this.moveActive(1)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        this.moveActive(-1)
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        this.selectActive()
      }
    },
    handleSearchKeydown(event: KeyboardEvent) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === 'Escape') {
        this.handleWindowKeydown(event)
      }
    },
    moveActive(delta: number) {
      const minIndex = this.allowClear ? -1 : 0
      const maxIndex = this.filteredOptions.length - 1

      if (maxIndex < 0 && !this.allowClear) {
        return
      }

      if (maxIndex < 0 && this.allowClear) {
        this.activeIndex = -1
        return
      }

      let next = this.activeIndex + delta

      if (next < minIndex) {
        next = maxIndex
      }

      if (next > maxIndex) {
        next = minIndex
      }

      this.activeIndex = next
    },
    selectActive() {
      if (this.activeIndex === -1 && this.allowClear) {
        this.selectOption(null)
        return
      }

      const option = this.filteredOptions[this.activeIndex]

      if (option) {
        this.selectOption(option.value)
      }
    },
    removeWindowListeners() {
      window.removeEventListener('mousedown', this.handleDocumentMouseDown)
      window.removeEventListener('keydown', this.handleWindowKeydown)
      window.removeEventListener('resize', this.updatePanelPosition)
      window.removeEventListener('scroll', this.updatePanelPosition, true)
    }
  }
})
</script>
