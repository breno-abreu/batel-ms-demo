<template>
  <section class="repertoire-page">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <TagsIcon :size="20" />
          </span>
          <h1>Tipos de Ticket</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Cadastre e consulte os tipos usados nos tickets de suporte (reclamação, sugestão, etc.).
        </p>
      </div>

      <button
        type="button"
        class="repertoire-button"
        @click="openCreateModal"
      >
        <PlusIcon :size="16" aria-hidden="true" />
        Novo tipo
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
        Nenhum tipo de ticket cadastrado.
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
              <AppTooltip text="Editar tipo">
                <button
                  type="button"
                  class="sortable-list__action"
                  :disabled="actionLoadingId === item.id || reorderLoading"
                  aria-label="Editar tipo"
                  @click="openEditModal(item)"
                >
                  <PencilIcon :size="16" aria-hidden="true" />
                </button>
              </AppTooltip>
              <AppTooltip
                :text="item.linkedTicketCount > 0
                  ? 'Não é possível excluir um tipo vinculado a tickets'
                  : 'Excluir tipo'"
              >
                <button
                  type="button"
                  class="sortable-list__action sortable-list__action--danger"
                  :disabled="actionLoadingId === item.id
                    || reorderLoading
                    || item.linkedTicketCount > 0"
                  :aria-label="item.linkedTicketCount > 0
                    ? 'Exclusão indisponível: tipo vinculado a tickets'
                    : 'Excluir tipo'"
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
      title="Novo tipo de ticket"
      confirm-label="Cadastrar"
      :loading="createLoading"
      @confirm="handleCreateSubmit"
      @cancel="closeCreateModal"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleCreateSubmit">
        <label>
          Nome *
          <input
            id="ticket-type-name"
            v-model="form.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Sugestão"
            :class="{ 'field-control--invalid': nameError }"
            :aria-invalid="nameError ? 'true' : 'false'"
            @input="clearNameError"
          >
          <span
            id="ticket-type-name-counter"
            class="field-counter"
            aria-live="polite"
          >
            {{ form.name.length }}/{{ nameMaxLength }}
          </span>
          <span
            v-if="nameError"
            id="ticket-type-name-error"
            class="field-error"
            role="alert"
          >
            {{ nameError }}
          </span>
        </label>
      </form>
    </AppFormModal>

    <AppFormModal
      v-model="editModalVisible"
      title="Editar tipo de ticket"
      confirm-label="Salvar"
      :loading="editLoading"
      @confirm="handleEditSubmit"
      @cancel="closeEditModal"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleEditSubmit">
        <label>
          Nome *
          <input
            id="ticket-type-edit-name"
            v-model="editForm.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Sugestão"
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
      </form>
    </AppFormModal>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  GripVerticalIcon,
  PencilIcon,
  PlusIcon,
  TagsIcon,
  Trash2Icon
} from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import AppListSkeleton from '@/components/feedback/AppListSkeleton.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import { ticketTypeService } from '@/services/ticketTypeService'
import { toastService } from '@/services/toastService'
import type {
  CreateTicketTypeRequest,
  TicketType,
  UpdateTicketTypeRequest
} from '@/types/tickets'

const TICKET_TYPE_NAME_MAX_LENGTH = 120

type TicketTypeForm = {
  name: string
}

export default defineComponent({
  name: 'TicketTypeView',
  components: {
    AppFormModal,
    AppListSkeleton,
    AppTooltip,
    GripVerticalIcon,
    PencilIcon,
    PlusIcon,
    TagsIcon,
    Trash2Icon
  },
  data() {
    return {
      form: {
        name: ''
      } as TicketTypeForm,
      editForm: {
        name: ''
      } as TicketTypeForm,
      editingItemId: null as number | null,
      createModalVisible: false,
      createLoading: false,
      editModalVisible: false,
      editLoading: false,
      editNameError: '',
      nameMaxLength: TICKET_TYPE_NAME_MAX_LENGTH,
      items: [] as TicketType[],
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
    async loadItems(): Promise<void> {
      this.listLoading = true

      try {
        const response = await ticketTypeService.list()
        this.items = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar os tipos de ticket.'
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

      const payload: CreateTicketTypeRequest = {
        name: trimmedName
      }

      try {
        const response = await ticketTypeService.create(payload)
        toastService.success(response.message)
        this.closeCreateModal()
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao cadastrar o tipo de ticket.'
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

    openEditModal(item: TicketType): void {
      this.editingItemId = item.id
      this.editForm = {
        name: item.name
      }
      this.editNameError = ''
      this.editModalVisible = true
    },

    closeEditModal(): void {
      this.editModalVisible = false
      this.editingItemId = null
      this.editForm = {
        name: ''
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

      const payload: UpdateTicketTypeRequest = {
        name: trimmedName
      }

      try {
        const response = await ticketTypeService.update(this.editingItemId, payload)
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
          error instanceof Error ? error.message : 'Erro ao atualizar o tipo de ticket.'
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
      items: TicketType[],
      previousItems: TicketType[]
    ): Promise<void> {
      this.reorderLoading = true

      try {
        const response = await ticketTypeService.reorder({
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

    async handleDelete(item: TicketType): Promise<void> {
      if (item.linkedTicketCount > 0) {
        return
      }

      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir tipo de ticket',
        message: `Deseja excluir o tipo "${item.name}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.actionLoadingId = item.id

      try {
        const response = await ticketTypeService.remove(item.id)
        this.items = this.items.filter((currentItem) => currentItem.id !== item.id)
        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir o tipo de ticket.'
        )
      } finally {
        this.actionLoadingId = null
      }
    },

    resetForm(): void {
      this.form = {
        name: ''
      }
      this.nameError = ''
    }
  }
})
</script>
