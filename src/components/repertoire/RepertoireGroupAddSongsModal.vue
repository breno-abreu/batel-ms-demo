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
            id="repertoire-group-picker-search"
            v-model="searchQuery"
            type="search"
            class="field-control repertoire-list-search__input"
            placeholder="Buscar por nome, autor ou versão..."
            aria-label="Buscar músicas para adicionar"
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
          aria-controls="repertoire-group-picker-filters"
          :disabled="listRefreshing"
          @click="toggleFiltersVisible"
        >
          <SlidersHorizontalIcon :size="16" aria-hidden="true" />
          Filtros
        </button>
      </div>

      <div
        v-show="filtersVisible"
        id="repertoire-group-picker-filters"
        class="repertoire-list-advanced-filters"
      >
        <div class="repertoire-list-filter-group">
          <span class="repertoire-list-filter-group__label">Favoritas</span>
          <div class="repertoire-list-filters" role="group" aria-label="Filtrar por favoritas">
            <button
              type="button"
              class="repertoire-list-filters__button"
              :class="{ 'repertoire-list-filters__button--active': !favoritesOnly }"
              :disabled="listRefreshing"
              @click="setFavoritesFilter(false)"
            >
              Todas
            </button>
            <button
              type="button"
              class="repertoire-list-filters__button"
              :class="{ 'repertoire-list-filters__button--active': favoritesOnly }"
              :disabled="listRefreshing"
              @click="setFavoritesFilter(true)"
            >
              <StarIcon :size="16" aria-hidden="true" />
              Favoritas
            </button>
          </div>
        </div>

        <div
          v-if="difficultyLevels.length > 0"
          class="repertoire-list-filter-group"
        >
          <span class="repertoire-list-filter-group__label">Dificuldade</span>
          <div class="repertoire-list-filters" role="group" aria-label="Filtrar por dificuldade">
            <button
              type="button"
              class="repertoire-list-filters__button"
              :class="{ 'repertoire-list-filters__button--active': difficultyFilterId === null }"
              :disabled="listRefreshing"
              @click="setDifficultyFilter(null)"
            >
              Todos
            </button>
            <button
              v-for="level in difficultyLevels"
              :key="level.id"
              type="button"
              class="repertoire-list-filters__button"
              :class="{ 'repertoire-list-filters__button--active': difficultyFilterId === level.id }"
              :disabled="listRefreshing"
              @click="setDifficultyFilter(level.id)"
            >
              {{ level.name }}
            </button>
          </div>
        </div>

        <div
          v-if="popularityLevels.length > 0"
          class="repertoire-list-filter-group"
        >
          <span class="repertoire-list-filter-group__label">Popularidade</span>
          <div class="repertoire-list-filters" role="group" aria-label="Filtrar por popularidade">
            <button
              type="button"
              class="repertoire-list-filters__button"
              :class="{ 'repertoire-list-filters__button--active': popularityFilterId === null }"
              :disabled="listRefreshing"
              @click="setPopularityFilter(null)"
            >
              Todos
            </button>
            <button
              v-for="level in popularityLevels"
              :key="level.id"
              type="button"
              class="repertoire-list-filters__button"
              :class="{ 'repertoire-list-filters__button--active': popularityFilterId === level.id }"
              :disabled="listRefreshing"
              @click="setPopularityFilter(level.id)"
            >
              {{ level.name }}
            </button>
          </div>
        </div>

        <div
          v-if="musicalThemes.length > 0"
          class="repertoire-list-filter-group"
        >
          <span class="repertoire-list-filter-group__label">Temas musicais</span>
          <div class="repertoire-list-filters" role="group" aria-label="Filtrar por tema musical">
            <button
              type="button"
              class="repertoire-list-filters__button"
              :class="{ 'repertoire-list-filters__button--active': musicalThemeFilterId === null }"
              :disabled="listRefreshing"
              @click="setMusicalThemeFilter(null)"
            >
              Todos
            </button>
            <button
              v-for="theme in musicalThemes"
              :key="theme.id"
              type="button"
              class="repertoire-list-filters__button"
              :class="{ 'repertoire-list-filters__button--active': musicalThemeFilterId === theme.id }"
              :disabled="listRefreshing"
              @click="setMusicalThemeFilter(theme.id)"
            >
              <TagIcon :size="16" aria-hidden="true" />
              {{ theme.name }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="listLoading"
        class="repertoire-song-grid repertoire-song-grid--skeleton repertoire-group-picker__grid"
        aria-hidden="true"
      >
        <div
          v-for="index in 2"
          :key="index"
          class="repertoire-song-card repertoire-song-card--skeleton"
        >
          <span class="app-skeleton app-skeleton--title" />
          <span class="app-skeleton app-skeleton--description" />
        </div>
      </div>

      <template v-else>
        <p v-if="showEmptyState" class="description">
          Nenhuma música cadastrada.
        </p>

        <p v-else-if="showFilteredEmptyState" class="description">
          Nenhuma música encontrada para os filtros aplicados.
        </p>

        <div
          v-else
          class="repertoire-song-grid repertoire-group-picker__grid"
          :class="{ 'repertoire-song-grid--loading': listRefreshing }"
        >
          <RepertoireSongCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            header-mode="add"
            :add-context="groupId == null ? 'repertoire' : 'folder'"
            :favorite-loading-id="favoriteLoadingId"
            :action-loading-id="actionLoadingId"
            :add-disabled="includedRepertoireIds.has(item.id)"
            :actions-disabled="listRefreshing"
            @toggle-favorite="toggleFavorite"
            @add="handleAdd"
          />
        </div>

        <nav
          v-if="showPagination"
          class="repertoire-pagination"
          aria-label="Paginação de músicas"
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
  StarIcon,
  TagIcon
} from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import RepertoireSongCard from '@/components/repertoire/RepertoireSongCard.vue'
import { difficultyLevelService } from '@/services/difficultyLevelService'
import { musicalThemeService } from '@/services/musicalThemeService'
import { popularityLevelService } from '@/services/popularityLevelService'
import { repertoireGroupService } from '@/services/repertoireGroupService'
import { repertoireService } from '@/services/repertoireService'
import { toastService } from '@/services/toastService'
import type {
  DifficultyLevel,
  MusicalTheme,
  PopularityLevel,
  RepertoireListItem
} from '@/types/repertoire'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

export default defineComponent({
  name: 'RepertoireGroupAddSongsModal',
  components: {
    AppFormModal,
    ChevronLeftIcon,
    ChevronRightIcon,
    RepertoireSongCard,
    SearchIcon,
    SlidersHorizontalIcon,
    StarIcon,
    TagIcon
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
      default: 'Adicionar músicas à pasta'
    },
    includedRepertoireIds: {
      type: Object as PropType<Set<number>>,
      required: true
    },
    suppressAddToast: {
      type: Boolean,
      default: false
    },
    initialMusicalThemeName: {
      type: String as PropType<string | null>,
      default: null
    }
  },
  emits: ['update:modelValue', 'added'],
  data() {
    return {
      items: [] as RepertoireListItem[],
      difficultyLevels: [] as DifficultyLevel[],
      popularityLevels: [] as PopularityLevel[],
      musicalThemes: [] as MusicalTheme[],
      searchQuery: '',
      difficultyFilterId: null as number | null,
      popularityFilterId: null as number | null,
      musicalThemeFilterId: null as number | null,
      favoritesOnly: false,
      filtersVisible: false,
      currentPage: 1,
      totalItems: 0,
      totalPages: 0,
      hasLoadedOnce: false,
      listLoading: false,
      listRefreshing: false,
      searchDebouncing: false,
      searchDebounceTimer: null as ReturnType<typeof setTimeout> | null,
      favoriteLoadingId: null as number | null,
      actionLoadingId: null as number | null
    }
  },
  computed: {
    hasActiveFilters(): boolean {
      return this.searchQuery.trim().length > 0
        || this.difficultyFilterId !== null
        || this.popularityFilterId !== null
        || this.musicalThemeFilterId !== null
        || this.favoritesOnly
    },
    hasAdditionalFilters(): boolean {
      return this.difficultyFilterId !== null
        || this.popularityFilterId !== null
        || this.musicalThemeFilterId !== null
        || this.favoritesOnly
    },
    showAdvancedFiltersToggle(): boolean {
      return true
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
        this.applyInitialMusicalThemeFilter()
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
      this.difficultyFilterId = null
      this.popularityFilterId = null
      this.musicalThemeFilterId = null
      this.favoritesOnly = false
      this.filtersVisible = false
      this.currentPage = 1
      this.items = []
      this.hasLoadedOnce = false
    },

    applyInitialMusicalThemeFilter(): void {
      const themeName = this.initialMusicalThemeName?.trim()

      if (!themeName) {
        this.musicalThemeFilterId = null
        return
      }

      const normalizedName = themeName.toLocaleLowerCase('pt-BR')
      const matchedTheme = this.musicalThemes.find(
        (theme) => theme.name.trim().toLocaleLowerCase('pt-BR') === normalizedName
      )

      this.musicalThemeFilterId = matchedTheme?.id ?? null
    },

    handleClose(): void {
      this.$emit('update:modelValue', false)
    },

    async loadFilterOptions(): Promise<void> {
      try {
        const [difficultyResponse, popularityResponse, themesResponse] = await Promise.all([
          difficultyLevelService.list(),
          popularityLevelService.list(),
          musicalThemeService.list()
        ])

        this.difficultyLevels = difficultyResponse.payload ?? []
        this.popularityLevels = popularityResponse.payload ?? []
        this.musicalThemes = themesResponse.payload ?? []
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
        const response = await repertoireService.list({
          search: this.searchQuery,
          difficultyLevelId: this.difficultyFilterId,
          popularityLevelId: this.popularityFilterId,
          musicalThemeId: this.musicalThemeFilterId,
          favoritesOnly: this.favoritesOnly,
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
          error instanceof Error ? error.message : 'Erro ao carregar músicas.'
        )
      } finally {
        this.listLoading = false
        this.listRefreshing = false
        this.searchDebouncing = false
        this.hasLoadedOnce = true
      }
    },

    setDifficultyFilter(value: number | null): void {
      if (this.difficultyFilterId === value) {
        return
      }

      this.clearSearchDebounce()
      this.searchDebouncing = false
      this.difficultyFilterId = value
      this.currentPage = 1
      void this.loadItems()
    },

    setPopularityFilter(value: number | null): void {
      if (this.popularityFilterId === value) {
        return
      }

      this.clearSearchDebounce()
      this.searchDebouncing = false
      this.popularityFilterId = value
      this.currentPage = 1
      void this.loadItems()
    },

    setMusicalThemeFilter(value: number | null): void {
      if (this.musicalThemeFilterId === value) {
        return
      }

      this.clearSearchDebounce()
      this.searchDebouncing = false
      this.musicalThemeFilterId = value
      this.currentPage = 1
      void this.loadItems()
    },

    setFavoritesFilter(value: boolean): void {
      if (this.favoritesOnly === value) {
        return
      }

      this.clearSearchDebounce()
      this.searchDebouncing = false
      this.favoritesOnly = value
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

    async toggleFavorite(item: RepertoireListItem): Promise<void> {
      this.favoriteLoadingId = item.id
      const nextValue = !item.isFavorite

      try {
        const response = await repertoireService.setFavorite(item.id, nextValue)
        item.isFavorite = nextValue
        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao atualizar favorito.'
        )
      } finally {
        this.favoriteLoadingId = null
      }
    },

    async handleAdd(item: RepertoireListItem): Promise<void> {
      if (this.includedRepertoireIds.has(item.id)) {
        return
      }

      this.actionLoadingId = item.id

      try {
        if (this.groupId != null) {
          const response = await repertoireGroupService.addRepertoire(this.groupId, item.id)
          toastService.success(response.message)
        } else if (!this.suppressAddToast) {
          toastService.success('Música adicionada à escala.')
        }

        this.$emit('added', item)
      } catch (error) {
        toastService.error(
          error instanceof Error
            ? error.message
            : this.groupId != null
              ? 'Erro ao adicionar música à pasta.'
              : 'Erro ao adicionar música à escala.'
        )
      } finally {
        this.actionLoadingId = null
      }
    }
  }
})
</script>
