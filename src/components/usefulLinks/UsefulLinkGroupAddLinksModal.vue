<template>
  <AppFormModal
    :model-value="modelValue"
    :title="title"
    confirm-label="Fechar"
    single-action
    wide
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="handleClose"
    @cancel="handleClose"
      :scrollable-body="true"
    >
    <div class="repertoire-group-picker">
      <div class="repertoire-list-search-row">
        <div
          class="repertoire-list-search"
          :class="{ 'repertoire-list-search--loading': isSearchPending }"
        >
          <SearchIcon
            class="repertoire-list-search__icon"
            :size="16"
            aria-hidden="true"
          />
          <input
            id="useful-link-group-picker-search"
            v-model="searchQuery"
            type="search"
            class="field-control repertoire-list-search__input"
            placeholder="Buscar por nome, URL, tipo ou observações..."
            aria-label="Buscar links para adicionar"
            :disabled="listRefreshing"
          >
          <span
            v-if="isSearchPending"
            class="repertoire-list-search__status"
            aria-live="polite"
          >
            Buscando...
          </span>
        </div>
        <button
          v-if="showAdvancedFiltersToggle"
          type="button"
          class="repertoire-list-filters-toggle"
          :class="{
            'repertoire-list-filters-toggle--expanded': filtersVisible,
            'repertoire-list-filters-toggle--applied': hasAdditionalFilters
          }"
          :aria-expanded="filtersVisible ? 'true' : 'false'"
          aria-controls="useful-link-group-picker-filters"
          :disabled="listRefreshing"
          @click="toggleFiltersVisible"
        >
          <SlidersHorizontalIcon :size="16" aria-hidden="true" />
          Filtros
        </button>
      </div>
      <div
        v-show="filtersVisible"
        id="useful-link-group-picker-filters"
        class="repertoire-list-advanced-filters"
      >
        <div
          v-if="usefulLinkTypes.length > 0"
          class="repertoire-list-filter-group"
        >
          <span class="repertoire-list-filter-group__label">Tipo</span>
          <div
            class="repertoire-list-filters"
            role="group"
            aria-label="Filtrar por tipo"
          >
            <button
              type="button"
              class="repertoire-list-filters__button"
              :class="{ 'repertoire-list-filters__button--active': typeFilterId === null }"
              :disabled="listRefreshing"
              @click="setTypeFilter(null)"
            >
              Todos
            </button>
            <button
              v-for="type in usefulLinkTypes"
              :key="type.id"
              type="button"
              class="repertoire-list-filters__button"
              :class="{ 'repertoire-list-filters__button--active': typeFilterId === type.id }"
              :disabled="listRefreshing"
              @click="setTypeFilter(type.id)"
            >
              <TagIcon :size="16" aria-hidden="true" />
              {{ type.name }}
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="listLoading"
        class="useful-link-grid useful-link-grid--skeleton repertoire-group-picker__grid"
        aria-hidden="true"
      >
        <div
          v-for="index in 2"
          :key="index"
          class="useful-link-card useful-link-card--skeleton"
        >
          <span class="app-skeleton app-skeleton--title" />
          <span class="app-skeleton app-skeleton--description" />
        </div>
      </div>
      <template v-else>
        <p v-if="showEmptyState" class="description">
          Nenhum link útil cadastrado.
        </p>
        <p v-else-if="showFilteredEmptyState" class="description">
          Nenhum link encontrado para os filtros aplicados.
        </p>
        <div
          v-else
          class="useful-link-grid repertoire-group-picker__grid"
          :class="{ 'useful-link-grid--loading': listRefreshing }"
        >
          <UsefulLinkCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            header-mode="add"
            :add-disabled="includedUsefulLinkIds.has(item.id)"
            :action-loading-id="actionLoadingId"
            :actions-disabled="listRefreshing"
            @add="handleAdd"
          />
        </div>
        <nav
          v-if="showPagination"
          class="repertoire-pagination"
          aria-label="Paginação de links úteis"
        >
          <p class="repertoire-pagination__summary">
            Mostrando {{ pageRangeLabel }} de {{ totalItems }}
          </p>
          <div class="repertoire-pagination__controls">
            <button
              type="button"
              class="repertoire-pagination__button"
              :disabled="currentPage <= 1 || listRefreshing"
              aria-label="Página anterior"
              @click="goToPreviousPage"
            >
              <ChevronLeftIcon :size="16" aria-hidden="true" />
              Anterior
            </button>
            <span class="repertoire-pagination__page">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
            <button
              type="button"
              class="repertoire-pagination__button"
              :disabled="currentPage >= totalPages || listRefreshing"
              aria-label="Próxima página"
              @click="goToNextPage"
            >
              Próxima
              <ChevronRightIcon :size="16" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </template>
    </div>
  </AppFormModal>
</template>
<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  TagIcon
} from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import UsefulLinkCard from '@/components/usefulLinks/UsefulLinkCard.vue'
import { usefulLinkGroupService } from '@/services/usefulLinkGroupService'
import { usefulLinkService } from '@/services/usefulLinkService'
import { usefulLinkTypeService } from '@/services/usefulLinkTypeService'
import { toastService } from '@/services/toastService'
import type { UsefulLink, UsefulLinkType } from '@/types/usefulLinks'
const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400
export default defineComponent({
  name: 'UsefulLinkGroupAddLinksModal',
  components: {
    AppFormModal,
    ChevronLeftIcon,
    ChevronRightIcon,
    SearchIcon,
    SlidersHorizontalIcon,
    TagIcon,
    UsefulLinkCard
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    groupId: {
      type: Number as PropType<number | null>,
      default: null
    },
    title: {
      type: String,
      default: 'Adicionar links à pasta'
    },
    includedUsefulLinkIds: {
      type: Object as PropType<Set<number>>,
      required: true
    }
  },
  emits: ['update:modelValue', 'added'],
  data() {
    return {
      items: [] as UsefulLink[],
      usefulLinkTypes: [] as UsefulLinkType[],
      searchQuery: '',
      typeFilterId: null as number | null,
      filtersVisible: false,
      currentPage: 1,
      totalItems: 0,
      totalPages: 0,
      hasLoadedOnce: false,
      listLoading: false,
      listRefreshing: false,
      searchDebouncing: false,
      searchDebounceTimer: null as ReturnType<typeof setTimeout> | null,
      actionLoadingId: null as number | null
    }
  },
  computed: {
    hasActiveFilters(): boolean {
      return this.searchQuery.trim().length > 0 || this.typeFilterId !== null
    },
    hasAdditionalFilters(): boolean {
      return this.typeFilterId !== null
    },
    showAdvancedFiltersToggle(): boolean {
      return this.usefulLinkTypes.length > 0
    },
    isSearchPending(): boolean {
      return this.searchDebouncing || this.listRefreshing
    },
    showEmptyState(): boolean {
      return this.hasLoadedOnce && this.totalItems === 0 && !this.hasActiveFilters
    },
    showFilteredEmptyState(): boolean {
      return this.hasLoadedOnce && this.totalItems === 0 && this.hasActiveFilters
    },
    showPagination(): boolean {
      return this.totalPages > 1
    },
    pageRangeStart(): number {
      if (this.totalItems === 0) {
        return 0
      }
      return (this.currentPage - 1) * PAGE_SIZE + 1
    },
    pageRangeEnd(): number {
      if (this.totalItems === 0) {
        return 0
      }
      return Math.min(this.currentPage * PAGE_SIZE, this.totalItems)
    },
    pageRangeLabel(): string {
      if (this.totalItems === 0) {
        return '0'
      }
      return `${this.pageRangeStart}–${this.pageRangeEnd}`
    }
  },
  watch: {
    async modelValue(isOpen: boolean): Promise<void> {
      if (isOpen) {
        await this.loadFilterOptions()
        await this.loadItems()
        return
      }
      this.resetState()
    },
    searchQuery(): void {
      this.scheduleSearch()
    }
  },
  beforeUnmount() {
    this.clearSearchDebounce()
  },
  methods: {
    resetState(): void {
      this.clearSearchDebounce()
      this.searchQuery = ''
      this.typeFilterId = null
      this.filtersVisible = false
      this.currentPage = 1
      this.items = []
      this.hasLoadedOnce = false
    },
    handleClose(): void {
      this.$emit('update:modelValue', false)
    },
    async loadFilterOptions(): Promise<void> {
      try {
        const response = await usefulLinkTypeService.list()
        this.usefulLinkTypes = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar filtros.'
        )
      }
    },
    async loadItems(): Promise<void> {
      if (!this.hasLoadedOnce) {
        this.listLoading = true
      } else {
        this.listRefreshing = true
      }
      try {
        const response = await usefulLinkService.list({
          search: this.searchQuery,
          usefulLinkTypeId: this.typeFilterId,
          page: this.currentPage,
          pageSize: PAGE_SIZE
        })
        const paged = response.payload
        if (paged) {
          this.items = paged.items ?? []
          this.currentPage = paged.page
          this.totalItems = paged.totalItems
          this.totalPages = paged.totalPages
        }
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar links úteis.'
        )
      } finally {
        this.listLoading = false
        this.listRefreshing = false
        this.searchDebouncing = false
        this.hasLoadedOnce = true
      }
    },
    setTypeFilter(value: number | null): void {
      if (this.typeFilterId === value) {
        return
      }
      this.clearSearchDebounce()
      this.searchDebouncing = false
      this.typeFilterId = value
      this.currentPage = 1
      void this.loadItems()
    },
    toggleFiltersVisible(): void {
      this.filtersVisible = !this.filtersVisible
    },
    scheduleSearch(): void {
      this.clearSearchDebounce()
      this.searchDebouncing = true
      this.searchDebounceTimer = setTimeout(() => {
        this.searchDebounceTimer = null
        this.currentPage = 1
        void this.loadItems()
      }, SEARCH_DEBOUNCE_MS)
    },
    clearSearchDebounce(): void {
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
        this.searchDebounceTimer = null
      }
    },
    goToPreviousPage(): void {
      if (this.currentPage <= 1 || this.listRefreshing) {
        return
      }
      this.currentPage -= 1
      void this.loadItems()
    },
    goToNextPage(): void {
      if (this.currentPage >= this.totalPages || this.listRefreshing) {
        return
      }
      this.currentPage += 1
      void this.loadItems()
    },
    async handleAdd(item: UsefulLink): Promise<void> {
      if (this.includedUsefulLinkIds.has(item.id) || this.groupId == null) {
        return
      }
      this.actionLoadingId = item.id
      try {
        const response = await usefulLinkGroupService.addUsefulLink(this.groupId, item.id)
        toastService.success(response.message)
        this.$emit('added', item)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao adicionar link à pasta.'
        )
      } finally {
        this.actionLoadingId = null
      }
    }
  }
})
</script>
