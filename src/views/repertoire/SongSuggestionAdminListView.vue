<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header">
      <div class="repertoire-page__header-title">
        <span class="repertoire-page__header-icon" aria-hidden="true">
          <ClipboardCheckIcon :size="20" />
        </span>
        <h1>Revisão de sugestões</h1>
      </div>
      <p class="description repertoire-page__header-description">
        Analise as sugestões enviadas pelos usuários e registre a resposta da equipe.
      </p>
    </header>

    <section class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Sugestões recebidas</h2>
        <span class="repertoire-badge">{{ listCountLabel }}</span>
      </div>

      <AppTableSkeleton
        v-if="listLoading"
        show-search
        :columns="6"
      />

      <template v-else>
        <div
          v-if="showToolbar"
          class="repertoire-list-toolbar"
        >
          <div
            class="repertoire-list-filters"
            role="group"
            aria-label="Filtrar por status"
          >
            <button
              v-for="filterOption in reviewFilterOptions"
              :key="filterOption.value"
              type="button"
              class="repertoire-list-filters__button"
              :class="{ 'repertoire-list-filters__button--active': reviewFilter === filterOption.value }"
              :aria-pressed="reviewFilter === filterOption.value ? 'true' : 'false'"
              :disabled="listRefreshing"
              @click="setReviewFilter(filterOption.value)"
            >
              <component
                :is="filterOption.icon"
                :size="16"
                aria-hidden="true"
              />
              {{ filterOption.label }}
            </button>
          </div>

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
              id="song-suggestion-admin-search"
              v-model="searchQuery"
              type="search"
              class="field-control repertoire-list-search__input"
              placeholder="Buscar por música ou nome da pessoa..."
              aria-label="Buscar sugestões"
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
        </div>

        <p v-if="showEmptyState" class="description">
          Nenhuma sugestão recebida.
        </p>

        <p v-else-if="showFilteredEmptyState" class="description">
          Nenhuma sugestão encontrada para os filtros aplicados.
        </p>

        <div
          v-else
          class="repertoire-table-wrapper repertoire-table-wrapper--fit"
          :class="{ 'repertoire-table-wrapper--loading': listRefreshing }"
        >
          <table class="repertoire-table repertoire-table--admin-suggestions">
            <colgroup>
              <col class="repertoire-table__col-icon">
              <col class="repertoire-table__col-music">
              <col class="repertoire-table__col-sender">
              <col class="repertoire-table__col-response">
              <col class="repertoire-table__col-date">
              <col class="repertoire-table__col-suggestion-status">
              <col class="repertoire-table__col-actions">
            </colgroup>
            <thead>
              <tr>
                <th class="repertoire-table__col-icon">
                  Referência
                </th>
                <th>Música</th>
                <th>Enviado por</th>
                <th>Resposta do admin</th>
                <th class="repertoire-table__col-date">
                  Enviada em
                </th>
                <th>Status</th>
                <th class="repertoire-table__col-actions" aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td class="repertoire-table__cell-icon">
                  <AppTooltip
                    v-if="item.url"
                    text="Abrir link de referência"
                  >
                    <a
                      class="repertoire-table__icon-link"
                      :href="item.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir link de referência"
                    >
                      <ExternalLinkIcon :size="16" aria-hidden="true" />
                    </a>
                  </AppTooltip>
                  <span v-else class="repertoire-table__meta repertoire-table__meta--empty">—</span>
                </td>
                <td>
                  <span class="repertoire-table__title">{{ item.name }}</span>
                  <span
                    class="repertoire-table__meta repertoire-table__meta--clamp"
                    :class="{ 'repertoire-table__meta--empty': !item.notes }"
                    :title="item.notes || undefined"
                  >
                    {{ item.notes || 'Sem observações' }}
                  </span>
                </td>
                <td>
                  <span class="repertoire-table__title">{{ item.userFullName }}</span>
                </td>
                <td>
                  <span
                    class="repertoire-table__meta"
                    :class="{ 'repertoire-table__meta--empty': !item.adminResponse }"
                  >
                    {{ item.adminResponse || 'Aguardando revisão' }}
                  </span>
                </td>
                <td>{{ formatDate(item.createdAt) }}</td>
                <td>
                  <span
                    class="repertoire-status repertoire-status--compact"
                    :class="item.isReviewed ? 'repertoire-status--reviewed' : 'repertoire-status--pending'"
                  >
                    {{ item.isReviewed ? 'Revisada' : 'Pendente' }}
                  </span>
                </td>
                <td class="repertoire-table__cell-actions">
                  <div class="repertoire-table__actions">
                    <AppTooltip
                      :text="item.adminResponse ? 'Editar resposta' : 'Adicionar resposta'"
                    >
                      <button
                        type="button"
                        class="sortable-list__action"
                        :disabled="actionLoadingId === item.id || listRefreshing"
                        :aria-label="item.adminResponse ? 'Editar resposta' : 'Adicionar resposta'"
                        @click="openResponseModal(item)"
                      >
                        <MessageSquareIcon :size="16" aria-hidden="true" />
                      </button>
                    </AppTooltip>
                    <AppTooltip
                      :text="item.isReviewed ? 'Reabrir revisão' : 'Terminar revisão'"
                    >
                      <button
                        type="button"
                        class="sortable-list__action"
                        :class="item.isReviewed
                          ? 'sortable-list__action--inactive'
                          : 'sortable-list__action--active'"
                        :disabled="actionLoadingId === item.id || listRefreshing"
                        :aria-label="item.isReviewed ? 'Reabrir revisão' : 'Terminar revisão'"
                        @click="handleToggleReview(item)"
                      >
                        <RotateCcwIcon
                          v-if="item.isReviewed"
                          :size="16"
                          aria-hidden="true"
                        />
                        <CheckCircleIcon
                          v-else
                          :size="16"
                          aria-hidden="true"
                        />
                      </button>
                    </AppTooltip>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <nav
          v-if="showPagination"
          class="repertoire-pagination"
          aria-label="Paginação de sugestões"
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
      v-model="responseModalVisible"
      title="Resposta ao usuário"
      confirm-label="Salvar resposta"
      :loading="responseLoading"
      :scrollable-body="true"
      @confirm="handleResponseSubmit"
      @cancel="closeResponseModal"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleResponseSubmit">
        <div class="song-suggestion-review-summary">
          <p><strong>Música:</strong> {{ editingItem?.name }}</p>
          <p><strong>Enviado por:</strong> {{ editingItem?.userFullName }}</p>
          <p>
            <strong>Observações:</strong>
            <span class="song-suggestion-review-summary__notes">
              {{ editingItem?.notes || 'Sem observações' }}
            </span>
          </p>
        </div>

        <label>
          Resposta do admin
          <textarea
            id="song-suggestion-admin-response"
            v-model="responseForm.adminResponse"
            rows="4"
            :maxlength="adminResponseMaxLength"
            placeholder="Escreva a resposta para o usuário"
          />
          <span class="field-counter" aria-live="polite">
            {{ responseForm.adminResponse.length }}/{{ adminResponseMaxLength }}
          </span>
        </label>
      </form>
    </AppFormModal>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { FunctionalComponent } from 'vue'
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  ClockIcon,
  ExternalLinkIcon,
  LayoutListIcon,
  MessageSquareIcon,
  RotateCcwIcon,
  SearchIcon
} from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import AppTableSkeleton from '@/components/feedback/AppTableSkeleton.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { songSuggestionService } from '@/services/songSuggestionService'
import { toastService } from '@/services/toastService'
import type {
  ReviewSongSuggestionRequest,
  SongSuggestionAdminListItem,
  SongSuggestionReviewFilter
} from '@/types/songSuggestion'

const ADMIN_RESPONSE_MAX_LENGTH = 500
const ADMIN_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

type ResponseForm = {
  adminResponse: string
}

type ReviewFilterOption = {
  value: SongSuggestionReviewFilter
  label: string
  icon: FunctionalComponent
}

const REVIEW_FILTER_OPTIONS: ReviewFilterOption[] = [
  { value: 'all', label: 'Todos', icon: LayoutListIcon },
  { value: 'reviewed', label: 'Revisados', icon: CheckCircleIcon },
  { value: 'pending', label: 'Pendentes', icon: ClockIcon }
]

export default defineComponent({
  name: 'SongSuggestionAdminListView',
  components: {
    AppFormModal,
    AppTableSkeleton,
    AppTooltip,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClipboardCheckIcon,
    ExternalLinkIcon,
    MessageSquareIcon,
    RotateCcwIcon,
    SearchIcon
  },
  data() {
    return {
      items: [] as SongSuggestionAdminListItem[],
      searchQuery: '',
      reviewFilter: 'all' as SongSuggestionReviewFilter,
      reviewFilterOptions: REVIEW_FILTER_OPTIONS,
      currentPage: 1,
      pageSize: ADMIN_PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
      hasLoadedOnce: false,
      responseModalVisible: false,
      editingItemId: null as number | null,
      responseForm: {
        adminResponse: ''
      } as ResponseForm,
      listLoading: false,
      listRefreshing: false,
      searchDebouncing: false,
      searchDebounceTimer: null as ReturnType<typeof setTimeout> | null,
      responseLoading: false,
      actionLoadingId: null as number | null,
      adminResponseMaxLength: ADMIN_RESPONSE_MAX_LENGTH
    }
  },
  computed: {
    hasActiveFilters(): boolean {
      return this.reviewFilter !== 'all' || this.searchQuery.trim().length > 0
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
    },
    editingItem(): SongSuggestionAdminListItem | null {
      if (this.editingItemId === null) {
        return null
      }

      return this.items.find((item) => item.id === this.editingItemId) ?? null
    }
  },
  watch: {
    searchQuery(): void {
      this.scheduleSearch()
    }
  },
  mounted() {
    void this.loadItems()
  },
  beforeUnmount() {
    this.clearSearchDebounce()
  },
  methods: {
    async loadItems(): Promise<void> {
      if (!this.hasLoadedOnce) {
        this.listLoading = true
      } else {
        this.listRefreshing = true
      }

      try {
        const response = await songSuggestionService.listForAdmin({
          search: this.searchQuery,
          status: this.reviewFilter,
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
          error instanceof Error ? error.message : 'Erro ao carregar sugestões.'
        )
      } finally {
        this.listLoading = false
        this.listRefreshing = false
        this.searchDebouncing = false
        this.hasLoadedOnce = true
      }
    },

    setReviewFilter(value: SongSuggestionReviewFilter): void {
      if (this.reviewFilter === value) {
        return
      }

      this.clearSearchDebounce()
      this.searchDebouncing = false
      this.reviewFilter = value
      this.currentPage = 1
      void this.loadItems()
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

    openResponseModal(item: SongSuggestionAdminListItem): void {
      this.editingItemId = item.id
      this.responseForm = {
        adminResponse: item.adminResponse ?? ''
      }
      this.responseModalVisible = true
    },

    closeResponseModal(): void {
      this.responseModalVisible = false
      this.editingItemId = null
      this.responseForm = {
        adminResponse: ''
      }
    },

    async handleResponseSubmit(): Promise<void> {
      const item = this.editingItem

      if (!item) {
        return
      }

      this.responseLoading = true
      this.actionLoadingId = item.id

      const payload: ReviewSongSuggestionRequest = {
        isReviewed: item.isReviewed,
        adminResponse: this.responseForm.adminResponse.trim() || null
      }

      try {
        await songSuggestionService.review(item.id, payload)
        toastService.success('Resposta salva com sucesso.')
        this.closeResponseModal()
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao salvar a resposta.'
        )
      } finally {
        this.responseLoading = false
        this.actionLoadingId = null
      }
    },

    async handleToggleReview(item: SongSuggestionAdminListItem): Promise<void> {
      this.actionLoadingId = item.id

      const payload: ReviewSongSuggestionRequest = {
        isReviewed: !item.isReviewed,
        adminResponse: item.adminResponse
      }

      try {
        await songSuggestionService.review(item.id, payload)
        toastService.success(
          item.isReviewed
            ? 'Revisão reaberta com sucesso.'
            : 'Revisão concluída com sucesso.'
        )
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao atualizar o status da revisão.'
        )
      } finally {
        this.actionLoadingId = null
      }
    },

    formatDate(value: string): string {
      return new Date(value).toLocaleDateString('pt-BR')
    }
  }
})
</script>
