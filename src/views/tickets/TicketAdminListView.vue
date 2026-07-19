<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header">
      <div class="repertoire-page__header-title">
        <span class="repertoire-page__header-icon" aria-hidden="true">
          <LifeBuoyIcon :size="20" />
        </span>
        <h1>Tickets de suporte</h1>
      </div>
      <p class="description repertoire-page__header-description">
        Acompanhe as solicitações enviadas pelos usuários e atualize status e prioridade.
      </p>
    </header>

    <section class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Solicitações recebidas</h2>
        <span class="repertoire-badge">{{ listCountLabel }}</span>
      </div>

      <AppTableSkeleton
        v-if="listLoading"
        show-search
        :columns="7"
      />

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
                id="ticket-admin-search"
                v-model="searchQuery"
                type="search"
                class="field-control repertoire-list-search__input"
                placeholder="Buscar por título, descrição ou solicitante..."
                aria-label="Buscar tickets"
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
              type="button"
              class="repertoire-list-filters-toggle"
              :class="{
                'repertoire-list-filters-toggle--expanded': filtersVisible,
                'repertoire-list-filters-toggle--applied': hasAdditionalFilters
              }"
              :aria-expanded="filtersVisible ? 'true' : 'false'"
              aria-controls="ticket-admin-advanced-filters"
              :disabled="listRefreshing"
              @click="toggleFiltersVisible"
            >
              <SlidersHorizontalIcon :size="16" aria-hidden="true" />
              Filtros
            </button>
          </div>

          <div
            v-show="filtersVisible"
            id="ticket-admin-advanced-filters"
            class="repertoire-list-advanced-filters"
          >
            <div
              v-if="ticketTypes.length > 0"
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
                  v-for="ticketType in ticketTypes"
                  :key="ticketType.id"
                  type="button"
                  class="repertoire-list-filters__button"
                  :class="{ 'repertoire-list-filters__button--active': typeFilterId === ticketType.id }"
                  :aria-pressed="typeFilterId === ticketType.id ? 'true' : 'false'"
                  :disabled="listRefreshing"
                  @click="setTypeFilter(ticketType.id)"
                >
                  {{ ticketType.name }}
                </button>
              </div>
            </div>

            <div
              v-if="statuses.length > 0"
              class="repertoire-list-filter-group"
            >
              <span class="repertoire-list-filter-group__label">Status</span>
              <div
                class="repertoire-list-filters"
                role="group"
                aria-label="Filtrar por status"
              >
                <button
                  type="button"
                  class="repertoire-list-filters__button"
                  :class="{ 'repertoire-list-filters__button--active': statusFilterId === null }"
                  :aria-pressed="statusFilterId === null ? 'true' : 'false'"
                  :disabled="listRefreshing"
                  @click="setStatusFilter(null)"
                >
                  Todos
                </button>
                <button
                  v-for="status in statuses"
                  :key="status.id"
                  type="button"
                  class="repertoire-list-filters__button"
                  :class="{ 'repertoire-list-filters__button--active': statusFilterId === status.id }"
                  :aria-pressed="statusFilterId === status.id ? 'true' : 'false'"
                  :disabled="listRefreshing"
                  @click="setStatusFilter(status.id)"
                >
                  {{ status.name }}
                </button>
              </div>
            </div>

            <div
              v-if="priorities.length > 0"
              class="repertoire-list-filter-group"
            >
              <span class="repertoire-list-filter-group__label">Prioridade</span>
              <div
                class="repertoire-list-filters"
                role="group"
                aria-label="Filtrar por prioridade"
              >
                <button
                  type="button"
                  class="repertoire-list-filters__button"
                  :class="{ 'repertoire-list-filters__button--active': priorityFilterId === null }"
                  :aria-pressed="priorityFilterId === null ? 'true' : 'false'"
                  :disabled="listRefreshing"
                  @click="setPriorityFilter(null)"
                >
                  Todas
                </button>
                <button
                  v-for="priority in priorities"
                  :key="priority.id"
                  type="button"
                  class="repertoire-list-filters__button"
                  :class="{ 'repertoire-list-filters__button--active': priorityFilterId === priority.id }"
                  :aria-pressed="priorityFilterId === priority.id ? 'true' : 'false'"
                  :disabled="listRefreshing"
                  @click="setPriorityFilter(priority.id)"
                >
                  {{ priority.name }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <p v-if="showEmptyState" class="description">
          Nenhum ticket de suporte recebido.
        </p>

        <p v-else-if="showFilteredEmptyState" class="description">
          Nenhum ticket encontrado para os filtros aplicados.
        </p>

        <div
          v-else
          class="repertoire-table-wrapper repertoire-table-wrapper--fit"
          :class="{ 'repertoire-table-wrapper--loading': listRefreshing }"
        >
          <table class="repertoire-table repertoire-table--tickets-admin">
            <colgroup>
              <col class="repertoire-table__col-ticket-date">
              <col class="repertoire-table__col-ticket-requester">
              <col class="repertoire-table__col-ticket-title">
              <col class="repertoire-table__col-ticket-type">
              <col class="repertoire-table__col-ticket-priority">
              <col class="repertoire-table__col-ticket-status">
              <col class="repertoire-table__col-actions">
            </colgroup>
            <thead>
              <tr>
                <th class="repertoire-table__col-ticket-date">Incluído em</th>
                <th>Solicitante</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th class="repertoire-table__col-actions" aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td class="repertoire-table__col-ticket-date">
                  {{ formatDate(item.createdAt) }}
                </td>
                <td>
                  <span class="repertoire-table__title">{{ item.createdByName }}</span>
                </td>
                <td>
                  <span class="repertoire-table__title">{{ item.title }}</span>
                </td>
                <td>
                  <span class="repertoire-table__meta">{{ item.ticketTypeName }}</span>
                </td>
                <td>
                  <span class="repertoire-table__meta">{{ item.ticketPriorityName }}</span>
                </td>
                <td>
                  <span
                    class="repertoire-status repertoire-status--compact"
                    :class="getStatusBadgeClass(item)"
                  >
                    {{ item.ticketStatusName }}
                  </span>
                </td>
                <td class="repertoire-table__cell-actions">
                  <div class="repertoire-table__actions">
                    <AppTooltip text="Ver detalhes">
                      <button
                        type="button"
                        class="sortable-list__action"
                        :disabled="actionLoadingId === item.id || listRefreshing"
                        aria-label="Ver detalhes"
                        @click="openDetailModal(item)"
                      >
                        <EyeIcon :size="16" aria-hidden="true" />
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
          aria-label="Paginação dos tickets"
        >
          <p class="repertoire-pagination__summary">
            Mostrando {{ pageRangeLabel }} de {{ totalItems }}
          </p>
          <div class="repertoire-pagination__controls">
            <button
              type="button"
              class="repertoire-pagination__button"
              :disabled="currentPage <= 1 || listRefreshing"
              @click="goToPreviousPage"
            >
              Anterior
            </button>
            <span class="repertoire-pagination__page">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
            <button
              type="button"
              class="repertoire-pagination__button"
              :disabled="currentPage >= totalPages || listRefreshing"
              @click="goToNextPage"
            >
              Próxima
            </button>
          </div>
        </nav>
      </template>
    </section>

    <AppFormModal
      v-model="detailModalVisible"
      title="Detalhes do ticket"
      confirm-label="Salvar"
      wide
      :close-on-escape="false"
      :loading="detailLoading"
      @confirm="handleDetailSubmit"
      @cancel="closeDetailModal"
      :scrollable-body="true"
    >
      <form v-unsaved-changes
        v-if="selectedItem"
        class="repertoire-form"
        novalidate
        @submit.prevent="handleDetailSubmit"
      >
        <div class="ticket-admin-detail__readonly">
          <div>
            <span class="ticket-admin-detail__label">Solicitante</span>
            <p class="ticket-admin-detail__value">{{ selectedItem.createdByName }}</p>
          </div>
          <div>
            <span class="ticket-admin-detail__label">Título</span>
            <p class="ticket-admin-detail__value">{{ selectedItem.title }}</p>
          </div>
          <div>
            <span class="ticket-admin-detail__label">Descrição</span>
            <p class="ticket-admin-detail__value ticket-admin-detail__value--multiline">
              {{ selectedItem.description }}
            </p>
          </div>
          <div>
            <span class="ticket-admin-detail__label">Tipo</span>
            <p class="ticket-admin-detail__value">{{ selectedItem.ticketTypeName }}</p>
          </div>
        </div>

        <label>
          Status *
          <select
            id="ticket-admin-status"
            v-model="detailForm.ticketStatusId"
            :class="{ 'field-control--invalid': statusError }"
            :aria-invalid="statusError ? 'true' : 'false'"
            @change="clearStatusError"
          >
            <option
              v-for="status in statuses"
              :key="status.id"
              :value="status.id"
            >
              {{ status.name }}
            </option>
          </select>
          <span
            v-if="statusError"
            class="field-error"
            role="alert"
          >
            {{ statusError }}
          </span>
        </label>

        <label>
          Prioridade *
          <select
            id="ticket-admin-priority"
            v-model="detailForm.ticketPriorityId"
            :class="{ 'field-control--invalid': priorityError }"
            :aria-invalid="priorityError ? 'true' : 'false'"
            @change="clearPriorityError"
          >
            <option
              v-for="priority in activePriorities"
              :key="priority.id"
              :value="priority.id"
            >
              {{ priority.name }}
            </option>
          </select>
          <span
            v-if="priorityError"
            class="field-error"
            role="alert"
          >
            {{ priorityError }}
          </span>
        </label>
      </form>
    </AppFormModal>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EyeIcon, LifeBuoyIcon, SearchIcon, SlidersHorizontalIcon } from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import AppTableSkeleton from '@/components/feedback/AppTableSkeleton.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { priorityService } from '@/services/priorityService'
import { ticketService } from '@/services/ticketService'
import { ticketStatusService } from '@/services/ticketStatusService'
import { ticketTypeService } from '@/services/ticketTypeService'
import { toastService } from '@/services/toastService'
import type {
  Priority,
  TicketAdminListItem,
  TicketStatus,
  TicketType
} from '@/types/tickets'
import {
  getTicketStatusLifecycleClass,
  getTicketStatusLifecycleFlag
} from '@/utils/ticketStatusLifecycle'

const TICKET_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

type DetailForm = {
  ticketStatusId: number | ''
  ticketPriorityId: number | ''
}

export default defineComponent({
  name: 'TicketAdminListView',
  components: {
    AppFormModal,
    AppTableSkeleton,
    AppTooltip,
    EyeIcon,
    LifeBuoyIcon,
    SearchIcon,
    SlidersHorizontalIcon
  },
  data() {
    return {
      items: [] as TicketAdminListItem[],
      ticketTypes: [] as TicketType[],
      statuses: [] as TicketStatus[],
      priorities: [] as Priority[],
      searchQuery: '',
      filtersVisible: false,
      typeFilterId: null as number | null,
      statusFilterId: null as number | null,
      priorityFilterId: null as number | null,
      currentPage: 1,
      pageSize: TICKET_PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
      hasLoadedOnce: false,
      listLoading: false,
      listRefreshing: false,
      searchDebouncing: false,
      searchDebounceTimer: null as ReturnType<typeof setTimeout> | null,
      detailModalVisible: false,
      detailLoading: false,
      selectedItem: null as TicketAdminListItem | null,
      detailForm: {
        ticketStatusId: '' as number | '',
        ticketPriorityId: '' as number | ''
      } as DetailForm,
      actionLoadingId: null as number | null,
      statusError: '',
      priorityError: ''
    }
  },
  computed: {
    activePriorities(): Priority[] {
      return this.priorities
    },
    hasActiveFilters(): boolean {
      return this.searchQuery.trim().length > 0 || this.hasAdditionalFilters
    },
    hasAdditionalFilters(): boolean {
      return this.typeFilterId !== null
        || this.statusFilterId !== null
        || this.priorityFilterId !== null
    },
    isSearchPending(): boolean {
      return this.searchDebouncing || this.listRefreshing
    },
    showToolbar(): boolean {
      return this.hasLoadedOnce && (this.totalItems > 0 || this.hasActiveFilters || this.filtersVisible)
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
    formatDate(value: string): string {
      return new Date(value).toLocaleDateString('pt-BR')
    },

    getStatusBadgeClass(item: TicketAdminListItem): string {
      const flag = getTicketStatusLifecycleFlag({
        isOpen: item.isOpenStatus,
        isInAnalysis: item.isInAnalysisStatus,
        isResolved: item.isResolvedStatus,
        isCancelled: item.isCancelledStatus
      })
      return getTicketStatusLifecycleClass(flag)
    },

    toggleFiltersVisible(): void {
      this.filtersVisible = !this.filtersVisible
    },

    setTypeFilter(typeId: number | null): void {
      if (this.typeFilterId === typeId) {
        return
      }

      this.clearSearchDebounce()
      this.searchDebouncing = false
      this.typeFilterId = typeId
      this.currentPage = 1
      void this.loadItems()
    },

    setStatusFilter(statusId: number | null): void {
      if (this.statusFilterId === statusId) {
        return
      }

      this.clearSearchDebounce()
      this.searchDebouncing = false
      this.statusFilterId = statusId
      this.currentPage = 1
      void this.loadItems()
    },

    setPriorityFilter(priorityId: number | null): void {
      if (this.priorityFilterId === priorityId) {
        return
      }

      this.clearSearchDebounce()
      this.searchDebouncing = false
      this.priorityFilterId = priorityId
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

    async loadFilterOptions(): Promise<void> {
      try {
        const [typesResponse, statusesResponse, prioritiesResponse] = await Promise.all([
          ticketTypeService.list(),
          ticketStatusService.list(),
          priorityService.list()
        ])
        this.ticketTypes = typesResponse.payload ?? []
        this.statuses = statusesResponse.payload ?? []
        this.priorities = prioritiesResponse.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar filtros dos tickets.'
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
        const response = await ticketService.listForAdmin({
          search: this.searchQuery,
          ticketTypeId: this.typeFilterId,
          ticketStatusId: this.statusFilterId,
          ticketPriorityId: this.priorityFilterId,
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
          error instanceof Error ? error.message : 'Erro ao carregar os tickets de suporte.'
        )
      } finally {
        this.listLoading = false
        this.listRefreshing = false
        this.searchDebouncing = false
        this.hasLoadedOnce = true
      }
    },

    openDetailModal(item: TicketAdminListItem): void {
      this.selectedItem = item
      this.detailForm = {
        ticketStatusId: item.ticketStatusId,
        ticketPriorityId: item.ticketPriorityId
      }
      this.statusError = ''
      this.priorityError = ''
      this.detailModalVisible = true
    },

    closeDetailModal(): void {
      this.detailModalVisible = false
      this.selectedItem = null
      this.detailForm = {
        ticketStatusId: '',
        ticketPriorityId: ''
      }
      this.statusError = ''
      this.priorityError = ''
    },

    clearStatusError(): void {
      if (this.statusError) {
        this.statusError = ''
      }
    },

    clearPriorityError(): void {
      if (this.priorityError) {
        this.priorityError = ''
      }
    },

    async handleDetailSubmit(): Promise<void> {
      if (!this.selectedItem) {
        return
      }

      const ticketStatusId = typeof this.detailForm.ticketStatusId === 'number'
        ? this.detailForm.ticketStatusId
        : Number(this.detailForm.ticketStatusId)
      const ticketPriorityId = typeof this.detailForm.ticketPriorityId === 'number'
        ? this.detailForm.ticketPriorityId
        : Number(this.detailForm.ticketPriorityId)

      let hasError = false

      if (!ticketStatusId || Number.isNaN(ticketStatusId)) {
        this.statusError = 'Selecione o status.'
        hasError = true
      }

      if (!ticketPriorityId || Number.isNaN(ticketPriorityId)) {
        this.priorityError = 'Selecione a prioridade.'
        hasError = true
      }

      if (hasError) {
        return
      }

      this.detailLoading = true
      this.actionLoadingId = this.selectedItem.id

      try {
        const response = await ticketService.updateByAdmin(this.selectedItem.id, {
          ticketStatusId,
          ticketPriorityId
        })

        toastService.success(response.message)
        this.closeDetailModal()
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao atualizar o ticket.'
        )
      } finally {
        this.detailLoading = false
        this.actionLoadingId = null
      }
    }
  }
})
</script>
