<template>
  <section class="repertoire-page">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <TagsIcon :size="20" />
          </span>
          <h1>Tipos de link útil</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Cadastre e consulte os tipos usados nos links úteis (documento, vídeo, formulário, etc.).
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
        :action-count="2"
      />

      <p v-else-if="items.length === 0" class="description">
        Nenhum tipo de link útil cadastrado.
      </p>

      <ul v-else class="sortable-list" role="list">
        <li
          v-for="item in items"
          :key="item.id"
          class="sortable-list__item"
          role="listitem"
        >
          <div class="sortable-list__info">
            <span class="sortable-list__name">{{ item.name }}</span>
          </div>
          <div class="sortable-list__actions">
            <AppTooltip text="Editar tipo">
              <button
                type="button"
                class="sortable-list__action"
                :disabled="actionLoadingId === item.id"
                aria-label="Editar tipo"
                @click="openEditModal(item)"
              >
                <PencilIcon :size="16" aria-hidden="true" />
              </button>
            </AppTooltip>
            <AppTooltip
              :text="item.linkedLinkCount > 0
                ? 'Não é possível excluir um tipo vinculado a links úteis'
                : 'Excluir tipo'"
            >
              <button
                type="button"
                class="sortable-list__action sortable-list__action--danger"
                :disabled="actionLoadingId === item.id || item.linkedLinkCount > 0"
                :aria-label="item.linkedLinkCount > 0
                  ? 'Exclusão indisponível: tipo vinculado a links úteis'
                  : 'Excluir tipo'"
                @click="handleDelete(item)"
              >
                <Trash2Icon :size="16" aria-hidden="true" />
              </button>
            </AppTooltip>
          </div>
        </li>
      </ul>
    </section>

    <AppFormModal
      v-model="createModalVisible"
      title="Novo tipo de link útil"
      confirm-label="Cadastrar"
      :loading="createLoading"
      @confirm="handleCreateSubmit"
      @cancel="closeCreateModal"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleCreateSubmit">
        <label>
          Nome *
          <input
            id="useful-link-type-name"
            v-model="form.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Documento"
            :class="{ 'field-control--invalid': nameError }"
            :aria-invalid="nameError ? 'true' : 'false'"
            @input="clearNameError"
          >
          <span
            id="useful-link-type-name-counter"
            class="field-counter"
            aria-live="polite"
          >
            {{ form.name.length }}/{{ nameMaxLength }}
          </span>
          <span
            v-if="nameError"
            id="useful-link-type-name-error"
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
      title="Editar tipo de link útil"
      confirm-label="Salvar"
      :loading="editLoading"
      @confirm="handleEditSubmit"
      @cancel="closeEditModal"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleEditSubmit">
        <label>
          Nome *
          <input
            id="useful-link-type-edit-name"
            v-model="editForm.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Documento"
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
  PencilIcon,
  PlusIcon,
  TagsIcon,
  Trash2Icon
} from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import AppListSkeleton from '@/components/feedback/AppListSkeleton.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import { usefulLinkTypeService } from '@/services/usefulLinkTypeService'
import { toastService } from '@/services/toastService'
import type {
  CreateUsefulLinkTypeRequest,
  UpdateUsefulLinkTypeRequest,
  UsefulLinkType
} from '@/types/usefulLinks'

const USEFUL_LINK_TYPE_NAME_MAX_LENGTH = 120

type UsefulLinkTypeForm = {
  name: string
}

export default defineComponent({
  name: 'UsefulLinkTypeView',
  components: {
    AppFormModal,
    AppListSkeleton,
    AppTooltip,
    PencilIcon,
    PlusIcon,
    TagsIcon,
    Trash2Icon
  },
  data() {
    return {
      form: {
        name: ''
      } as UsefulLinkTypeForm,
      editForm: {
        name: ''
      } as UsefulLinkTypeForm,
      editingItemId: null as number | null,
      createModalVisible: false,
      createLoading: false,
      editModalVisible: false,
      editLoading: false,
      editNameError: '',
      nameMaxLength: USEFUL_LINK_TYPE_NAME_MAX_LENGTH,
      items: [] as UsefulLinkType[],
      listLoading: false,
      actionLoadingId: null as number | null,
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
        const response = await usefulLinkTypeService.list()
        this.items = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar os tipos de link útil.'
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

      const payload: CreateUsefulLinkTypeRequest = {
        name: trimmedName
      }

      try {
        const response = await usefulLinkTypeService.create(payload)
        toastService.success(response.message)
        this.closeCreateModal()
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao cadastrar o tipo de link útil.'
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

    openEditModal(item: UsefulLinkType): void {
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

      const payload: UpdateUsefulLinkTypeRequest = {
        name: trimmedName
      }

      try {
        const response = await usefulLinkTypeService.update(this.editingItemId, payload)
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
          error instanceof Error ? error.message : 'Erro ao atualizar o tipo de link útil.'
        )
      } finally {
        this.editLoading = false
      }
    },

    async handleDelete(item: UsefulLinkType): Promise<void> {
      if (item.linkedLinkCount > 0) {
        return
      }

      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir tipo de link útil',
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
        const response = await usefulLinkTypeService.remove(item.id)
        this.items = this.items.filter((currentItem) => currentItem.id !== item.id)
        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir o tipo de link útil.'
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
