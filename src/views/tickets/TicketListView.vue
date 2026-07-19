<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <LifeBuoyIcon :size="20" />
          </span>
          <h1>Suporte</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Abra tickets de suporte para reclamações, sugestões e demais solicitações.
        </p>
      </div>

      <button
        type="button"
        class="repertoire-button"
        @click="openCreateForm"
      >
        <PlusIcon :size="16" aria-hidden="true" />
        Novo ticket
      </button>
    </header>

    <section class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Meus tickets</h2>
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
                id="ticket-search"
                v-model="searchQuery"
                type="search"
                class="field-control repertoire-list-search__input"
                placeholder="Buscar por título ou descrição..."
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
              aria-controls="ticket-advanced-filters"
              :disabled="listRefreshing"
              @click="toggleFiltersVisible"
            >
              <SlidersHorizontalIcon :size="16" aria-hidden="true" />
              Filtros
            </button>
          </div>

          <div
            v-show="filtersVisible"
            id="ticket-advanced-filters"
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
          Você ainda não abriu tickets de suporte.
        </p>

        <p v-else-if="showFilteredEmptyState" class="description">
          Nenhum ticket encontrado para os filtros aplicados.
        </p>

        <div
          v-else
          class="repertoire-table-wrapper repertoire-table-wrapper--fit"
          :class="{ 'repertoire-table-wrapper--loading': listRefreshing }"
        >
          <table class="repertoire-table repertoire-table--tickets">
            <colgroup>
              <col class="repertoire-table__col-ticket-date">
              <col class="repertoire-table__col-ticket-title">
              <col class="repertoire-table__col-ticket-description">
              <col class="repertoire-table__col-ticket-type">
              <col class="repertoire-table__col-ticket-priority">
              <col class="repertoire-table__col-ticket-status">
              <col class="repertoire-table__col-actions">
            </colgroup>
            <thead>
              <tr>
                <th class="repertoire-table__col-ticket-date">Incluído em</th>
                <th>Título</th>
                <th>Descrição</th>
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
                  <span
                    class="repertoire-table__title"
                    :title="item.title"
                  >{{ truncateText(item.title, titlePreviewMaxLength) }}</span>
                </td>
                <td>
                  <span
                    class="repertoire-table__meta"
                    :title="item.description"
                  >{{ truncateText(item.description, descriptionPreviewMaxLength) }}</span>
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
                    <AppTooltip
                      :text="item.isOpenStatus
                        ? 'Editar ticket'
                        : 'Somente tickets em aberto podem ser editados'"
                    >
                      <button
                        type="button"
                        class="sortable-list__action"
                        :disabled="actionLoadingId === item.id || !item.isOpenStatus || listRefreshing"
                        :aria-label="item.isOpenStatus
                          ? 'Editar ticket'
                          : 'Edição indisponível: ticket não está em aberto'"
                        @click="openEditModal(item)"
                      >
                        <PencilIcon :size="16" aria-hidden="true" />
                      </button>
                    </AppTooltip>
                    <AppTooltip
                      :text="item.isOpenStatus
                        ? 'Excluir ticket'
                        : 'Somente tickets em aberto podem ser excluídos'"
                    >
                      <button
                        type="button"
                        class="sortable-list__action sortable-list__action--danger"
                        :disabled="actionLoadingId === item.id || !item.isOpenStatus || listRefreshing"
                        :aria-label="item.isOpenStatus
                          ? 'Excluir ticket'
                          : 'Exclusão indisponível: ticket não está em aberto'"
                        @click="handleDelete(item)"
                      >
                        <Trash2Icon :size="16" aria-hidden="true" />
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
      v-model="formModalVisible"
      :title="formModalTitle"
      :confirm-label="formModalConfirmLabel"
      :loading-label="formModalLoadingLabel"
      wide
      :close-on-escape="false"
      :loading="formLoading"
      @confirm="handleFormSubmit"
      @cancel="closeFormModal"
      :scrollable-body="true"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleFormSubmit">
        <label>
          Título *
          <input
            id="ticket-form-title"
            v-model="ticketForm.title"
            type="text"
            :maxlength="titleMaxLength"
            placeholder="Resumo da solicitação"
            :class="{ 'field-control--invalid': titleError }"
            :aria-invalid="titleError ? 'true' : 'false'"
            @input="clearTitleError"
          >
          <span class="field-counter" aria-live="polite">
            {{ ticketForm.title.length }}/{{ titleMaxLength }}
          </span>
          <span
            v-if="titleError"
            class="field-error"
            role="alert"
          >
            {{ titleError }}
          </span>
        </label>

        <label>
          Descrição *
          <textarea
            id="ticket-form-description"
            v-model="ticketForm.description"
            rows="8"
            :maxlength="descriptionMaxLength"
            placeholder="Descreva a solicitação com o máximo de detalhes possível"
            :class="{ 'field-control--invalid': descriptionError }"
            :aria-invalid="descriptionError ? 'true' : 'false'"
            @input="clearDescriptionError"
          />
          <span class="field-counter" aria-live="polite">
            {{ ticketForm.description.length }}/{{ descriptionMaxLength }}
          </span>
          <span
            v-if="descriptionError"
            class="field-error"
            role="alert"
          >
            {{ descriptionError }}
          </span>
        </label>

        <label>
          Tipo *
          <select
            id="ticket-form-type"
            v-model="ticketForm.ticketTypeId"
            :class="{ 'field-control--invalid': typeError }"
            :aria-invalid="typeError ? 'true' : 'false'"
            @change="clearTypeError"
          >
            <option value="">
              Selecione o tipo
            </option>
            <option
              v-for="ticketType in activeTicketTypes"
              :key="ticketType.id"
              :value="ticketType.id"
            >
              {{ ticketType.name }}
            </option>
          </select>
          <span
            v-if="typeError"
            class="field-error"
            role="alert"
          >
            {{ typeError }}
          </span>
        </label>
      </form>
    </AppFormModal>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  LifeBuoyIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  Trash2Icon
} from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import AppTableSkeleton from '@/components/feedback/AppTableSkeleton.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import { priorityService } from '@/services/priorityService'
import { ticketService } from '@/services/ticketService'
import { ticketStatusService } from '@/services/ticketStatusService'
import { ticketTypeService } from '@/services/ticketTypeService'
import { toastService } from '@/services/toastService'
import type {
  CreateTicketRequest,
  Priority,
  TicketListItem,
  TicketStatus,
  TicketType,
  UpdateTicketRequest
} from '@/types/tickets'
import {
  getTicketStatusLifecycleClass,
  getTicketStatusLifecycleFlag
} from '@/utils/ticketStatusLifecycle'

const TICKET_TITLE_MAX_LENGTH = 200
const TICKET_DESCRIPTION_MAX_LENGTH = 4000
const TICKET_TITLE_PREVIEW_MAX_LENGTH = 60
const TICKET_DESCRIPTION_PREVIEW_MAX_LENGTH = 100
const TICKET_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

type TicketForm = {
  title: string
  description: string
  ticketTypeId: number | ''
}

export default defineComponent({
  name: 'TicketListView',
  components: {
    AppFormModal,
    AppTableSkeleton,
    AppTooltip,
    LifeBuoyIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
    SlidersHorizontalIcon,
    Trash2Icon
  },
  data() {
    return {
      ticketForm: {
        title: '',
        description: '',
        ticketTypeId: '' as number | ''
      } as TicketForm,
      editingItemId: null as number | null,
      formModalVisible: false,
      formLoading: false,
      titleMaxLength: TICKET_TITLE_MAX_LENGTH,
      descriptionMaxLength: TICKET_DESCRIPTION_MAX_LENGTH,
      titlePreviewMaxLength: TICKET_TITLE_PREVIEW_MAX_LENGTH,
      descriptionPreviewMaxLength: TICKET_DESCRIPTION_PREVIEW_MAX_LENGTH,
      items: [] as TicketListItem[],
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
      actionLoadingId: null as number | null,
      titleError: '',
      descriptionError: '',
      typeError: ''
    }
  },
  computed: {
    activeTicketTypes(): TicketType[] {
      return this.ticketTypes
    },
    isEditingTicket(): boolean {
      return this.editingItemId !== null
    },
    formModalTitle(): string {
      return this.isEditingTicket ? 'Editar ticket' : 'Novo ticket'
    },
    formModalConfirmLabel(): string {
      return this.isEditingTicket ? 'Salvar' : 'Enviar ticket'
    },
    formModalLoadingLabel(): string {
      return this.isEditingTicket ? 'Salvando...' : 'Enviando...'
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

    truncateText(value: string, maxLength: number): string {
      const text = value.trim()

      if (text.length <= maxLength) {
        return text
      }

      return `${text.slice(0, maxLength).trimEnd()}...`
    },

    getStatusBadgeClass(item: TicketListItem): string {
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
        const response = await ticketService.listMine({
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
          error instanceof Error ? error.message : 'Erro ao carregar seus tickets.'
        )
      } finally {
        this.listLoading = false
        this.listRefreshing = false
        this.searchDebouncing = false
        this.hasLoadedOnce = true
      }
    },

    validateForm(form: TicketForm): {
      titleError: string
      descriptionError: string
      typeError: string
      payload: CreateTicketRequest | null
    } {
      const trimmedTitle = form.title.trim()
      const trimmedDescription = form.description.trim()
      const ticketTypeId = typeof form.ticketTypeId === 'number'
        ? form.ticketTypeId
        : Number(form.ticketTypeId)

      let titleError = ''
      let descriptionError = ''
      let typeError = ''

      if (!trimmedTitle) {
        titleError = 'O título é obrigatório.'
      }

      if (!trimmedDescription) {
        descriptionError = 'A descrição é obrigatória.'
      }

      if (!ticketTypeId || Number.isNaN(ticketTypeId)) {
        typeError = 'Selecione o tipo de ticket.'
      }

      if (titleError || descriptionError || typeError) {
        return {
          titleError,
          descriptionError,
          typeError,
          payload: null
        }
      }

      return {
        titleError: '',
        descriptionError: '',
        typeError: '',
        payload: {
          title: trimmedTitle,
          description: trimmedDescription,
          ticketTypeId
        }
      }
    },

    async handleFormSubmit(): Promise<void> {
      const validation = this.validateForm(this.ticketForm)
      this.titleError = validation.titleError
      this.descriptionError = validation.descriptionError
      this.typeError = validation.typeError

      if (!validation.payload) {
        return
      }

      this.formLoading = true

      try {
        if (this.editingItemId === null) {
          const response = await ticketService.create(validation.payload)
          toastService.success(response.message)
          this.closeFormModal()
          this.currentPage = 1
          await this.loadItems()
          return
        }

        this.actionLoadingId = this.editingItemId
        const payload: UpdateTicketRequest = validation.payload
        const response = await ticketService.update(this.editingItemId, payload)
        const updatedItem = response.payload

        if (updatedItem) {
          this.items = this.items.map((currentItem) =>
            currentItem.id === this.editingItemId ? updatedItem : currentItem
          )
        }

        toastService.success(response.message)
        this.closeFormModal()
      } catch (error) {
        toastService.error(
          error instanceof Error
            ? error.message
            : this.isEditingTicket
              ? 'Erro ao atualizar o ticket.'
              : 'Erro ao enviar o ticket.'
        )
      } finally {
        this.formLoading = false
        this.actionLoadingId = null
      }
    },

    clearTitleError(): void {
      if (this.titleError) {
        this.titleError = ''
      }
    },

    clearDescriptionError(): void {
      if (this.descriptionError) {
        this.descriptionError = ''
      }
    },

    clearTypeError(): void {
      if (this.typeError) {
        this.typeError = ''
      }
    },

    openCreateForm(): void {
      this.editingItemId = null
      this.ticketForm = {
        title: '',
        description: '',
        ticketTypeId: ''
      }
      this.titleError = ''
      this.descriptionError = ''
      this.typeError = ''
      this.formModalVisible = true
    },

    openEditModal(item: TicketListItem): void {
      if (!item.isOpenStatus) {
        return
      }

      this.editingItemId = item.id
      this.ticketForm = {
        title: item.title,
        description: item.description,
        ticketTypeId: item.ticketTypeId
      }
      this.titleError = ''
      this.descriptionError = ''
      this.typeError = ''
      this.formModalVisible = true
    },

    closeFormModal(): void {
      this.formModalVisible = false
      this.editingItemId = null
      this.ticketForm = {
        title: '',
        description: '',
        ticketTypeId: ''
      }
      this.titleError = ''
      this.descriptionError = ''
      this.typeError = ''
    },

    async handleDelete(item: TicketListItem): Promise<void> {
      if (!item.isOpenStatus) {
        return
      }

      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir ticket',
        message: `Deseja excluir o ticket "${item.title}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.actionLoadingId = item.id

      try {
        const response = await ticketService.remove(item.id)
        toastService.success(response.message)
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir o ticket.'
        )
      } finally {
        this.actionLoadingId = null
      }
    }
  }
})
</script>
