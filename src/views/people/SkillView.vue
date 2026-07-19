<template>
  <section class="repertoire-page">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <AwardIcon :size="20" />
          </span>
          <h1>Habilidades</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Cadastre e consulte as habilidades usadas para registrar as competências das pessoas.
        </p>
      </div>

      <button
        v-if="canManageSkills"
        type="button"
        class="repertoire-button"
        @click="openCreateModal"
      >
        <PlusIcon :size="16" aria-hidden="true" />
        Nova habilidade
      </button>
    </header>

    <section class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Itens cadastrados</h2>
        <span class="repertoire-badge">{{ listCountLabel }}</span>
      </div>

      <AppListSkeleton
        v-if="listLoading"
        show-search
        :action-count="2"
      />

      <template v-else>
        <div
          v-if="items.length > 0"
          class="repertoire-list-search"
        >
          <SearchIcon
            class="repertoire-list-search__icon"
            :size="16"
            aria-hidden="true"
          />
          <input
            id="skill-search"
            v-model="searchQuery"
            type="search"
            class="field-control repertoire-list-search__input"
            placeholder="Buscar por nome..."
            aria-label="Buscar habilidades"
          >
        </div>

        <p v-if="items.length === 0" class="description">
          Nenhuma habilidade cadastrada.
        </p>

        <p v-else-if="filteredItems.length === 0" class="description">
          Nenhuma habilidade encontrada para a busca.
        </p>

        <ul v-else class="sortable-list" role="list">
          <li
            v-for="item in filteredItems"
            :key="item.id"
            class="sortable-list__item"
            role="listitem"
          >
            <div class="sortable-list__info">
              <span class="sortable-list__name">{{ item.name }}</span>
            </div>
            <div v-if="canManageSkills" class="sortable-list__actions">
              <AppTooltip text="Editar habilidade">
                <button
                  type="button"
                  class="sortable-list__action"
                  :disabled="actionLoadingId === item.id"
                  aria-label="Editar habilidade"
                  @click="openEditModal(item)"
                >
                  <PencilIcon :size="16" aria-hidden="true" />
                </button>
              </AppTooltip>
              <AppTooltip
                :text="item.linkedPersonCount > 0
                  ? 'Não é possível excluir uma habilidade vinculada a pessoas'
                  : 'Excluir habilidade'"
              >
                <button
                  type="button"
                  class="sortable-list__action sortable-list__action--danger"
                  :disabled="actionLoadingId === item.id || item.linkedPersonCount > 0"
                  :aria-label="item.linkedPersonCount > 0
                    ? 'Exclusão indisponível: habilidade vinculada a pessoas'
                    : 'Excluir habilidade'"
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
      title="Nova habilidade"
      confirm-label="Cadastrar"
      :loading="createLoading"
      @confirm="handleCreateSubmit"
      @cancel="closeCreateModal"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleCreateSubmit">
        <label>
          Nome *
          <input
            id="skill-name"
            v-model="form.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Teclado"
            :class="{ 'field-control--invalid': nameError }"
            :aria-invalid="nameError ? 'true' : 'false'"
            :aria-describedby="nameFieldDescribedBy"
            @input="clearNameError"
          >
          <span
            id="skill-name-counter"
            class="field-counter"
            aria-live="polite"
          >
            {{ form.name.length }}/{{ nameMaxLength }}
          </span>
          <span
            v-if="nameError"
            id="skill-name-error"
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
      title="Editar habilidade"
      confirm-label="Salvar"
      :loading="editLoading"
      @confirm="handleEditSubmit"
      @cancel="closeEditModal"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleEditSubmit">
        <label>
          Nome *
          <input
            id="skill-edit-name"
            v-model="editForm.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Teclado"
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
  AwardIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon
} from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import AppListSkeleton from '@/components/feedback/AppListSkeleton.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import { skillService } from '@/services/skillService'
import { toastService } from '@/services/toastService'
import { useAuthStore } from '@/stores/authStore'
import type { CreateSkillRequest, Skill, UpdateSkillRequest } from '@/types/people'
import { Permissions } from '@/utils/permissions'

const SKILL_NAME_MAX_LENGTH = 120

type SkillForm = {
  name: string
}

export default defineComponent({
  name: 'SkillView',
  components: {
    AppFormModal,
    AppListSkeleton,
    AppTooltip,
    AwardIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon
  },
  data() {
    return {
      form: {
        name: ''
      } as SkillForm,
      editForm: {
        name: ''
      } as SkillForm,
      editingItemId: null as number | null,
      createModalVisible: false,
      createLoading: false,
      editModalVisible: false,
      editLoading: false,
      editNameError: '',
      nameMaxLength: SKILL_NAME_MAX_LENGTH,
      items: [] as Skill[],
      searchQuery: '',
      listLoading: false,
      actionLoadingId: null as number | null,
      nameError: ''
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    canManageSkills(): boolean {
      return this.authStore.hasPermission(Permissions.SkillsManage)
    },
    nameFieldDescribedBy(): string {
      return this.nameError
        ? 'skill-name-counter skill-name-error'
        : 'skill-name-counter'
    },
    normalizedSearchQuery(): string {
      return this.searchQuery.trim().toLocaleLowerCase('pt-BR')
    },
    filteredItems(): Skill[] {
      if (!this.normalizedSearchQuery) {
        return this.items
      }

      return this.items.filter((item) => {
        const name = item.name.toLocaleLowerCase('pt-BR')
        return name.includes(this.normalizedSearchQuery)
      })
    },
    listCountLabel(): string {
      if (this.normalizedSearchQuery) {
        return `${this.filteredItems.length} de ${this.items.length}`
      }

      return String(this.items.length)
    }
  },
  mounted() {
    void this.loadItems()
  },
  methods: {
    async loadItems(): Promise<void> {
      this.listLoading = true

      try {
        const response = await skillService.list()
        this.items = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar as habilidades.'
        )
      } finally {
        this.listLoading = false
      }
    },

    async handleCreateSubmit(): Promise<void> {
      if (!this.canManageSkills) {
        return
      }

      const trimmedName = this.form.name.trim()

      if (!trimmedName) {
        this.nameError = 'O nome é obrigatório.'
        return
      }

      this.createLoading = true

      const payload: CreateSkillRequest = {
        name: trimmedName
      }

      try {
        const response = await skillService.create(payload)
        toastService.success(response.message)
        this.closeCreateModal()
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao cadastrar a habilidade.'
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

    sortItemsAlphabetically(): void {
      this.items = [...this.items].sort((first, second) =>
        first.name.localeCompare(second.name, 'pt-BR', { sensitivity: 'base' })
      )
    },

    openCreateModal(): void {
      this.resetForm()
      this.createModalVisible = true
    },

    closeCreateModal(): void {
      this.createModalVisible = false
      this.resetForm()
    },

    openEditModal(item: Skill): void {
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
      if (!this.canManageSkills || this.editingItemId === null) {
        return
      }

      const trimmedName = this.editForm.name.trim()

      if (!trimmedName) {
        this.editNameError = 'O nome é obrigatório.'
        return
      }

      this.editLoading = true

      const payload: UpdateSkillRequest = {
        name: trimmedName
      }

      try {
        const response = await skillService.update(this.editingItemId, payload)
        const updatedItem = response.payload

        if (updatedItem) {
          this.items = this.items.map((currentItem) =>
            currentItem.id === this.editingItemId ? updatedItem : currentItem
          )
          this.sortItemsAlphabetically()
        }

        toastService.success(response.message)
        this.closeEditModal()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao atualizar a habilidade.'
        )
      } finally {
        this.editLoading = false
      }
    },

    async handleDelete(item: Skill): Promise<void> {
      if (!this.canManageSkills || item.linkedPersonCount > 0) {
        return
      }

      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir habilidade',
        message: `Deseja excluir a habilidade "${item.name}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.actionLoadingId = item.id

      try {
        const response = await skillService.remove(item.id)
        this.items = this.items.filter((currentItem) => currentItem.id !== item.id)
        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir a habilidade.'
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
