<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <ListTodoIcon :size="20" />
          </span>
          <h1>Tarefas</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Acompanhe e organize as tarefas dos ministérios.
        </p>
      </div>

      <button
        v-if="canCreateTask"
        type="button"
        class="repertoire-button"
        @click="openCreateModal"
      >
        <PlusIcon :size="16" aria-hidden="true" />
        Nova tarefa
      </button>
    </header>

    <section class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Tarefas cadastradas</h2>
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
                id="work-task-search"
                v-model="searchQuery"
                type="search"
                class="field-control repertoire-list-search__input"
                placeholder="Buscar por título..."
                aria-label="Buscar tarefas"
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
              aria-controls="work-task-advanced-filters"
              :disabled="listRefreshing"
              @click="toggleFiltersVisible"
            >
              <SlidersHorizontalIcon :size="16" aria-hidden="true" />
              Filtros
            </button>
          </div>

          <div
            v-show="filtersVisible"
            id="work-task-advanced-filters"
            class="repertoire-list-advanced-filters"
          >
            <div
              v-if="ministries.length > 0"
              class="repertoire-list-filter-group"
            >
              <span class="repertoire-list-filter-group__label">Ministério</span>
              <div
                class="repertoire-list-filters"
                role="group"
                aria-label="Filtrar por ministério"
              >
                <button
                  type="button"
                  class="repertoire-list-filters__button"
                  :class="{ 'repertoire-list-filters__button--active': ministryFilterId === null }"
                  :aria-pressed="ministryFilterId === null ? 'true' : 'false'"
                  :disabled="listRefreshing"
                  @click="setMinistryFilter(null)"
                >
                  Todos
                </button>
                <button
                  v-for="ministry in ministries"
                  :key="ministry.id"
                  type="button"
                  class="repertoire-list-filters__button"
                  :class="{ 'repertoire-list-filters__button--active': ministryFilterId === ministry.id }"
                  :aria-pressed="ministryFilterId === ministry.id ? 'true' : 'false'"
                  :disabled="listRefreshing"
                  @click="setMinistryFilter(ministry.id)"
                >
                  {{ ministry.name }}
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
          Nenhuma tarefa cadastrada.
        </p>

        <p v-else-if="showFilteredEmptyState" class="description">
          Nenhuma tarefa encontrada para os filtros aplicados.
        </p>

        <div
          v-else
          class="repertoire-table-wrapper repertoire-table-wrapper--fit"
          :class="{ 'repertoire-table-wrapper--loading': listRefreshing }"
        >
          <table class="repertoire-table repertoire-table--tasks">
            <colgroup>
              <col class="repertoire-table__col-task-date">
              <col class="repertoire-table__col-task-title">
              <col class="repertoire-table__col-task-ministry">
              <col class="repertoire-table__col-task-person">
              <col class="repertoire-table__col-task-priority">
              <col class="repertoire-table__col-task-status">
              <col class="repertoire-table__col-actions">
            </colgroup>
            <thead>
              <tr>
                <th class="repertoire-table__col-task-date">Incluído em</th>
                <th>Título</th>
                <th>Ministério</th>
                <th>Responsável</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th class="repertoire-table__col-actions" aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td class="repertoire-table__col-task-date">
                  {{ formatDate(item.createdAt) }}
                </td>
                <td>
                  <div class="repertoire-table__stack">
                    <span class="repertoire-table__title">{{ item.title }}</span>
                    <span
                      v-if="item.dueDate"
                      class="repertoire-table__meta"
                    >
                      Prazo {{ formatDateOnly(item.dueDate) }}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="repertoire-table__meta">{{ item.ministryName }}</span>
                </td>
                <td>
                  <span class="repertoire-table__meta">
                    {{ item.assignedToPersonName || '—' }}
                  </span>
                </td>
                <td>
                  <span class="repertoire-table__meta">{{ item.taskPriorityName }}</span>
                </td>
                <td>
                  <span
                    class="repertoire-status repertoire-status--compact"
                    :class="getStatusBadgeClass(item)"
                  >
                    {{ item.taskStatusName }}
                  </span>
                </td>
                <td class="repertoire-table__cell-actions">
                  <div v-if="canManageTask(item)" class="repertoire-table__actions">
                    <AppTooltip text="Editar tarefa">
                      <button
                        type="button"
                        class="sortable-list__action"
                        :disabled="actionLoadingId === item.id"
                        aria-label="Editar tarefa"
                        @click="openEditModal(item)"
                      >
                        <PencilIcon :size="16" aria-hidden="true" />
                      </button>
                    </AppTooltip>
                    <AppTooltip text="Excluir tarefa">
                      <button
                        type="button"
                        class="sortable-list__action sortable-list__action--danger"
                        :disabled="actionLoadingId === item.id"
                        aria-label="Excluir tarefa"
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
          aria-label="Paginação das tarefas"
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
      v-model="createModalVisible"
      title="Nova tarefa"
      confirm-label="Salvar tarefa"
      wide
      :loading="loading"
      @confirm="handleSubmit"
      @cancel="closeCreateModal"
      :scrollable-body="true"
    >
      <form
        v-unsaved-changes
        class="repertoire-form repertoire-form--grid"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <label class="repertoire-form__field--full">
          Título *
          <input
            id="work-task-title"
            v-model="form.title"
            type="text"
            :maxlength="titleMaxLength"
            placeholder="Resumo da tarefa"
            :class="{ 'field-control--invalid': titleError }"
            :aria-invalid="titleError ? 'true' : 'false'"
            @input="clearTitleError"
          >
          <span class="field-counter" aria-live="polite">
            {{ form.title.length }}/{{ titleMaxLength }}
          </span>
          <span v-if="titleError" class="field-error" role="alert">{{ titleError }}</span>
        </label>

        <label class="repertoire-form__field--full">
          Descrição *
          <textarea
            id="work-task-description"
            v-model="form.description"
            rows="4"
            :maxlength="descriptionMaxLength"
            placeholder="Descreva o que precisa ser feito"
            :class="{ 'field-control--invalid': descriptionError }"
            :aria-invalid="descriptionError ? 'true' : 'false'"
            @input="clearDescriptionError"
          />
          <span class="field-counter" aria-live="polite">
            {{ form.description.length }}/{{ descriptionMaxLength }}
          </span>
          <span v-if="descriptionError" class="field-error" role="alert">
            {{ descriptionError }}
          </span>
        </label>

        <label>
          Ministério *
          <select
            id="work-task-ministry"
            v-model="form.ministryId"
            :class="{ 'field-control--invalid': ministryError }"
            :aria-invalid="ministryError ? 'true' : 'false'"
            @change="clearMinistryError"
          >
            <option value="">
              Selecione o ministério
            </option>
            <option
              v-for="ministry in activeMinistries"
              :key="ministry.id"
              :value="ministry.id"
            >
              {{ ministry.name }}
            </option>
          </select>
          <span v-if="ministryError" class="field-error" role="alert">{{ ministryError }}</span>
        </label>

        <label>
          Responsável
          <select
            id="work-task-assignee"
            v-model="form.assignedToPersonId"
          >
            <option value="">
              Opcional
            </option>
            <option
              v-for="person in people"
              :key="person.id"
              :value="person.id"
            >
              {{ person.preferredName || person.fullName }}
            </option>
          </select>
        </label>

        <label>
          Status *
          <select
            id="work-task-status"
            v-model="form.taskStatusId"
            :class="{ 'field-control--invalid': statusError }"
            :aria-invalid="statusError ? 'true' : 'false'"
            @change="clearStatusError"
          >
            <option value="">
              Selecione o status
            </option>
            <option
              v-for="status in activeStatuses"
              :key="status.id"
              :value="status.id"
            >
              {{ status.name }}
            </option>
          </select>
          <span v-if="statusError" class="field-error" role="alert">{{ statusError }}</span>
        </label>

        <label>
          Prioridade *
          <select
            id="work-task-priority"
            v-model="form.taskPriorityId"
            :class="{ 'field-control--invalid': priorityError }"
            :aria-invalid="priorityError ? 'true' : 'false'"
            @change="clearPriorityError"
          >
            <option value="">
              Selecione a prioridade
            </option>
            <option
              v-for="priority in activePriorities"
              :key="priority.id"
              :value="priority.id"
            >
              {{ priority.name }}
            </option>
          </select>
          <span v-if="priorityError" class="field-error" role="alert">{{ priorityError }}</span>
        </label>

        <label>
          Prazo
          <AppDatePicker
            v-model="form.dueDate"
            input-id="work-task-due-date"
            placeholder="dd/mm/aaaa"
          />
        </label>
      </form>
    </AppFormModal>

    <AppFormModal
      v-model="editModalVisible"
      title="Editar tarefa"
      confirm-label="Salvar"
      wide
      :loading="editLoading"
      @confirm="handleEditSubmit"
      @cancel="closeEditModal"
      :scrollable-body="true"
    >
      <form v-unsaved-changes
        class="repertoire-form repertoire-form--grid"
        novalidate
        @submit.prevent="handleEditSubmit"
      >
        <label class="repertoire-form__field--full">
          Título *
          <input
            id="work-task-edit-title"
            v-model="editForm.title"
            type="text"
            :maxlength="titleMaxLength"
            :class="{ 'field-control--invalid': editTitleError }"
            :aria-invalid="editTitleError ? 'true' : 'false'"
            @input="clearEditTitleError"
          >
          <span class="field-counter" aria-live="polite">
            {{ editForm.title.length }}/{{ titleMaxLength }}
          </span>
          <span v-if="editTitleError" class="field-error" role="alert">{{ editTitleError }}</span>
        </label>

        <label class="repertoire-form__field--full">
          Descrição *
          <textarea
            id="work-task-edit-description"
            v-model="editForm.description"
            rows="4"
            :maxlength="descriptionMaxLength"
            :class="{ 'field-control--invalid': editDescriptionError }"
            :aria-invalid="editDescriptionError ? 'true' : 'false'"
            @input="clearEditDescriptionError"
          />
          <span class="field-counter" aria-live="polite">
            {{ editForm.description.length }}/{{ descriptionMaxLength }}
          </span>
          <span v-if="editDescriptionError" class="field-error" role="alert">
            {{ editDescriptionError }}
          </span>
        </label>

        <label>
          Ministério *
          <select
            id="work-task-edit-ministry"
            v-model="editForm.ministryId"
            :class="{ 'field-control--invalid': editMinistryError }"
            :aria-invalid="editMinistryError ? 'true' : 'false'"
            @change="clearEditMinistryError"
          >
            <option value="">
              Selecione o ministério
            </option>
            <option
              v-for="ministry in activeMinistries"
              :key="ministry.id"
              :value="ministry.id"
            >
              {{ ministry.name }}
            </option>
          </select>
          <span v-if="editMinistryError" class="field-error" role="alert">
            {{ editMinistryError }}
          </span>
        </label>

        <label>
          Responsável
          <select
            id="work-task-edit-assignee"
            v-model="editForm.assignedToPersonId"
          >
            <option value="">
              Opcional
            </option>
            <option
              v-for="person in people"
              :key="person.id"
              :value="person.id"
            >
              {{ person.preferredName || person.fullName }}
            </option>
          </select>
        </label>

        <label>
          Status *
          <select
            id="work-task-edit-status"
            v-model="editForm.taskStatusId"
            :class="{ 'field-control--invalid': editStatusError }"
            :aria-invalid="editStatusError ? 'true' : 'false'"
            @change="clearEditStatusError"
          >
            <option value="">
              Selecione o status
            </option>
            <option
              v-for="status in activeStatuses"
              :key="status.id"
              :value="status.id"
            >
              {{ status.name }}
            </option>
          </select>
          <span v-if="editStatusError" class="field-error" role="alert">{{ editStatusError }}</span>
        </label>

        <label>
          Prioridade *
          <select
            id="work-task-edit-priority"
            v-model="editForm.taskPriorityId"
            :class="{ 'field-control--invalid': editPriorityError }"
            :aria-invalid="editPriorityError ? 'true' : 'false'"
            @change="clearEditPriorityError"
          >
            <option value="">
              Selecione a prioridade
            </option>
            <option
              v-for="priority in activePriorities"
              :key="priority.id"
              :value="priority.id"
            >
              {{ priority.name }}
            </option>
          </select>
          <span v-if="editPriorityError" class="field-error" role="alert">
            {{ editPriorityError }}
          </span>
        </label>

        <label>
          Prazo
          <AppDatePicker
            v-model="editForm.dueDate"
            input-id="work-task-edit-due-date"
            placeholder="dd/mm/aaaa"
          />
        </label>
      </form>
    </AppFormModal>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  ListTodoIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  Trash2Icon
} from '@lucide/vue'
import AppDatePicker from '@/components/form/AppDatePicker.vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import AppTableSkeleton from '@/components/feedback/AppTableSkeleton.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import { ministryService } from '@/services/ministryService'
import { personService } from '@/services/personService'
import { priorityService } from '@/services/priorityService'
import { toastService } from '@/services/toastService'
import { workTaskService } from '@/services/workTaskService'
import { workTaskStatusService } from '@/services/workTaskStatusService'
import { useAuthStore } from '@/stores/authStore'
import type { Ministry, PersonSummary } from '@/types/people'
import type {
  CreateWorkTaskPayload,
  UpdateWorkTaskPayload,
  WorkTaskListItem,
  WorkTaskStatus
} from '@/types/requests'
import type { Priority } from '@/types/tickets'
import { Permissions } from '@/utils/permissions'
import {
  getWorkTaskStatusLifecycleClass,
  getWorkTaskStatusLifecycleFlag
} from '@/utils/workTaskStatusLifecycle'

const TITLE_MAX_LENGTH = 200
const DESCRIPTION_MAX_LENGTH = 4000
const WORK_TASK_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

type WorkTaskForm = {
  title: string
  description: string
  ministryId: number | ''
  taskStatusId: number | ''
  taskPriorityId: number | ''
  assignedToPersonId: number | ''
  dueDate: string
}

type FormValidation = {
  titleError: string
  descriptionError: string
  ministryError: string
  statusError: string
  priorityError: string
  payload: CreateWorkTaskPayload | UpdateWorkTaskPayload | null
}

function createEmptyForm(): WorkTaskForm {
  return {
    title: '',
    description: '',
    ministryId: '',
    taskStatusId: '',
    taskPriorityId: '',
    assignedToPersonId: '',
    dueDate: ''
  }
}

export default defineComponent({
  name: 'TaskListView',
  components: {
    AppDatePicker,
    AppFormModal,
    AppTableSkeleton,
    AppTooltip,
    ListTodoIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
    SlidersHorizontalIcon,
    Trash2Icon
  },
  data() {
    return {
      form: createEmptyForm(),
      editForm: createEmptyForm(),
      editingItemId: null as number | null,
      createModalVisible: false,
      editModalVisible: false,
      editLoading: false,
      titleMaxLength: TITLE_MAX_LENGTH,
      descriptionMaxLength: DESCRIPTION_MAX_LENGTH,
      items: [] as WorkTaskListItem[],
      ministries: [] as Ministry[],
      people: [] as PersonSummary[],
      statuses: [] as WorkTaskStatus[],
      priorities: [] as Priority[],
      searchQuery: '',
      filtersVisible: false,
      ministryFilterId: null as number | null,
      statusFilterId: null as number | null,
      priorityFilterId: null as number | null,
      currentPage: 1,
      pageSize: WORK_TASK_PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
      hasLoadedOnce: false,
      loading: false,
      listLoading: false,
      listRefreshing: false,
      searchDebouncing: false,
      searchDebounceTimer: null as ReturnType<typeof setTimeout> | null,
      actionLoadingId: null as number | null,
      titleError: '',
      descriptionError: '',
      ministryError: '',
      statusError: '',
      priorityError: '',
      editTitleError: '',
      editDescriptionError: '',
      editMinistryError: '',
      editStatusError: '',
      editPriorityError: ''
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    canManageAllTasks(): boolean {
      return this.authStore.hasPermission(Permissions.TasksView)
        || this.authStore.hasPermission(Permissions.TasksManageAll)
    },
    canManageOwnTasks(): boolean {
      return this.authStore.hasPermission(Permissions.TasksManageOwn)
        || this.authStore.hasPermission(Permissions.TasksViewOwn)
    },
    canViewAllTasks(): boolean {
      return this.authStore.hasPermission(Permissions.TasksView)
        || this.authStore.hasPermission(Permissions.TasksManageAll)
    },
    canCreateTask(): boolean {
      return this.canManageAllTasks || this.canManageOwnTasks
    },
    activeMinistries(): Ministry[] {
      return this.ministries.filter((item) => item.isActive)
    },
    activeStatuses(): WorkTaskStatus[] {
      return this.statuses
    },
    activePriorities(): Priority[] {
      return this.priorities
    },
    hasActiveFilters(): boolean {
      return this.searchQuery.trim().length > 0 || this.hasAdditionalFilters
    },
    hasAdditionalFilters(): boolean {
      return this.ministryFilterId !== null
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
    canManageTask(item: WorkTaskListItem): boolean {
      if (this.canManageAllTasks) {
        return true
      }

      return this.canManageOwnTasks && item.createdByUserId === this.authStore.user?.id
    },

    getStatusBadgeClass(item: WorkTaskListItem): string {
      const flag = getWorkTaskStatusLifecycleFlag({
        isPendingStatus: item.isPendingStatus,
        isInProgressStatus: item.isInProgressStatus,
        isCompletedStatus: item.isCompletedStatus,
        isCancelledStatus: item.isCancelledStatus
      })
      return getWorkTaskStatusLifecycleClass(flag)
    },

    formatDate(value: string): string {
      return new Date(value).toLocaleDateString('pt-BR')
    },

    formatDateOnly(value: string): string {
      const [year, month, day] = value.split('-')

      if (!year || !month || !day) {
        return value
      }

      return `${day}/${month}/${year}`
    },

    toggleFiltersVisible(): void {
      this.filtersVisible = !this.filtersVisible
    },

    setMinistryFilter(ministryId: number | null): void {
      if (this.ministryFilterId === ministryId) {
        return
      }

      this.clearSearchDebounce()
      this.searchDebouncing = false
      this.ministryFilterId = ministryId
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
        const [
          ministriesResponse,
          peopleResponse,
          statusesResponse,
          prioritiesResponse
        ] = await Promise.all([
          ministryService.list(),
          personService.listForSelection(),
          workTaskStatusService.list(),
          priorityService.list()
        ])

        this.ministries = ministriesResponse.payload ?? []
        this.people = peopleResponse.payload ?? []
        this.statuses = statusesResponse.payload ?? []
        this.priorities = prioritiesResponse.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar os filtros das tarefas.'
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
        const response = await workTaskService.list({
          search: this.searchQuery,
          ministryId: this.ministryFilterId,
          taskStatusId: this.statusFilterId,
          taskPriorityId: this.priorityFilterId,
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
          error instanceof Error ? error.message : 'Erro ao carregar as tarefas.'
        )
      } finally {
        this.listLoading = false
        this.listRefreshing = false
        this.searchDebouncing = false
        this.hasLoadedOnce = true
      }
    },

    validateForm(form: WorkTaskForm): FormValidation {
      const trimmedTitle = form.title.trim()
      const trimmedDescription = form.description.trim()
      const ministryId = typeof form.ministryId === 'number'
        ? form.ministryId
        : Number(form.ministryId)
      const taskStatusId = typeof form.taskStatusId === 'number'
        ? form.taskStatusId
        : Number(form.taskStatusId)
      const taskPriorityId = typeof form.taskPriorityId === 'number'
        ? form.taskPriorityId
        : Number(form.taskPriorityId)
      const assignedToPersonId = form.assignedToPersonId === ''
        ? null
        : (typeof form.assignedToPersonId === 'number'
          ? form.assignedToPersonId
          : Number(form.assignedToPersonId))

      let titleError = ''
      let descriptionError = ''
      let ministryError = ''
      let statusError = ''
      let priorityError = ''

      if (!trimmedTitle) {
        titleError = 'O título é obrigatório.'
      }

      if (!trimmedDescription) {
        descriptionError = 'A descrição é obrigatória.'
      }

      if (!ministryId || Number.isNaN(ministryId)) {
        ministryError = 'Selecione o ministério.'
      }

      if (!taskStatusId || Number.isNaN(taskStatusId)) {
        statusError = 'Selecione o status.'
      }

      if (!taskPriorityId || Number.isNaN(taskPriorityId)) {
        priorityError = 'Selecione a prioridade.'
      }

      if (
        assignedToPersonId !== null
        && (Number.isNaN(assignedToPersonId) || assignedToPersonId <= 0)
      ) {
        return {
          titleError,
          descriptionError,
          ministryError,
          statusError,
          priorityError,
          payload: null
        }
      }

      if (titleError || descriptionError || ministryError || statusError || priorityError) {
        return {
          titleError,
          descriptionError,
          ministryError,
          statusError,
          priorityError,
          payload: null
        }
      }

      return {
        titleError: '',
        descriptionError: '',
        ministryError: '',
        statusError: '',
        priorityError: '',
        payload: {
          title: trimmedTitle,
          description: trimmedDescription,
          ministryId,
          taskStatusId,
          taskPriorityId,
          assignedToPersonId,
          dueDate: form.dueDate.trim() || null
        }
      }
    },

    openCreateModal(): void {
      this.form = createEmptyForm()

      const defaultStatus = this.activeStatuses.find((s) => s.isPending)
        ?? this.activeStatuses[0]

      if (defaultStatus) {
        this.form.taskStatusId = defaultStatus.id
      }

      const defaultPriority = this.activePriorities[0]

      if (defaultPriority) {
        this.form.taskPriorityId = defaultPriority.id
      }

      this.clearCreateErrors()
      this.createModalVisible = true
    },

    closeCreateModal(): void {
      this.createModalVisible = false
      this.form = createEmptyForm()
      this.clearCreateErrors()
    },

    clearCreateErrors(): void {
      this.titleError = ''
      this.descriptionError = ''
      this.ministryError = ''
      this.statusError = ''
      this.priorityError = ''
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

    clearMinistryError(): void {
      if (this.ministryError) {
        this.ministryError = ''
      }
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

    clearEditTitleError(): void {
      if (this.editTitleError) {
        this.editTitleError = ''
      }
    },

    clearEditDescriptionError(): void {
      if (this.editDescriptionError) {
        this.editDescriptionError = ''
      }
    },

    clearEditMinistryError(): void {
      if (this.editMinistryError) {
        this.editMinistryError = ''
      }
    },

    clearEditStatusError(): void {
      if (this.editStatusError) {
        this.editStatusError = ''
      }
    },

    clearEditPriorityError(): void {
      if (this.editPriorityError) {
        this.editPriorityError = ''
      }
    },

    async handleSubmit(): Promise<void> {
      if (!this.canCreateTask) {
        return
      }

      const validation = this.validateForm(this.form)
      this.titleError = validation.titleError
      this.descriptionError = validation.descriptionError
      this.ministryError = validation.ministryError
      this.statusError = validation.statusError
      this.priorityError = validation.priorityError

      if (!validation.payload) {
        return
      }

      this.loading = true

      try {
        const response = await workTaskService.create(validation.payload)
        toastService.success(response.message)
        this.closeCreateModal()
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao criar a tarefa.'
        )
      } finally {
        this.loading = false
      }
    },

    openEditModal(item: WorkTaskListItem): void {
      if (!this.canManageTask(item)) {
        return
      }

      this.editingItemId = item.id
      this.editForm = {
        title: item.title,
        description: item.description,
        ministryId: item.ministryId,
        taskStatusId: item.taskStatusId,
        taskPriorityId: item.taskPriorityId,
        assignedToPersonId: item.assignedToPersonId ?? '',
        dueDate: item.dueDate ?? ''
      }
      this.editTitleError = ''
      this.editDescriptionError = ''
      this.editMinistryError = ''
      this.editStatusError = ''
      this.editPriorityError = ''
      this.editModalVisible = true
    },

    closeEditModal(): void {
      this.editModalVisible = false
      this.editingItemId = null
      this.editForm = createEmptyForm()
      this.editTitleError = ''
      this.editDescriptionError = ''
      this.editMinistryError = ''
      this.editStatusError = ''
      this.editPriorityError = ''
    },

    async handleEditSubmit(): Promise<void> {
      if (this.editingItemId === null) {
        return
      }

      const editingItem = this.items.find((item) => item.id === this.editingItemId)

      if (!editingItem || !this.canManageTask(editingItem)) {
        return
      }

      const validation = this.validateForm(this.editForm)
      this.editTitleError = validation.titleError
      this.editDescriptionError = validation.descriptionError
      this.editMinistryError = validation.ministryError
      this.editStatusError = validation.statusError
      this.editPriorityError = validation.priorityError

      if (!validation.payload) {
        return
      }

      this.editLoading = true

      try {
        const response = await workTaskService.update(this.editingItemId, validation.payload)
        toastService.success(response.message)
        this.closeEditModal()
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao atualizar a tarefa.'
        )
      } finally {
        this.editLoading = false
      }
    },

    async handleDelete(item: WorkTaskListItem): Promise<void> {
      if (!this.canManageTask(item)) {
        return
      }

      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir tarefa',
        message: `Deseja excluir a tarefa "${item.title}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.actionLoadingId = item.id

      try {
        const response = await workTaskService.remove(item.id)
        toastService.success(response.message)
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir a tarefa.'
        )
      } finally {
        this.actionLoadingId = null
      }
    }
  }
})
</script>
