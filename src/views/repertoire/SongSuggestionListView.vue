<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <LightbulbIcon :size="20" />
          </span>
          <h1>Sugestões de música</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Envie sugestões de músicas para o repertório e acompanhe o retorno da equipe.
        </p>
      </div>

      <button
        v-if="canManageSuggestions"
        type="button"
        class="repertoire-button"
        @click="openCreateModal"
      >
        <PlusIcon :size="16" aria-hidden="true" />
        Nova sugestão
      </button>
    </header>

    <section class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Minhas sugestões</h2>
        <span class="repertoire-badge">{{ listCountLabel }}</span>
      </div>

      <AppTableSkeleton
        v-if="listLoading"
        show-search
        :columns="5"
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
            id="song-suggestion-search"
            v-model="searchQuery"
            type="search"
            class="field-control repertoire-list-search__input"
            placeholder="Buscar por música, URL ou observações..."
            aria-label="Buscar sugestões"
          >
        </div>

        <p v-if="items.length === 0" class="description">
          Você ainda não enviou sugestões.
        </p>

        <p v-else-if="filteredItems.length === 0" class="description">
          Nenhuma sugestão encontrada para a busca.
        </p>

        <div v-else class="repertoire-table-wrapper repertoire-table-wrapper--fit">
          <table class="repertoire-table repertoire-table--suggestions">
            <colgroup>
              <col class="repertoire-table__col-icon">
              <col class="repertoire-table__col-music">
              <col class="repertoire-table__col-response">
              <col class="repertoire-table__col-suggestion-status">
              <col class="repertoire-table__col-actions">
            </colgroup>
            <thead>
              <tr>
                <th class="repertoire-table__col-icon">
                  Referência
                </th>
                <th>Música</th>
                <th>Resposta do admin</th>
                <th>Status</th>
                <th class="repertoire-table__col-actions" aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredItems" :key="item.id">
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
                    class="repertoire-table__meta"
                    :class="{ 'repertoire-table__meta--empty': !item.notes }"
                  >
                    {{ item.notes || 'Sem observações' }}
                  </span>
                </td>
                <td>
                  <span
                    class="repertoire-table__meta"
                    :class="{ 'repertoire-table__meta--empty': !item.adminResponse }"
                  >
                    {{ item.adminResponse || 'Aguardando revisão' }}
                  </span>
                </td>
                <td>
                  <span
                    class="repertoire-status repertoire-status--compact"
                    :class="item.isReviewed ? 'repertoire-status--reviewed' : 'repertoire-status--pending'"
                  >
                    {{ item.isReviewed ? 'Revisada' : 'Pendente' }}
                  </span>
                </td>
                <td class="repertoire-table__cell-actions">
                  <div v-if="canManageSuggestions" class="repertoire-table__actions">
                    <AppTooltip
                      :text="item.isReviewed
                        ? 'Não é possível editar uma sugestão revisada'
                        : 'Editar sugestão'"
                    >
                      <button
                        type="button"
                        class="sortable-list__action"
                        :disabled="actionLoadingId === item.id || item.isReviewed"
                        :aria-label="item.isReviewed
                          ? 'Edição indisponível: sugestão revisada'
                          : 'Editar sugestão'"
                        @click="openEditModal(item)"
                      >
                        <PencilIcon :size="16" aria-hidden="true" />
                      </button>
                    </AppTooltip>
                    <AppTooltip
                      :text="item.isReviewed
                        ? 'Não é possível excluir uma sugestão revisada'
                        : 'Excluir sugestão'"
                    >
                      <button
                        type="button"
                        class="sortable-list__action sortable-list__action--danger"
                        :disabled="actionLoadingId === item.id || item.isReviewed"
                        :aria-label="item.isReviewed
                          ? 'Exclusão indisponível: sugestão revisada'
                          : 'Excluir sugestão'"
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
      </template>
    </section>

    <AppFormModal
      v-model="createModalVisible"
      title="Nova sugestão"
      confirm-label="Enviar sugestão"
      :loading="loading"
      :scrollable-body="true"
      @confirm="handleSubmit"
      @cancel="closeCreateModal"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleSubmit">
        <label>
          Nome da música *
          <input
            id="song-suggestion-name"
            v-model="form.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Grande é o Senhor"
            :class="{ 'field-control--invalid': nameError }"
            :aria-invalid="nameError ? 'true' : 'false'"
            @input="clearNameError"
          >
          <span class="field-counter" aria-live="polite">
            {{ form.name.length }}/{{ nameMaxLength }}
          </span>
          <span
            v-if="nameError"
            class="field-error"
            role="alert"
          >
            {{ nameError }}
          </span>
        </label>

        <label>
          URL de referência
          <input
            id="song-suggestion-url"
            v-model="form.url"
            type="text"
            :maxlength="urlMaxLength"
            placeholder="Ex.: www.youtube.com/watch?v=..."
          >
          <span class="field-counter" aria-live="polite">
            {{ form.url.length }}/{{ urlMaxLength }}
          </span>
        </label>

        <label>
          Observações
          <textarea
            id="song-suggestion-notes"
            v-model="form.notes"
            rows="4"
            :maxlength="notesMaxLength"
            placeholder="Informações adicionais sobre a sugestão"
          />
          <span class="field-counter" aria-live="polite">
            {{ form.notes.length }}/{{ notesMaxLength }}
          </span>
        </label>
      </form>
    </AppFormModal>

    <AppFormModal
      v-model="editModalVisible"
      title="Editar sugestão"
      confirm-label="Salvar"
      :loading="editLoading"
      :scrollable-body="true"
      @confirm="handleEditSubmit"
      @cancel="closeEditModal"
    >
      <form v-unsaved-changes class="repertoire-form" novalidate @submit.prevent="handleEditSubmit">
        <label>
          Nome da música *
          <input
            id="song-suggestion-edit-name"
            v-model="editForm.name"
            type="text"
            :maxlength="nameMaxLength"
            placeholder="Ex.: Grande é o Senhor"
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
          URL de referência
          <input
            id="song-suggestion-edit-url"
            v-model="editForm.url"
            type="text"
            :maxlength="urlMaxLength"
            placeholder="Ex.: www.youtube.com/watch?v=..."
          >
          <span class="field-counter" aria-live="polite">
            {{ editForm.url.length }}/{{ urlMaxLength }}
          </span>
        </label>

        <label>
          Observações
          <textarea
            id="song-suggestion-edit-notes"
            v-model="editForm.notes"
            rows="4"
            :maxlength="notesMaxLength"
            placeholder="Informações adicionais sobre a sugestão"
          />
          <span class="field-counter" aria-live="polite">
            {{ editForm.notes.length }}/{{ notesMaxLength }}
          </span>
        </label>
      </form>
    </AppFormModal>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ExternalLinkIcon, LightbulbIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import AppTableSkeleton from '@/components/feedback/AppTableSkeleton.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import { songSuggestionService } from '@/services/songSuggestionService'
import { toastService } from '@/services/toastService'
import type {
  CreateSongSuggestionRequest,
  SongSuggestionListItem,
  UpdateSongSuggestionRequest
} from '@/types/songSuggestion'

const SONG_SUGGESTION_NAME_MAX_LENGTH = 200
const SONG_SUGGESTION_URL_MAX_LENGTH = 1000
const SONG_SUGGESTION_NOTES_MAX_LENGTH = 500

type SongSuggestionForm = {
  name: string
  url: string
  notes: string
}

export default defineComponent({
  name: 'SongSuggestionListView',
  components: {
    AppFormModal,
    AppTableSkeleton,
    AppTooltip,
    ExternalLinkIcon,
    LightbulbIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon
  },
  data() {
    return {
      form: {
        name: '',
        url: '',
        notes: ''
      } as SongSuggestionForm,
      editForm: {
        name: '',
        url: '',
        notes: ''
      } as SongSuggestionForm,
      editingItemId: null as number | null,
      createModalVisible: false,
      editModalVisible: false,
      editLoading: false,
      editNameError: '',
      nameMaxLength: SONG_SUGGESTION_NAME_MAX_LENGTH,
      urlMaxLength: SONG_SUGGESTION_URL_MAX_LENGTH,
      notesMaxLength: SONG_SUGGESTION_NOTES_MAX_LENGTH,
      items: [] as SongSuggestionListItem[],
      searchQuery: '',
      loading: false,
      listLoading: false,
      actionLoadingId: null as number | null,
      nameError: ''
    }
  },
  computed: {
    canManageSuggestions(): boolean {
      return true
    },
    normalizedSearchQuery(): string {
      return this.searchQuery.trim().toLocaleLowerCase('pt-BR')
    },
    filteredItems(): SongSuggestionListItem[] {
      if (!this.normalizedSearchQuery) {
        return this.items
      }

      return this.items.filter((item) => {
        const name = item.name.toLocaleLowerCase('pt-BR')
        const url = (item.url ?? '').toLocaleLowerCase('pt-BR')
        const notes = (item.notes ?? '').toLocaleLowerCase('pt-BR')
        const adminResponse = (item.adminResponse ?? '').toLocaleLowerCase('pt-BR')

        return name.includes(this.normalizedSearchQuery)
          || url.includes(this.normalizedSearchQuery)
          || notes.includes(this.normalizedSearchQuery)
          || adminResponse.includes(this.normalizedSearchQuery)
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
        const response = await songSuggestionService.listMine()
        this.items = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar suas sugestões.'
        )
      } finally {
        this.listLoading = false
      }
    },

    async handleSubmit(): Promise<void> {
      if (!this.canManageSuggestions) {
        return
      }

      const trimmedName = this.form.name.trim()

      if (!trimmedName) {
        this.nameError = 'O nome da música é obrigatório.'
        return
      }

      this.loading = true

      const payload: CreateSongSuggestionRequest = {
        name: trimmedName,
        url: this.form.url.trim() || null,
        notes: this.form.notes.trim() || null
      }

      try {
        const response = await songSuggestionService.create(payload)
        toastService.success(response.message)
        this.closeCreateModal()
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao enviar a sugestão.'
        )
      } finally {
        this.loading = false
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

    openEditModal(item: SongSuggestionListItem): void {
      if (!this.canManageSuggestions || item.isReviewed) {
        return
      }

      this.editingItemId = item.id
      this.editForm = {
        name: item.name,
        url: item.url ?? '',
        notes: item.notes ?? ''
      }
      this.editNameError = ''
      this.editModalVisible = true
    },

    closeEditModal(): void {
      this.editModalVisible = false
      this.editingItemId = null
      this.editForm = {
        name: '',
        url: '',
        notes: ''
      }
      this.editNameError = ''
    },

    clearEditNameError(): void {
      if (this.editNameError) {
        this.editNameError = ''
      }
    },

    async handleEditSubmit(): Promise<void> {
      if (!this.canManageSuggestions || this.editingItemId === null) {
        return
      }

      const trimmedName = this.editForm.name.trim()

      if (!trimmedName) {
        this.editNameError = 'O nome da música é obrigatório.'
        return
      }

      this.editLoading = true
      this.actionLoadingId = this.editingItemId

      const payload: UpdateSongSuggestionRequest = {
        name: trimmedName,
        url: this.editForm.url.trim() || null,
        notes: this.editForm.notes.trim() || null
      }

      try {
        const response = await songSuggestionService.update(this.editingItemId, payload)
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
          error instanceof Error ? error.message : 'Erro ao atualizar a sugestão.'
        )
      } finally {
        this.editLoading = false
        this.actionLoadingId = null
      }
    },

    async handleDelete(item: SongSuggestionListItem): Promise<void> {
      if (!this.canManageSuggestions || item.isReviewed) {
        return
      }

      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir sugestão',
        message: `Deseja excluir a sugestão "${item.name}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.actionLoadingId = item.id

      try {
        const response = await songSuggestionService.remove(item.id)
        this.items = this.items.filter((currentItem) => currentItem.id !== item.id)
        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir a sugestão.'
        )
      } finally {
        this.actionLoadingId = null
      }
    },

    resetForm(): void {
      this.form = {
        name: '',
        url: '',
        notes: ''
      }
      this.nameError = ''
    }
  }
})
</script>
