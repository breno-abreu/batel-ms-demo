<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <Link2Icon :size="20" />
          </span>
          <h1>Links úteis</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Consulte e gerencie os links úteis compartilhados pela equipe.
        </p>
      </div>

      <RouterLink
        v-if="canManageLinks"
        class="repertoire-button"
        :to="{ name: 'useful-link-details', params: { id: 'new' } }"
      >
        <PlusIcon :size="16" aria-hidden="true" />
        Novo link
      </RouterLink>
    </header>

    <section class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Links cadastrados</h2>
        <span class="repertoire-badge">{{ listCountLabel }}</span>
      </div>

      <div
        v-if="listLoading"
        class="useful-link-grid useful-link-grid--skeleton"
        aria-hidden="true"
      >
        <div
          v-for="index in 6"
          :key="index"
          class="useful-link-card useful-link-card--skeleton"
        >
          <span class="app-skeleton app-skeleton--title" />
          <span class="app-skeleton app-skeleton--badge" />
          <span class="app-skeleton app-skeleton--description" />
          <span class="app-skeleton app-skeleton--action" />
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
                id="useful-link-search"
                v-model="searchQuery"
                type="search"
                class="field-control repertoire-list-search__input"
                placeholder="Buscar por nome, URL, tipo ou observações..."
                aria-label="Buscar links úteis"
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
              aria-controls="useful-link-advanced-filters"
              :disabled="listRefreshing"
              @click="toggleFiltersVisible"
            >
              <SlidersHorizontalIcon :size="16" aria-hidden="true" />
              Filtros
            </button>
          </div>

          <div
            v-show="filtersVisible"
            id="useful-link-advanced-filters"
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
                  :aria-pressed="typeFilterId === null ? 'true' : 'false'"
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
                  :aria-pressed="typeFilterId === type.id ? 'true' : 'false'"
                  :disabled="listRefreshing"
                  @click="setTypeFilter(type.id)"
                >
                  <TagIcon :size="16" aria-hidden="true" />
                  {{ type.name }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <p v-if="showEmptyState" class="description">
          Nenhum link útil cadastrado.
        </p>

        <p v-else-if="showFilteredEmptyState" class="description">
          Nenhum link encontrado para os filtros aplicados.
        </p>

        <div
          v-else
          class="useful-link-grid"
          :class="{ 'useful-link-grid--loading': listRefreshing }"
        >
          <UsefulLinkCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            :action-loading-id="actionLoadingId"
            :actions-disabled="listRefreshing"
            :show-management-actions="canManageLinks"
            @open="openDetailsModal"
            @delete="handleDelete"
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
    </section>

    <AppFormModal
      v-model="detailsModalVisible"
      :title="detailsItem?.name ?? 'Link útil'"
      confirm-label="Fechar"
      single-action
      @confirm="closeDetailsModal"
      @cancel="closeDetailsModal"
    >
      <div
        v-if="detailsItem"
        class="useful-link-details-modal"
      >
        <span class="repertoire-song-tag repertoire-song-tag--theme">
          <TagIcon :size="14" aria-hidden="true" />
          {{ detailsItem.usefulLinkTypeName }}
        </span>

        <div class="useful-link-details-modal__field">
          <span class="useful-link-details-modal__label">URL</span>
          <a
            class="repertoire-song-card__resource useful-link-details-modal__url"
            :href="detailsItem.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLinkIcon :size="16" aria-hidden="true" />
            Abrir link
          </a>
          <p class="useful-link-details-modal__url-text">
            {{ detailsItem.url }}
          </p>
        </div>

        <div class="useful-link-details-modal__field">
          <span class="useful-link-details-modal__label">Observações</span>
          <p
            class="useful-link-details-modal__notes"
            :class="{ 'useful-link-details-modal__notes--empty': !detailsItem.notes }"
          >
            {{ detailsItem.notes || 'Sem observações' }}
          </p>
        </div>
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
  ExternalLinkIcon,
  Link2Icon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  TagIcon
} from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import UsefulLinkCard from '@/components/usefulLinks/UsefulLinkCard.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import { usefulLinkService } from '@/services/usefulLinkService'
import { usefulLinkTypeService } from '@/services/usefulLinkTypeService'
import { toastService } from '@/services/toastService'
import { useAuthStore } from '@/stores/authStore'
import type { UsefulLink, UsefulLinkType } from '@/types/usefulLinks'
import { Permissions } from '@/utils/permissions'

const USEFUL_LINK_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

export default defineComponent({
  name: 'UsefulLinkListView',
  components: {
    AppFormModal,
    ChevronLeftIcon,
    ChevronRightIcon,
    ExternalLinkIcon,
    Link2Icon,
    PlusIcon,
    RouterLink,
    SearchIcon,
    SlidersHorizontalIcon,
    TagIcon,
    UsefulLinkCard
  },
  data() {
    return {
      items: [] as UsefulLink[],
      usefulLinkTypes: [] as UsefulLinkType[],
      searchQuery: '',
      typeFilterId: null as number | null,
      filtersVisible: false,
      currentPage: 1,
      pageSize: USEFUL_LINK_PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
      hasLoadedOnce: false,
      listLoading: false,
      listRefreshing: false,
      searchDebouncing: false,
      searchDebounceTimer: null as ReturnType<typeof setTimeout> | null,
      actionLoadingId: null as number | null,
      detailsModalVisible: false,
      detailsItem: null as UsefulLink | null
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    canManageLinks(): boolean {
      return this.authStore.hasPermission(Permissions.UsefulLinksManage)
    },
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
        const response = await usefulLinkTypeService.list()
        this.usefulLinkTypes = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar filtros de links úteis.'
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
          error instanceof Error ? error.message : 'Erro ao carregar os links úteis.'
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

    openDetailsModal(item: UsefulLink): void {
      this.detailsItem = item
      this.detailsModalVisible = true
    },

    closeDetailsModal(): void {
      this.detailsModalVisible = false
      this.detailsItem = null
    },

    async handleDelete(item: UsefulLink): Promise<void> {
      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir link útil',
        message: `Deseja excluir o link "${item.name}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.actionLoadingId = item.id

      try {
        const response = await usefulLinkService.remove(item.id)
        toastService.success(response.message)

        if (this.detailsItem?.id === item.id) {
          this.closeDetailsModal()
        }

        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir o link útil.'
        )
      } finally {
        this.actionLoadingId = null
      }
    }
  }
})
</script>
