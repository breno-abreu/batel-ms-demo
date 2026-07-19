<template>
  <section class="repertoire-page">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <CircleDotIcon :size="20" />
          </span>
          <h1>Status de Ticket</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Cadastre e consulte os status usados no fluxo de tickets de suporte.
          Cada status deve estar associado a uma das quatro flags gerais.
        </p>
      </div>

      <button
        type="button"
        class="repertoire-button"
        @click="openCreateModal"
      >
        <PlusIcon :size="16" aria-hidden="true" />
        Novo status
      </button>
    </header>

    <section class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Itens cadastrados</h2>
        <span class="repertoire-badge">{{ items.length }}</span>
      </div>

      <AppListSkeleton
        v-if="listLoading"
        draggable
        :action-count="2"
      />

      <p v-else-if="items.length === 0" class="description">
        Nenhum status de ticket cadastrado.
      </p>

      <template v-else>
        <p class="description sortable-list__hint">
          Arraste os itens para alterar a ordem de exibição.
        </p>

        <ul class="sortable-list sortable-list--draggable" role="list">
          <li
            v-for="(item, index) in items"
            :key="item.id"
            class="sortable-list__item"
            :class="{
              'sortable-list__item--dragging': draggedIndex === index,
              'sortable-list__item--over': dragOverIndex === index && draggedIndex !== index
            }"
            role="listitem"
            @dragover.prevent="handleDragOver(index)"
            @drop.prevent="handleDrop(index)"
          >
            <button
              type="button"
              class="sortable-list__handle"
              draggable="true"
              aria-label="Arrastar para reordenar"
              @dragstart="handleDragStart(index)"
              @dragend="handleDragEnd"
            >
              <GripVerticalIcon :size="16" aria-hidden="true" />
            </button>

            <div class="sortable-list__info">
              <span class="sortable-list__name">{{ item.name }}</span>
            </div>

            <div class="sortable-list__actions">
              <span
                class="repertoire-status repertoire-status--compact"
                :class="getLifecycleClass(item)"
              >
                {{ getLifecycleLabel(item) }}
              </span>
              <AppTooltip text="Editar status">
                <button
                  type="button"
                  class="sortable-list__action"
                  :disabled="actionLoadingId === item.id || reorderLoading"
                  aria-label="Editar status"
                  @click="openEditModal(item)"
                >
                  <PencilIcon :size="16" aria-hidden="true" />
                </button>
              </AppTooltip>
              <AppTooltip
                :text="item.linkedTicketCount > 0
                  ? 'Não é possível excluir um status vinculado a tickets'
                  : 'Excluir status'"
              >
                <button
                  type="button"
                  class="sortable-list__action sortable-list__action--danger"
                  :disabled="actionLoadingId === item.id
                    || reorderLoading
                    || item.linkedTicketCount > 0"
                  :aria-label="item.linkedTicketCount > 0
                    ? 'Exclusão indisponível: status vinculado a tickets'
                    : 'Excluir status'"
                  @click="handleDelete(item)"
                >
                  <Trash2Icon :size="16" aria-hidden="true" />
                </button>
              </AppTooltip>
            </div>
          </li>
        </ul>
      </template>
    </section>

    <AppFormModal
      v-model="createModalVisible"
      title="Novo status de ticket"
      confirm-label="Cadastrar"
      :loading="createLoading"
      @confirm="handleCreateSubmit"
      @cancel="closeCreateModal"
      :scrollable-body="true"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleCreateSubmit">
        <label>
          Nome *
          <input
            id="ticket-status-name"
            v-model="form.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Aguardando informação"
            :class="{ 'field-control--invalid': nameError }"
            :aria-invalid="nameError ? 'true' : 'false'"
            @input="clearNameError"
          >
          <span
            id="ticket-status-name-counter"
            class="field-counter"
            aria-live="polite"
          >
            {{ form.name.length }}/{{ nameMaxLength }}
          </span>
          <span
            v-if="nameError"
            id="ticket-status-name-error"
            class="field-error"
            role="alert"
          >
            {{ nameError }}
          </span>
        </label>

        <fieldset class="repertoire-folder-visibility">
          <legend class="repertoire-folder-visibility__label">
            Flag geral
          </legend>
          <div
            class="repertoire-folder-visibility__options"
            role="radiogroup"
            aria-label="Flag geral do status"
          >
            <button
              v-for="option in lifecycleOptions"
              :key="option.value"
              type="button"
              class="repertoire-folder-visibility__option"
              :class="{
                'repertoire-folder-visibility__option--selected': form.lifecycleFlag === option.value
              }"
              role="radio"
              :aria-checked="form.lifecycleFlag === option.value ? 'true' : 'false'"
              @click="form.lifecycleFlag = option.value"
            >
              <component
                :is="option.icon"
                :size="22"
                aria-hidden="true"
              />
              <span class="repertoire-folder-visibility__option-title">{{ option.label }}</span>
              <span class="repertoire-folder-visibility__option-hint">
                {{ option.hint }}
              </span>
            </button>
          </div>
        </fieldset>
      </form>
    </AppFormModal>

    <AppFormModal
      v-model="editModalVisible"
      title="Editar status de ticket"
      confirm-label="Salvar"
      :loading="editLoading"
      @confirm="handleEditSubmit"
      @cancel="closeEditModal"
      :scrollable-body="true"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleEditSubmit">
        <label>
          Nome *
          <input
            id="ticket-status-edit-name"
            v-model="editForm.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Aguardando informação"
            :class="{ 'field-control--invalid': editNameError }"
            :aria-invalid="editNameError ? 'true' : 'false'"
            @input="clearEditNameError"
          >
          <span class="field-counter" aria-live="polite">
            {{ editForm.name.length }}/{{ nameMaxLength }}
          </span>
          <span
            v-if="editNameError"
            class="field-error"
            role="alert"
          >
            {{ editNameError }}
          </span>
        </label>

        <fieldset class="repertoire-folder-visibility">
          <legend class="repertoire-folder-visibility__label">
            Flag geral
          </legend>
          <div
            class="repertoire-folder-visibility__options"
            role="radiogroup"
            aria-label="Flag geral do status"
          >
            <button
              v-for="option in lifecycleOptions"
              :key="option.value"
              type="button"
              class="repertoire-folder-visibility__option"
              :class="{
                'repertoire-folder-visibility__option--selected': editForm.lifecycleFlag === option.value
              }"
              role="radio"
              :aria-checked="editForm.lifecycleFlag === option.value ? 'true' : 'false'"
              @click="editForm.lifecycleFlag = option.value"
            >
              <component
                :is="option.icon"
                :size="22"
                aria-hidden="true"
              />
              <span class="repertoire-folder-visibility__option-title">{{ option.label }}</span>
              <span class="repertoire-folder-visibility__option-hint">
                {{ option.hint }}
              </span>
            </button>
          </div>
        </fieldset>
      </form>
    </AppFormModal>
  </section>
</template>

<script lang="ts">
import { defineComponent, type Component } from 'vue'
import {
  CircleCheckIcon,
  CircleDotIcon,
  CircleXIcon,
  DoorOpenIcon,
  GripVerticalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon
} from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import AppListSkeleton from '@/components/feedback/AppListSkeleton.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import { ticketStatusService } from '@/services/ticketStatusService'
import { toastService } from '@/services/toastService'
import type {
  CreateTicketStatusRequest,
  TicketStatus,
  TicketStatusLifecycleFlag,
  UpdateTicketStatusRequest
} from '@/types/tickets'
import {
  buildTicketStatusLifecyclePayload,
  getTicketStatusLifecycleClass,
  getTicketStatusLifecycleFlag,
  getTicketStatusLifecycleLabel,
  TICKET_STATUS_LIFECYCLE_OPTIONS
} from '@/utils/ticketStatusLifecycle'

const TICKET_STATUS_NAME_MAX_LENGTH = 25

const LIFECYCLE_OPTION_ICONS: Record<TicketStatusLifecycleFlag, Component> = {
  open: DoorOpenIcon,
  in_analysis: SearchIcon,
  resolved: CircleCheckIcon,
  cancelled: CircleXIcon
}

const LIFECYCLE_OPTIONS_WITH_ICONS = TICKET_STATUS_LIFECYCLE_OPTIONS.map((option) => ({
  ...option,
  icon: LIFECYCLE_OPTION_ICONS[option.value]
}))

type TicketStatusForm = {
  name: string
  lifecycleFlag: TicketStatusLifecycleFlag
}

export default defineComponent({
  name: 'TicketStatusView',
  components: {
    AppFormModal,
    AppListSkeleton,
    AppTooltip,
    CircleDotIcon,
    GripVerticalIcon,
    PencilIcon,
    PlusIcon,
    Trash2Icon
  },
  data() {
    return {
      form: {
        name: '',
        lifecycleFlag: 'open' as TicketStatusLifecycleFlag
      } as TicketStatusForm,
      editForm: {
        name: '',
        lifecycleFlag: 'open' as TicketStatusLifecycleFlag
      } as TicketStatusForm,
      editingItemId: null as number | null,
      createModalVisible: false,
      createLoading: false,
      editModalVisible: false,
      editLoading: false,
      editNameError: '',
      nameMaxLength: TICKET_STATUS_NAME_MAX_LENGTH,
      lifecycleOptions: LIFECYCLE_OPTIONS_WITH_ICONS,
      items: [] as TicketStatus[],
      listLoading: false,
      reorderLoading: false,
      actionLoadingId: null as number | null,
      draggedIndex: null as number | null,
      dragOverIndex: null as number | null,
      nameError: ''
    }
  },
  mounted() {
    void this.loadItems()
  },
  methods: {
    getLifecycleLabel(item: TicketStatus): string {
      return getTicketStatusLifecycleLabel(getTicketStatusLifecycleFlag(item))
    },

    getLifecycleClass(item: TicketStatus): string {
      return getTicketStatusLifecycleClass(getTicketStatusLifecycleFlag(item))
    },

    async loadItems(): Promise<void> {
      this.listLoading = true

      try {
        const response = await ticketStatusService.list()
        this.items = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar os status de ticket.'
        )
      } finally {
        this.listLoading = false
      }
    },

    async handleCreateSubmit(): Promise<void> {
      const trimmedName = this.form.name.trim()

      if (!trimmedName) {
        this.nameError = 'O nome é obrigatório.'
        return
      }

      this.createLoading = true

      const payload: CreateTicketStatusRequest = {
        name: trimmedName,
        ...buildTicketStatusLifecyclePayload(this.form.lifecycleFlag)
      }

      try {
        const response = await ticketStatusService.create(payload)
        toastService.success(response.message)
        this.closeCreateModal()
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao cadastrar o status de ticket.'
        )
      } finally {
        this.createLoading = false
      }
    },

    clearNameError(): void {
      if (this.nameError) {
        this.nameError = ''
      }
    },

    openCreateModal(): void {
      this.resetForm()
      this.createModalVisible = true
    },

    closeCreateModal(): void {
      this.createModalVisible = false
      this.resetForm()
    },

    openEditModal(item: TicketStatus): void {
      this.editingItemId = item.id
      this.editForm = {
        name: item.name,
        lifecycleFlag: getTicketStatusLifecycleFlag(item)
      }
      this.editNameError = ''
      this.editModalVisible = true
    },

    closeEditModal(): void {
      this.editModalVisible = false
      this.editingItemId = null
      this.editForm = {
        name: '',
        lifecycleFlag: 'open'
      }
      this.editNameError = ''
    },

    clearEditNameError(): void {
      if (this.editNameError) {
        this.editNameError = ''
      }
    },

    async handleEditSubmit(): Promise<void> {
      if (this.editingItemId === null) {
        return
      }

      const trimmedName = this.editForm.name.trim()

      if (!trimmedName) {
        this.editNameError = 'O nome é obrigatório.'
        return
      }

      this.editLoading = true

      const payload: UpdateTicketStatusRequest = {
        name: trimmedName,
        ...buildTicketStatusLifecyclePayload(this.editForm.lifecycleFlag)
      }

      try {
        const response = await ticketStatusService.update(this.editingItemId, payload)
        const updatedItem = response.payload

        if (updatedItem) {
          this.items = this.items.map((currentItem) =>
            currentItem.id === this.editingItemId ? updatedItem : currentItem
          )
        }

        toastService.success(response.message)
        this.closeEditModal()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao atualizar o status de ticket.'
        )
      } finally {
        this.editLoading = false
      }
    },

    handleDragStart(index: number): void {
      this.draggedIndex = index
    },

    handleDragOver(index: number): void {
      this.dragOverIndex = index
    },

    async handleDrop(targetIndex: number): Promise<void> {
      if (this.draggedIndex === null || this.draggedIndex === targetIndex) {
        return
      }

      const previousItems = [...this.items]
      const reorderedItems = [...this.items]
      const [movedItem] = reorderedItems.splice(this.draggedIndex, 1)
      reorderedItems.splice(targetIndex, 0, movedItem)

      this.items = reorderedItems
      await this.persistOrder(reorderedItems, previousItems)
    },

    handleDragEnd(): void {
      this.draggedIndex = null
      this.dragOverIndex = null
    },

    async persistOrder(
      items: TicketStatus[],
      previousItems: TicketStatus[]
    ): Promise<void> {
      this.reorderLoading = true

      try {
        const response = await ticketStatusService.reorder({
          orderedIds: items.map((item) => item.id)
        })
        this.items = response.payload ?? items
        toastService.success(response.message)
      } catch (error) {
        this.items = previousItems
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao salvar a nova ordem.'
        )
      } finally {
        this.reorderLoading = false
      }
    },

    async handleDelete(item: TicketStatus): Promise<void> {
      if (item.linkedTicketCount > 0) {
        return
      }

      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir status de ticket',
        message: `Deseja excluir o status "${item.name}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.actionLoadingId = item.id

      try {
        const response = await ticketStatusService.remove(item.id)
        this.items = this.items.filter((currentItem) => currentItem.id !== item.id)
        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir o status de ticket.'
        )
      } finally {
        this.actionLoadingId = null
      }
    },

    resetForm(): void {
      this.form = {
        name: '',
        lifecycleFlag: 'open'
      }
      this.nameError = ''
    }
  }
})
</script>
