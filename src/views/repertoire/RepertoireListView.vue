<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <MusicIcon :size="20" />
          </span>
          <h1>Repertório</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Consulte e gerencie a biblioteca de músicas.
        </p>
      </div>

      <RouterLink
        v-if="canManageRepertoire"
        class="repertoire-button"
        :to="{ name: 'repertoire-details', params: { id: 'new' } }"
      >
        <PlusIcon :size="16" aria-hidden="true" />
        Nova música
      </RouterLink>
    </header>

    <section class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Músicas cadastradas</h2>
        <span class="repertoire-badge">{{ listCountLabel }}</span>
      </div>

      <div
        v-if="listLoading"
        class="repertoire-song-grid repertoire-song-grid--skeleton"
        aria-hidden="true"
      >
        <div
          v-for="index in 3"
          :key="index"
          class="repertoire-song-card repertoire-song-card--skeleton"
        >
          <div class="repertoire-song-card__header repertoire-song-card__header--skeleton">
            <span class="app-skeleton app-skeleton--action" />
            <div class="repertoire-song-card__heading">
              <span class="app-skeleton app-skeleton--title" />
              <span class="app-skeleton app-skeleton--description" />
            </div>
            <div class="repertoire-song-card__header-actions">
              <span class="app-skeleton app-skeleton--action" />
              <span class="app-skeleton app-skeleton--action" />
              <span class="app-skeleton app-skeleton--action" />
            </div>
          </div>
          <div class="repertoire-song-card__badges">
            <span class="app-skeleton app-skeleton--badge" />
            <span class="app-skeleton app-skeleton--badge" />
            <span class="app-skeleton app-skeleton--badge" />
          </div>
          <span class="app-skeleton app-skeleton--description" />
          <div class="repertoire-song-card__actions">
            <span
              v-for="actionIndex in 4"
              :key="actionIndex"
              class="app-skeleton app-skeleton--action"
            />
          </div>
        </div>
      </div>

      <template v-else>
        <div
          v-if="showToolbar"
          class="repertoire-list-toolbar"
        >
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
                id="repertoire-search"
                v-model="searchQuery"
                type="search"
                class="field-control repertoire-list-search__input"
                placeholder="Buscar por nome, autor ou versão..."
                aria-label="Buscar músicas"
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
              aria-controls="repertoire-advanced-filters"
              :disabled="listRefreshing"
              @click="toggleFiltersVisible"
            >
              <SlidersHorizontalIcon :size="16" aria-hidden="true" />
              Filtros
            </button>
          </div>

          <div
            v-show="filtersVisible"
            id="repertoire-advanced-filters"
            class="repertoire-list-advanced-filters"
          >
            <div class="repertoire-list-filter-group">
              <span class="repertoire-list-filter-group__label">Favoritas</span>
              <div
                class="repertoire-list-filters"
                role="group"
                aria-label="Filtrar por favoritas"
              >
                <button
                  type="button"
                  class="repertoire-list-filters__button"
                  :class="{ 'repertoire-list-filters__button--active': !favoritesOnly }"
                  :aria-pressed="!favoritesOnly ? 'true' : 'false'"
                  :disabled="listRefreshing"
                  @click="setFavoritesFilter(false)"
                >
                  Todas
                </button>
                <button
                  type="button"
                  class="repertoire-list-filters__button"
                  :class="{ 'repertoire-list-filters__button--active': favoritesOnly }"
                  :aria-pressed="favoritesOnly ? 'true' : 'false'"
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
            <div
              class="repertoire-list-filters"
              role="group"
              aria-label="Filtrar por dificuldade"
            >
              <button
                type="button"
                class="repertoire-list-filters__button"
                :class="{ 'repertoire-list-filters__button--active': difficultyFilterId === null }"
                :aria-pressed="difficultyFilterId === null ? 'true' : 'false'"
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
                :aria-pressed="difficultyFilterId === level.id ? 'true' : 'false'"
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
            <div
              class="repertoire-list-filters"
              role="group"
              aria-label="Filtrar por popularidade"
            >
              <button
                type="button"
                class="repertoire-list-filters__button"
                :class="{ 'repertoire-list-filters__button--active': popularityFilterId === null }"
                :aria-pressed="popularityFilterId === null ? 'true' : 'false'"
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
                :aria-pressed="popularityFilterId === level.id ? 'true' : 'false'"
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
            <div
              class="repertoire-list-filters"
              role="group"
              aria-label="Filtrar por tema musical"
            >
              <button
                type="button"
                class="repertoire-list-filters__button"
                :class="{ 'repertoire-list-filters__button--active': musicalThemeFilterId === null }"
                :aria-pressed="musicalThemeFilterId === null ? 'true' : 'false'"
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
                :aria-pressed="musicalThemeFilterId === theme.id ? 'true' : 'false'"
                :disabled="listRefreshing"
                @click="setMusicalThemeFilter(theme.id)"
              >
                <TagIcon :size="16" aria-hidden="true" />
                {{ theme.name }}
              </button>
            </div>
          </div>
          </div>
        </div>

        <p v-if="showEmptyState" class="description">
          Nenhuma música cadastrada.
        </p>

        <p v-else-if="showFilteredEmptyState" class="description">
          Nenhuma música encontrada para os filtros aplicados.
        </p>

        <div
          v-else
          class="repertoire-song-grid"
          :class="{ 'repertoire-song-grid--loading': listRefreshing }"
        >
          <RepertoireSongCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            :favorite-loading-id="favoriteLoadingId"
            :action-loading-id="actionLoadingId"
            :actions-disabled="listRefreshing"
            :can-manage="canManageRepertoire"
            @toggle-favorite="toggleFavorite"
            @delete="handleDelete"
            @open-lyrics="openLyricsModal"
          />
        </div>

        <nav
          v-if="showPagination"
          class="repertoire-pagination"
          aria-label="Paginação do repertório"
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
    </section>

    <AppFormModal
      v-model="lyricsModalVisible"
      title="Letra"
      confirm-label="Fechar"
      single-action
      @confirm="closeLyricsModal"
      @cancel="closeLyricsModal"
    >
      <div class="repertoire-song-lyrics">
        <p class="repertoire-song-lyrics__title">
          {{ lyricsItem?.songName }}
        </p>
        <pre class="repertoire-song-lyrics__content">{{ lyricsItem?.lyrics }}</pre>
      </div>
    </AppFormModal>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MusicIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  StarIcon,
  TagIcon
} from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import RepertoireSongCard from '@/components/repertoire/RepertoireSongCard.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import { difficultyLevelService } from '@/services/difficultyLevelService'
import { musicalThemeService } from '@/services/musicalThemeService'
import { popularityLevelService } from '@/services/popularityLevelService'
import { repertoireService } from '@/services/repertoireService'
import { toastService } from '@/services/toastService'
import { useAuthStore } from '@/stores/authStore'
import type {
  DifficultyLevel,
  MusicalTheme,
  PopularityLevel,
  RepertoireListItem
} from '@/types/repertoire'
import { Permissions } from '@/utils/permissions'

const REPERTOIRE_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

export default defineComponent({
  name: 'RepertoireListView',
  components: {
    AppFormModal,
    ChevronLeftIcon,
    ChevronRightIcon,
    MusicIcon,
    PlusIcon,
    RepertoireSongCard,
    RouterLink,
    SearchIcon,
    SlidersHorizontalIcon,
    StarIcon,
    TagIcon
  },
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
      pageSize: REPERTOIRE_PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
      hasLoadedOnce: false,
      listLoading: false,
      listRefreshing: false,
      searchDebouncing: false,
      searchDebounceTimer: null as ReturnType<typeof setTimeout> | null,
      favoriteLoadingId: null as number | null,
      actionLoadingId: null as number | null,
      lyricsModalVisible: false,
      lyricsItem: null as RepertoireListItem | null
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    canManageRepertoire(): boolean {
      return this.authStore.hasPermission(Permissions.RepertoireManage)
    },
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
    showToolbar(): boolean {
      return this.hasLoadedOnce && (this.totalItems > 0 || this.hasActiveFilters)
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
    listCountLabel(): string {
      if (this.listLoading) {
        return '—'
      }

      return String(this.totalItems)
    },
    pageRangeStart(): number {
      if (this.totalItems === 0) {
        return 0
      }

      return (this.currentPage - 1) * this.pageSize + 1
    },
    pageRangeEnd(): number {
      if (this.totalItems === 0) {
        return 0
      }

      return Math.min(this.currentPage * this.pageSize, this.totalItems)
    },
    pageRangeLabel(): string {
      if (this.totalItems === 0) {
        return '0'
      }

      return `${this.pageRangeStart}–${this.pageRangeEnd}`
    }
  },
  watch: {
    searchQuery(): void {
      this.scheduleSearch()
    }
  },
  mounted() {
    void Promise.all([
      this.loadFilterOptions(),
      this.loadItems()
    ])
  },
  beforeUnmount() {
    this.clearSearchDebounce()
  },
  methods: {
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
          error instanceof Error ? error.message : 'Erro ao carregar filtros do repertório.'
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
          pageSize: this.pageSize
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
          error instanceof Error ? error.message : 'Erro ao carregar o repertório.'
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

    openLyricsModal(item: RepertoireListItem): void {
      this.lyricsItem = item
      this.lyricsModalVisible = true
    },

    closeLyricsModal(): void {
      this.lyricsModalVisible = false
      this.lyricsItem = null
    },

    async handleDelete(item: RepertoireListItem): Promise<void> {
      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir música',
        message: `Deseja excluir a música "${item.songName}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.actionLoadingId = item.id

      try {
        const response = await repertoireService.remove(item.id)
        toastService.success(response.message)
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir a música.'
        )
      } finally {
        this.actionLoadingId = null
      }
    }
  }
})
</script>
