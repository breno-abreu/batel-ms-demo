<template>
  <section class="repertoire-page">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <PaletteIcon :size="20" />
          </span>
          <h1>Temas musicais</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Cadastre e consulte os temas musicais usados para classificar o repertório.
        </p>
      </div>

      <button
        type="button"
        class="repertoire-button"
        @click="openCreateModal"
      >
        <PlusIcon :size="16" aria-hidden="true" />
        Novo tema
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
            id="musical-theme-search"
            v-model="searchQuery"
            type="search"
            class="field-control repertoire-list-search__input"
            placeholder="Buscar por nome ou descrição..."
            aria-label="Buscar temas musicais"
          >
        </div>

        <p v-if="items.length === 0" class="description">
          Nenhum tema musical cadastrado.
        </p>

        <p v-else-if="filteredItems.length === 0" class="description">
          Nenhum tema encontrado para a busca.
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
              <span
                class="sortable-list__description"
                :class="{ 'sortable-list__description--empty': !item.description }"
              >
                {{ item.description || 'Sem descrição' }}
              </span>
            </div>
            <div class="sortable-list__actions">
              <AppTooltip text="Editar tema">
                <button
                  type="button"
                  class="sortable-list__action"
                  :disabled="actionLoadingId === item.id"
                  aria-label="Editar tema"
                  @click="openEditModal(item)"
                >
                  <PencilIcon :size="16" aria-hidden="true" />
                </button>
              </AppTooltip>
              <AppTooltip
                :text="item.linkedRepertoireCount > 0
                  ? 'Não é possível excluir um tema vinculado a músicas do repertório'
                  : 'Excluir tema'"
              >
                <button
                  type="button"
                  class="sortable-list__action sortable-list__action--danger"
                  :disabled="actionLoadingId === item.id || item.linkedRepertoireCount > 0"
                  :aria-label="item.linkedRepertoireCount > 0
                    ? 'Exclusão indisponível: tema vinculado a músicas'
                    : 'Excluir tema'"
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
      title="Novo tema musical"
      confirm-label="Cadastrar"
      :loading="createLoading"
      @confirm="handleCreateSubmit"
      @cancel="closeCreateModal"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleCreateSubmit">
        <label>
          Nome *
          <input
            id="musical-theme-name"
            v-model="form.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Adoração"
            :class="{ 'field-control--invalid': nameError }"
            :aria-invalid="nameError ? 'true' : 'false'"
            :aria-describedby="nameFieldDescribedBy"
            @input="clearNameError"
          >
          <span
            id="musical-theme-name-counter"
            class="field-counter"
            aria-live="polite"
          >
            {{ form.name.length }}/{{ nameMaxLength }}
          </span>
          <span
            v-if="nameError"
            id="musical-theme-name-error"
            class="field-error"
            role="alert"
          >
            {{ nameError }}
          </span>
        </label>

        <label>
          Descrição
          <textarea
            id="musical-theme-description"
            v-model="form.description"
            rows="3"
            :maxlength="descriptionMaxLength"
            placeholder="Descrição opcional do tema"
            aria-describedby="musical-theme-description-counter"
          />
          <span
            id="musical-theme-description-counter"
            class="field-counter"
            aria-live="polite"
          >
            {{ form.description.length }}/{{ descriptionMaxLength }}
          </span>
        </label>
      </form>
    </AppFormModal>

    <AppFormModal
      v-model="editModalVisible"
      title="Editar tema musical"
      confirm-label="Salvar"
      :loading="editLoading"
      @confirm="handleEditSubmit"
      @cancel="closeEditModal"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleEditSubmit">
        <label>
          Nome *
          <input
            id="musical-theme-edit-name"
            v-model="editForm.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Adoração"
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

        <label>
          Descrição
          <textarea
            id="musical-theme-edit-description"
            v-model="editForm.description"
            rows="3"
            :maxlength="descriptionMaxLength"
            placeholder="Descrição opcional do tema"
          />
          <span class="field-counter" aria-live="polite">
            {{ editForm.description.length }}/{{ descriptionMaxLength }}
          </span>
        </label>
      </form>
    </AppFormModal>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { PaletteIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import AppListSkeleton from '@/components/feedback/AppListSkeleton.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import { musicalThemeService } from '@/services/musicalThemeService'
import { toastService } from '@/services/toastService'
import type { CreateMusicalThemeRequest, MusicalTheme, UpdateMusicalThemeRequest } from '@/types/repertoire'

const MUSICAL_THEME_NAME_MAX_LENGTH = 120
const MUSICAL_THEME_DESCRIPTION_MAX_LENGTH = 500

type MusicalThemeForm = {
  name: string
  description: string
}

export default defineComponent({
  name: 'MusicalThemeView',
  components: {
    AppFormModal,
    AppListSkeleton,
    AppTooltip,
    PaletteIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon
  },
  data() {
    return {
      form: {
        name: '',
        description: ''
      } as MusicalThemeForm,
      editForm: {
        name: '',
        description: ''
      } as MusicalThemeForm,
      editingItemId: null as number | null,
      createModalVisible: false,
      createLoading: false,
      editModalVisible: false,
      editLoading: false,
      editNameError: '',
      nameMaxLength: MUSICAL_THEME_NAME_MAX_LENGTH,
      descriptionMaxLength: MUSICAL_THEME_DESCRIPTION_MAX_LENGTH,
      items: [] as MusicalTheme[],
      searchQuery: '',
      listLoading: false,
      actionLoadingId: null as number | null,
      nameError: ''
    }
  },
  computed: {
    nameFieldDescribedBy(): string {
      return this.nameError
        ? 'musical-theme-name-counter musical-theme-name-error'
        : 'musical-theme-name-counter'
    },
    normalizedSearchQuery(): string {
      return this.searchQuery.trim().toLocaleLowerCase('pt-BR')
    },
    filteredItems(): MusicalTheme[] {
      if (!this.normalizedSearchQuery) {
        return this.items
      }

      return this.items.filter((item) => {
        const name = item.name.toLocaleLowerCase('pt-BR')
        const description = (item.description ?? '').toLocaleLowerCase('pt-BR')

        return name.includes(this.normalizedSearchQuery)
          || description.includes(this.normalizedSearchQuery)
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
        const response = await musicalThemeService.list()
        this.items = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar os temas musicais.'
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

      const payload: CreateMusicalThemeRequest = {
        name: trimmedName,
        description: this.form.description.trim() || null
      }

      try {
        const response = await musicalThemeService.create(payload)
        toastService.success(response.message)
        this.closeCreateModal()
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao cadastrar o tema musical.'
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

    openEditModal(item: MusicalTheme): void {
      this.editingItemId = item.id
      this.editForm = {
        name: item.name,
        description: item.description ?? ''
      }
      this.editNameError = ''
      this.editModalVisible = true
    },

    closeEditModal(): void {
      this.editModalVisible = false
      this.editingItemId = null
      this.editForm = {
        name: '',
        description: ''
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

      const payload: UpdateMusicalThemeRequest = {
        name: trimmedName,
        description: this.editForm.description.trim() || null
      }

      try {
        const response = await musicalThemeService.update(this.editingItemId, payload)
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
          error instanceof Error ? error.message : 'Erro ao atualizar o tema musical.'
        )
      } finally {
        this.editLoading = false
      }
    },

    async handleDelete(item: MusicalTheme): Promise<void> {
      if (item.linkedRepertoireCount > 0) {
        return
      }

      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir tema musical',
        message: `Deseja excluir o tema "${item.name}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.actionLoadingId = item.id

      try {
        const response = await musicalThemeService.remove(item.id)
        this.items = this.items.filter((currentItem) => currentItem.id !== item.id)
        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir o tema musical.'
        )
      } finally {
        this.actionLoadingId = null
      }
    },

    resetForm(): void {
      this.form = {
        name: '',
        description: ''
      }
      this.nameError = ''
    }
  }
})
</script>
