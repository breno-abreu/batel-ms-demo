<template>
  <section class="repertoire-page">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <ChurchIcon :size="20" />
          </span>
          <h1>Ministérios</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Cadastre e consulte os ministérios usados para organizar as atribuições das pessoas.
        </p>
      </div>

      <button
        v-if="canManageMinistries"
        type="button"
        class="repertoire-button"
        @click="openCreateModal"
      >
        <PlusIcon :size="16" aria-hidden="true" />
        Novo ministério
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
        :action-count="3"
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
            id="ministry-search"
            v-model="searchQuery"
            type="search"
            class="field-control repertoire-list-search__input"
            placeholder="Buscar por nome, descrição ou responsável..."
            aria-label="Buscar ministérios"
          >
        </div>

        <p v-if="items.length === 0" class="description">
          Nenhum ministério cadastrado.
        </p>

        <p v-else-if="filteredItems.length === 0" class="description">
          Nenhum ministério encontrado para a busca.
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
                :class="{ 'sortable-list__description--empty': !getItemDescription(item) }"
              >
                {{ getItemDescription(item) || 'Sem descrição' }}
              </span>
              <span class="sortable-list__meta">
                {{ item.isMusicMinistry ? 'Ministério da música' : 'Ministério geral' }}
              </span>
            </div>
            <div v-if="canManageMinistries" class="sortable-list__actions">
              <AppTooltip text="Editar ministério">
                <button
                  type="button"
                  class="sortable-list__action"
                  :disabled="actionLoadingId === item.id"
                  aria-label="Editar ministério"
                  @click="openEditModal(item)"
                >
                  <PencilIcon :size="16" aria-hidden="true" />
                </button>
              </AppTooltip>
              <AppTooltip :text="item.isActive ? 'Desativar ministério' : 'Ativar ministério'">
                <button
                  type="button"
                  class="sortable-list__action"
                  :class="{
                    'sortable-list__action--active': item.isActive,
                    'sortable-list__action--inactive': !item.isActive
                  }"
                  :disabled="actionLoadingId === item.id"
                  :aria-label="item.isActive ? 'Desativar ministério' : 'Ativar ministério'"
                  @click="handleToggleActive(item)"
                >
                  <PowerIcon :size="16" aria-hidden="true" />
                </button>
              </AppTooltip>
              <AppTooltip
                :text="item.linkedPersonCount > 0
                  ? 'Não é possível excluir um ministério com pessoas vinculadas'
                  : 'Excluir ministério'"
              >
                <button
                  type="button"
                  class="sortable-list__action sortable-list__action--danger"
                  :disabled="actionLoadingId === item.id || item.linkedPersonCount > 0"
                  :aria-label="item.linkedPersonCount > 0
                    ? 'Exclusão indisponível: ministério com pessoas vinculadas'
                    : 'Excluir ministério'"
                  @click="handleDelete(item)"
                >
                  <Trash2Icon :size="16" aria-hidden="true" />
                </button>
              </AppTooltip>
            </div>
            <span
              class="repertoire-status sortable-list__status"
              :class="{ 'repertoire-status--inactive': !item.isActive }"
            >
              {{ item.isActive ? 'Ativo' : 'Inativo' }}
            </span>
          </li>
        </ul>
      </template>
    </section>

    <AppFormModal
      v-model="createModalVisible"
      title="Novo ministério"
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
            id="ministry-name"
            v-model="form.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Música"
            :class="{ 'field-control--invalid': nameError }"
            :aria-invalid="nameError ? 'true' : 'false'"
            :aria-describedby="nameFieldDescribedBy"
            @input="clearNameError"
          >
          <span
            id="ministry-name-counter"
            class="field-counter"
            aria-live="polite"
          >
            {{ form.name.length }}/{{ nameMaxLength }}
          </span>
          <span
            v-if="nameError"
            id="ministry-name-error"
            class="field-error"
            role="alert"
          >
            {{ nameError }}
          </span>
        </label>

        <label>
          Descrição
          <textarea
            id="ministry-description"
            v-model="form.description"
            class="field-control"
            rows="3"
            :maxlength="descriptionMaxLength"
            placeholder="Descrição opcional do ministério"
            aria-describedby="ministry-description-counter"
          />
          <span
            id="ministry-description-counter"
            class="field-counter"
            aria-live="polite"
          >
            {{ form.description.length }}/{{ descriptionMaxLength }}
          </span>
        </label>

        <label>
          Responsável
          <select
            id="ministry-manager"
            v-model="form.personIdManager"
            class="field-control"
          >
            <option :value="null">
              Nenhum
            </option>
            <option
              v-for="person in people"
              :key="person.id"
              :value="person.id"
            >
              {{ formatPersonLabel(person) }}
            </option>
          </select>
        </label>

        <div class="repertoire-form__field">
          <span class="repertoire-form__field-label">Tipo do ministério</span>
          <AppSelectableCard
            :model-value="form.isMusicMinistry"
            input-id="ministry-is-music"
            title="Ministério da música"
            description="Marque para usar este ministério nas escalas específicas de música. Só pode haver um cadastrado."
            @update:model-value="handleCreateMusicMinistryChange"
          >
            <template #icon>
              <MusicIcon :size="20" />
            </template>
          </AppSelectableCard>
        </div>
      </form>
    </AppFormModal>

    <AppFormModal
      v-model="editModalVisible"
      title="Editar ministério"
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
            id="ministry-edit-name"
            v-model="editForm.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Música"
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
            id="ministry-edit-description"
            v-model="editForm.description"
            class="field-control"
            rows="3"
            :maxlength="descriptionMaxLength"
            placeholder="Descrição opcional do ministério"
            aria-describedby="ministry-edit-description-counter"
          />
          <span
            id="ministry-edit-description-counter"
            class="field-counter"
            aria-live="polite"
          >
            {{ editForm.description.length }}/{{ descriptionMaxLength }}
          </span>
        </label>

        <label>
          Responsável
          <select
            id="ministry-edit-manager"
            v-model="editForm.personIdManager"
            class="field-control"
          >
            <option :value="null">
              Nenhum
            </option>
            <option
              v-for="person in people"
              :key="person.id"
              :value="person.id"
            >
              {{ formatPersonLabel(person) }}
            </option>
          </select>
        </label>

        <div class="repertoire-form__field">
          <span class="repertoire-form__field-label">Tipo do ministério</span>
          <AppSelectableCard
            :model-value="editForm.isMusicMinistry"
            input-id="ministry-edit-is-music"
            title="Ministério da música"
            description="Marque para usar este ministério nas escalas específicas de música. Só pode haver um cadastrado."
            @update:model-value="handleEditMusicMinistryChange"
          >
            <template #icon>
              <MusicIcon :size="20" />
            </template>
          </AppSelectableCard>
        </div>
      </form>
    </AppFormModal>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  ChurchIcon,
  MusicIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  SearchIcon,
  Trash2Icon
} from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import AppListSkeleton from '@/components/feedback/AppListSkeleton.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import AppSelectableCard from '@/components/form/AppSelectableCard.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import { ministryService } from '@/services/ministryService'
import { personService } from '@/services/personService'
import { toastService } from '@/services/toastService'
import { useAuthStore } from '@/stores/authStore'
import type {
  CreateMinistryRequest,
  Ministry,
  PersonSummary,
  UpdateMinistryRequest
} from '@/types/people'
import { Permissions } from '@/utils/permissions'

const MINISTRY_NAME_MAX_LENGTH = 120
const MINISTRY_DESCRIPTION_MAX_LENGTH = 500

type MinistryForm = {
  name: string
  description: string
  personIdManager: number | null
  isMusicMinistry: boolean
}

export default defineComponent({
  name: 'MinistryView',
  components: {
    AppFormModal,
    AppListSkeleton,
    AppSelectableCard,
    AppTooltip,
    ChurchIcon,
    MusicIcon,
    PencilIcon,
    PlusIcon,
    PowerIcon,
    SearchIcon,
    Trash2Icon
  },
  data() {
    return {
      form: {
        name: '',
        description: '',
        personIdManager: null,
        isMusicMinistry: false
      } as MinistryForm,
      editForm: {
        name: '',
        description: '',
        personIdManager: null,
        isMusicMinistry: false
      } as MinistryForm,
      editingItemId: null as number | null,
      createModalVisible: false,
      createLoading: false,
      editModalVisible: false,
      editLoading: false,
      editNameError: '',
      nameMaxLength: MINISTRY_NAME_MAX_LENGTH,
      descriptionMaxLength: MINISTRY_DESCRIPTION_MAX_LENGTH,
      items: [] as Ministry[],
      people: [] as PersonSummary[],
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
    canManageMinistries(): boolean {
      return this.authStore.hasPermission(Permissions.MinistriesManage)
    },
    nameFieldDescribedBy(): string {
      return this.nameError
        ? 'ministry-name-counter ministry-name-error'
        : 'ministry-name-counter'
    },
    normalizedSearchQuery(): string {
      return this.searchQuery.trim().toLocaleLowerCase('pt-BR')
    },
    filteredItems(): Ministry[] {
      if (!this.normalizedSearchQuery) {
        return this.items
      }

      return this.items.filter((item) => {
        const name = item.name.toLocaleLowerCase('pt-BR')
        const description = (item.description ?? '').toLocaleLowerCase('pt-BR')
        const manager = (item.managerPersonName ?? '').toLocaleLowerCase('pt-BR')

        return name.includes(this.normalizedSearchQuery)
          || description.includes(this.normalizedSearchQuery)
          || manager.includes(this.normalizedSearchQuery)
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
    void this.loadPeople()
  },
  methods: {
    async loadItems(): Promise<void> {
      this.listLoading = true

      try {
        const response = await ministryService.list()
        this.items = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar os ministérios.'
        )
      } finally {
        this.listLoading = false
      }
    },

    async loadPeople(): Promise<void> {
      try {
        const response = await personService.listForSelection()
        this.people = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar as pessoas.'
        )
      }
    },

    formatPersonLabel(person: PersonSummary): string {
      if (person.preferredName) {
        return `${person.fullName} (${person.preferredName})`
      }

      return person.fullName
    },

    getItemDescription(item: Ministry): string {
      const parts: string[] = []

      if (item.description) {
        parts.push(item.description)
      }

      if (item.managerPersonName) {
        parts.push(`Responsável: ${item.managerPersonName}`)
      }

      return parts.join(' · ')
    },

    findExistingMusicMinistry(excludeId: number | null = null): Ministry | undefined {
      return this.items.find(
        (item) => item.isMusicMinistry && (excludeId === null || item.id !== excludeId)
      )
    },

    trySetMusicMinistry(
      value: boolean,
      excludeId: number | null,
      apply: (nextValue: boolean) => void
    ): void {
      if (!value) {
        apply(false)
        return
      }

      const existing = this.findExistingMusicMinistry(excludeId)

      if (existing) {
        toastService.warning(
          `Já existe um ministério da música cadastrado ("${existing.name}").`
        )
        apply(false)
        return
      }

      apply(true)
    },

    handleCreateMusicMinistryChange(value: boolean): void {
      this.trySetMusicMinistry(value, null, (nextValue) => {
        this.form.isMusicMinistry = nextValue
      })
    },

    handleEditMusicMinistryChange(value: boolean): void {
      this.trySetMusicMinistry(value, this.editingItemId, (nextValue) => {
        this.editForm.isMusicMinistry = nextValue
      })
    },

    async handleCreateSubmit(): Promise<void> {
      if (!this.canManageMinistries) {
        return
      }

      const trimmedName = this.form.name.trim()

      if (!trimmedName) {
        this.nameError = 'O nome é obrigatório.'
        return
      }

      this.createLoading = true

      const payload: CreateMinistryRequest = {
        name: trimmedName,
        description: this.form.description.trim() || null,
        personIdManager: this.form.personIdManager,
        isMusicMinistry: this.form.isMusicMinistry
      }

      try {
        const response = await ministryService.create(payload)
        toastService.success(response.message)
        this.closeCreateModal()
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao cadastrar o ministério.'
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

    openEditModal(item: Ministry): void {
      this.editingItemId = item.id
      this.editForm = {
        name: item.name,
        description: item.description ?? '',
        personIdManager: item.personIdManager,
        isMusicMinistry: item.isMusicMinistry
      }
      this.editNameError = ''
      this.editModalVisible = true
    },

    closeEditModal(): void {
      this.editModalVisible = false
      this.editingItemId = null
      this.editForm = {
        name: '',
        description: '',
        personIdManager: null,
        isMusicMinistry: false
      }
      this.editNameError = ''
    },

    clearEditNameError(): void {
      if (this.editNameError) {
        this.editNameError = ''
      }
    },

    async handleEditSubmit(): Promise<void> {
      if (!this.canManageMinistries || this.editingItemId === null) {
        return
      }

      const trimmedName = this.editForm.name.trim()

      if (!trimmedName) {
        this.editNameError = 'O nome é obrigatório.'
        return
      }

      const editingItem = this.items.find((item) => item.id === this.editingItemId)

      if (
        editingItem
        && !editingItem.isActive
        && this.editForm.personIdManager !== null
        && this.editForm.personIdManager !== editingItem.personIdManager
      ) {
        toastService.warning(
          'Não é possível associar um responsável a um ministério desativado.'
        )
        return
      }

      this.editLoading = true

      const payload: UpdateMinistryRequest = {
        name: trimmedName,
        description: this.editForm.description.trim() || null,
        personIdManager: this.editForm.personIdManager,
        isMusicMinistry: this.editForm.isMusicMinistry
      }

      try {
        const response = await ministryService.update(this.editingItemId, payload)

        toastService.success(response.message)
        this.closeEditModal()
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao atualizar o ministério.'
        )
      } finally {
        this.editLoading = false
      }
    },

    async handleToggleActive(item: Ministry): Promise<void> {
      if (!this.canManageMinistries) {
        return
      }

      if (item.isActive) {
        const confirmed = await confirmDialogService.confirm({
          title: 'Desativar ministério',
          message: `Deseja desativar o ministério "${item.name}"? Essa ação pode ser revertida depois, reativando o ministério.`,
          confirmLabel: 'Desativar',
          cancelLabel: 'Cancelar',
          tone: 'danger'
        })

        if (!confirmed) {
          return
        }
      }

      this.actionLoadingId = item.id

      try {
        const response = await ministryService.toggleActive(item.id)
        const updatedItem = response.payload

        if (updatedItem) {
          this.items = this.items.map((currentItem) =>
            currentItem.id === item.id ? updatedItem : currentItem
          )
          this.sortItemsAlphabetically()
        }

        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao alterar o status do ministério.'
        )
      } finally {
        this.actionLoadingId = null
      }
    },

    async handleDelete(item: Ministry): Promise<void> {
      if (!this.canManageMinistries || item.linkedPersonCount > 0) {
        return
      }

      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir ministério',
        message: `Deseja excluir o ministério "${item.name}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.actionLoadingId = item.id

      try {
        const response = await ministryService.remove(item.id)
        this.items = this.items.filter((currentItem) => currentItem.id !== item.id)
        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir o ministério.'
        )
      } finally {
        this.actionLoadingId = null
      }
    },

    resetForm(): void {
      this.form = {
        name: '',
        description: '',
        personIdManager: null,
        isMusicMinistry: false
      }
      this.nameError = ''
    }
  }
})
</script>
