<template>
  <section class="repertoire-page">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <FolderIcon :size="20" />
          </span>
          <h1>Pastas do repertório</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Organize músicas em pastas públicas ou privadas.
        </p>
      </div>

      <button
        v-if="!createFormVisible && canCreateGroup"
        type="button"
        class="repertoire-button"
        @click="openCreateForm"
      >
        <PlusIcon :size="16" aria-hidden="true" />
        Nova pasta
      </button>

      <button
        v-else
        type="button"
        class="repertoire-link-button repertoire-link-button--ghost repertoire-link-button--with-icon"
        @click="requestCloseCreateForm"
      >
        <ArrowLeftIcon :size="16" aria-hidden="true" />
        Voltar para pastas
      </button>
    </header>

    <Transition name="repertoire-panel-reveal">
      <section v-if="createFormVisible" class="repertoire-card repertoire-card--create">
        <h2>Cadastro</h2>

        <form
          ref="createForm"
          v-unsaved-changes
          class="repertoire-form"
          novalidate
          @submit.prevent="handleSubmit"
        >
          <label>
            Nome *
            <input
              id="repertoire-group-name"
              v-model="form.name"
              type="text"
              class="field-control"
              :maxlength="nameMaxLength"
              placeholder="Ex.: Louvor congregacional"
              :class="{ 'field-control--invalid': nameError }"
              :aria-invalid="nameError ? 'true' : 'false'"
              :aria-describedby="nameFieldDescribedBy"
              @input="clearNameError"
            >
            <span
              id="repertoire-group-name-counter"
              class="field-counter"
              aria-live="polite"
            >
              {{ form.name.length }}/{{ nameMaxLength }}
            </span>
            <span
              v-if="nameError"
              id="repertoire-group-name-error"
              class="field-error"
              role="alert"
            >
              {{ nameError }}
            </span>
          </label>

          <label>
            Descrição
            <textarea
              id="repertoire-group-description"
              v-model="form.description"
              rows="3"
              class="field-control"
              :maxlength="descriptionMaxLength"
              placeholder="Descrição opcional da pasta"
              aria-describedby="repertoire-group-description-counter"
            />
            <span
              id="repertoire-group-description-counter"
              class="field-counter"
              aria-live="polite"
            >
              {{ form.description.length }}/{{ descriptionMaxLength }}
            </span>
          </label>

          <fieldset class="repertoire-folder-visibility">
            <legend class="repertoire-folder-visibility__label">
              Visibilidade
            </legend>

            <div
              class="repertoire-folder-visibility__options"
              role="radiogroup"
              aria-label="Visibilidade da pasta"
            >
              <button
                type="button"
                data-unsaved-change
                class="repertoire-folder-visibility__option"
                :class="{ 'repertoire-folder-visibility__option--selected': form.isPublic }"
                role="radio"
                :aria-checked="form.isPublic ? 'true' : 'false'"
                @click="selectPublicVisibility"
              >
                <GlobeIcon :size="22" aria-hidden="true" />
                <span class="repertoire-folder-visibility__option-title">Pública</span>
                <span class="repertoire-folder-visibility__option-hint">
                  Visível para usuários logados no Bless App
                </span>
              </button>

              <button
                type="button"
                data-unsaved-change
                class="repertoire-folder-visibility__option"
                :class="{ 'repertoire-folder-visibility__option--selected': !form.isPublic }"
                role="radio"
                :aria-checked="!form.isPublic ? 'true' : 'false'"
                @click="selectPrivateVisibility"
              >
                <LockIcon :size="22" aria-hidden="true" />
                <span class="repertoire-folder-visibility__option-title">Privada</span>
                <span class="repertoire-folder-visibility__option-hint">
                  Apenas você pode ver esta pasta
                </span>
              </button>
            </div>
          </fieldset>

          <fieldset
            v-if="form.isPublic"
            class="repertoire-folder-access"
          >
            <legend class="repertoire-folder-access__label">
              Acesso à pasta pública
            </legend>

            <div
              class="repertoire-folder-access__options"
              role="radiogroup"
              aria-label="Acesso à pasta pública"
            >
              <button
                type="button"
                data-unsaved-change
                class="repertoire-folder-access__option"
                :class="{ 'repertoire-folder-access__option--selected': !form.allowPublicLinkAccess }"
                role="radio"
                :aria-checked="!form.allowPublicLinkAccess ? 'true' : 'false'"
                @click="form.allowPublicLinkAccess = false"
              >
                <UsersIcon :size="20" aria-hidden="true" />
                <span class="repertoire-folder-access__option-title">Usuários logados</span>
                <span class="repertoire-folder-access__option-hint">
                  Somente quem entrou no sistema
                </span>
              </button>

              <button
                type="button"
                data-unsaved-change
                class="repertoire-folder-access__option"
                :class="{ 'repertoire-folder-access__option--selected': form.allowPublicLinkAccess }"
                role="radio"
                :aria-checked="form.allowPublicLinkAccess ? 'true' : 'false'"
                @click="form.allowPublicLinkAccess = true"
              >
                <Link2Icon :size="20" aria-hidden="true" />
                <span class="repertoire-folder-access__option-title">Link externo</span>
                <span class="repertoire-folder-access__option-hint">
                  Qualquer pessoa com o link, sem login
                </span>
              </button>
            </div>
          </fieldset>

          <div class="repertoire-form__actions">
            <button
              type="button"
              class="field-button field-button--ghost"
              :disabled="loading"
              @click="requestCloseCreateForm"
            >
              Cancelar
            </button>
            <button type="submit" class="repertoire-button" :disabled="loading">
              {{ loading ? 'Salvando...' : 'Cadastrar' }}
            </button>
          </div>
        </form>
      </section>
    </Transition>

    <section v-if="!createFormVisible" class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Pastas cadastradas</h2>
        <span class="repertoire-badge">{{ listCountLabel }}</span>
      </div>

      <div
        v-if="listLoading"
        class="repertoire-folder-grid repertoire-folder-grid--skeleton"
        aria-hidden="true"
      >
        <div
          v-for="index in 6"
          :key="index"
          class="repertoire-folder-card repertoire-folder-card--skeleton"
        >
          <span class="app-skeleton app-skeleton--action" />
          <span class="app-skeleton app-skeleton--title" />
          <span class="app-skeleton app-skeleton--description" />
        </div>
      </div>

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
            id="repertoire-group-search"
            v-model="searchQuery"
            type="search"
            class="field-control repertoire-list-search__input"
            placeholder="Buscar por nome ou descrição..."
            aria-label="Buscar pastas"
          >
        </div>

        <p v-if="items.length === 0" class="description">
          Nenhuma pasta cadastrada.
        </p>

        <p v-else-if="filteredItems.length === 0" class="description">
          Nenhuma pasta encontrada para a busca.
        </p>

        <div v-else class="repertoire-folder-grid">
          <AppTooltip
            v-for="item in filteredItems"
            :key="item.id"
            :text="shouldShowDescriptionTooltip(item) ? (item.description ?? '') : ''"
            position="top"
          >
            <RouterLink
              class="repertoire-folder-card repertoire-folder-card--link"
              :class="{
                'repertoire-folder-card--public': item.isPublic,
                'repertoire-folder-card--private': !item.isPublic
              }"
              :to="{ name: 'repertoire-group-details', params: { id: item.id } }"
            >
              <div class="repertoire-folder-card__header">
                <span class="repertoire-folder-card__icon" aria-hidden="true">
                  <FolderIcon :size="28" />
                </span>
                <AppTooltip
                  :text="getVisibilityTooltip(item)"
                  position="top"
                >
                  <span
                    class="repertoire-folder-card__visibility"
                    :class="item.isPublic
                      ? 'repertoire-folder-card__visibility--public'
                      : 'repertoire-folder-card__visibility--private'"
                  >
                    <GlobeIcon
                      v-if="item.isPublic"
                      :size="12"
                      aria-hidden="true"
                    />
                    <LockIcon
                      v-else
                      :size="12"
                      aria-hidden="true"
                    />
                    {{ item.isPublic ? (item.allowPublicLinkAccess ? 'Link externo' : 'Pública') : 'Privada' }}
                  </span>
                </AppTooltip>
              </div>

              <div class="repertoire-folder-card__content">
                <h3 class="repertoire-folder-card__name">
                  {{ item.name }}
                </h3>

                <p
                  class="repertoire-folder-card__description"
                  :class="{ 'repertoire-folder-card__description--empty': !item.description }"
                >
                  {{ item.description || 'Sem descrição' }}
                </p>
              </div>

              <div class="repertoire-folder-card__actions">
                <AppTooltip
                  v-if="canCopyShareLink(item)"
                  text="Copiar link de compartilhamento"
                >
                  <button
                    type="button"
                    class="repertoire-folder-card__copy-link"
                    :disabled="actionLoadingId === item.id"
                    aria-label="Copiar link de compartilhamento"
                    @click.prevent.stop="copyShareLink(item)"
                  >
                    <CopyIcon :size="14" aria-hidden="true" />
                    Copiar link
                  </button>
                </AppTooltip>

                <AppTooltip
                  v-if="canManageGroup(item)"
                  text="Excluir pasta"
                >
                  <button
                    type="button"
                    class="repertoire-folder-card__delete"
                    :disabled="actionLoadingId === item.id"
                    aria-label="Excluir pasta"
                    @click.prevent.stop="handleDelete(item)"
                  >
                    <Trash2Icon :size="16" aria-hidden="true" />
                  </button>
                </AppTooltip>
              </div>
            </RouterLink>
          </AppTooltip>
        </div>
      </template>
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  ArrowLeftIcon,
  CopyIcon,
  FolderIcon,
  GlobeIcon,
  Link2Icon,
  LockIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UsersIcon
} from '@lucide/vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { RouterLink } from 'vue-router'
import { confirmDialogService } from '@/services/confirmDialogService'
import { promptUnsavedChanges } from '@/services/unsavedChangesPrompt'
import {
  buildPublicShareUrl,
  repertoireGroupService
} from '@/services/repertoireGroupService'
import { toastService } from '@/services/toastService'
import { useAuthStore } from '@/stores/authStore'
import { unsavedChangesStore } from '@/stores/unsavedChangesStore'
import type { CreateRepertoireGroupRequest, RepertoireGroup } from '@/types/repertoireGroup'
import { Permissions } from '@/utils/permissions'

const REPERTOIRE_GROUP_NAME_MAX_LENGTH = 120
const REPERTOIRE_GROUP_DESCRIPTION_MAX_LENGTH = 2000
const DESCRIPTION_TOOLTIP_THRESHOLD = 72

type RepertoireGroupForm = {
  name: string
  description: string
  isPublic: boolean
  allowPublicLinkAccess: boolean
}

export default defineComponent({
  name: 'RepertoireGroupView',
  components: {
    AppTooltip,
    ArrowLeftIcon,
    CopyIcon,
    FolderIcon,
    GlobeIcon,
    Link2Icon,
    LockIcon,
    PlusIcon,
    RouterLink,
    SearchIcon,
    Trash2Icon,
    UsersIcon
  },
  data() {
    return {
      form: {
        name: '',
        description: '',
        isPublic: false,
        allowPublicLinkAccess: false
      } as RepertoireGroupForm,
      nameMaxLength: REPERTOIRE_GROUP_NAME_MAX_LENGTH,
      descriptionMaxLength: REPERTOIRE_GROUP_DESCRIPTION_MAX_LENGTH,
      items: [] as RepertoireGroup[],
      searchQuery: '',
      createFormVisible: false,
      loading: false,
      listLoading: false,
      actionLoadingId: null as number | null,
      nameError: ''
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    canManageAllGroups(): boolean {
      return this.authStore.hasPermission(Permissions.RepertoireGroupsManage)
    },
    canManageOwnGroups(): boolean {
      return this.authStore.hasPermission(Permissions.RepertoireGroupsManageOwn)
    },
    canCreateGroup(): boolean {
      return this.canManageAllGroups || this.canManageOwnGroups
    },
    nameFieldDescribedBy(): string {
      return this.nameError
        ? 'repertoire-group-name-counter repertoire-group-name-error'
        : 'repertoire-group-name-counter'
    },
    normalizedSearchQuery(): string {
      return this.searchQuery.trim().toLocaleLowerCase('pt-BR')
    },
    filteredItems(): RepertoireGroup[] {
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
    shouldShowDescriptionTooltip(item: RepertoireGroup): boolean {
      return Boolean(item.description && item.description.length > DESCRIPTION_TOOLTIP_THRESHOLD)
    },

    getVisibilityTooltip(item: RepertoireGroup): string {
      if (!item.isPublic) {
        return 'Apenas você pode ver esta pasta.'
      }

      if (item.allowPublicLinkAccess) {
        return 'Qualquer pessoa com o link pode acessar, sem precisar entrar no sistema.'
      }

      return 'Visível para todos os usuários logados no Bless App.'
    },

    canManageGroup(item: RepertoireGroup): boolean {
      return this.canManageAllGroups
        || (this.canManageOwnGroups && item.isOwnedByCurrentUser)
    },

    canCopyShareLink(item: RepertoireGroup): boolean {
      return Boolean(
        this.canManageGroup(item)
        && item.isPublic
        && item.allowPublicLinkAccess
      )
    },

    async copyShareLink(item: RepertoireGroup): Promise<void> {
      if (!this.canCopyShareLink(item)) {
        return
      }

      this.actionLoadingId = item.id

      try {
        let shareHash = item.publicShareHash

        if (!shareHash) {
          const response = await repertoireGroupService.generateShareLink(item.id)
          shareHash = response.payload?.shareHash ?? null

          if (shareHash) {
            item.hasPublicShareLink = true
            item.publicShareHash = shareHash
          }
        }

        if (!shareHash) {
          throw new Error('Não foi possível obter o link de compartilhamento.')
        }

        await navigator.clipboard.writeText(buildPublicShareUrl(shareHash))
        toastService.success('Link copiado para a área de transferência.')
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Não foi possível copiar o link.'
        )
      } finally {
        this.actionLoadingId = null
      }
    },

    async handleDelete(item: RepertoireGroup): Promise<void> {
      if (!this.canManageGroup(item)) {
        return
      }

      const confirmed = await confirmDialogService.confirm({
        title: 'Excluir pasta',
        message: `Deseja excluir a pasta "${item.name}"? Esta ação não poderá ser desfeita.`,
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.actionLoadingId = item.id

      try {
        const response = await repertoireGroupService.remove(item.id)
        toastService.success(response.message)
        this.items = this.items.filter((currentItem) => currentItem.id !== item.id)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao excluir a pasta.'
        )
      } finally {
        this.actionLoadingId = null
      }
    },

    async loadItems(): Promise<void> {
      this.listLoading = true

      try {
        const response = await repertoireGroupService.list()
        this.items = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar as pastas.'
        )
      } finally {
        this.listLoading = false
      }
    },

    async handleSubmit(): Promise<void> {
      const trimmedName = this.form.name.trim()

      if (!trimmedName) {
        this.nameError = 'O nome é obrigatório.'
        return
      }

      this.loading = true

      const payload: CreateRepertoireGroupRequest = {
        name: trimmedName,
        description: this.form.description.trim() || null,
        isPublic: this.form.isPublic,
        allowPublicLinkAccess: this.form.allowPublicLinkAccess
      }

      try {
        const response = await repertoireGroupService.create(payload)
        toastService.success(response.message)
        this.closeCreateForm()
        await this.loadItems()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao cadastrar a pasta.'
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

    resetForm(): void {
      this.form = {
        name: '',
        description: '',
        isPublic: false,
        allowPublicLinkAccess: false
      }
      this.nameError = ''
    },

    selectPrivateVisibility(): void {
      this.form.isPublic = false
      this.form.allowPublicLinkAccess = false
    },

    selectPublicVisibility(): void {
      this.form.isPublic = true
    },

    openCreateForm(): void {
      this.resetForm()
      this.createFormVisible = true
    },

    async requestCloseCreateForm(): Promise<void> {
      const form = this.$refs.createForm as HTMLFormElement | undefined
      const dirtySources = form ? unsavedChangesStore.getDirtySources(form) : []

      if (dirtySources.length === 0) {
        this.closeCreateForm()
        return
      }

      const choice = await promptUnsavedChanges()

      if (choice === 'confirm') {
        await unsavedChangesStore.save(dirtySources)
        return
      }

      if (choice === 'secondary') {
        unsavedChangesStore.discard(dirtySources)
        this.closeCreateForm()
      }
    },

    closeCreateForm(): void {
      this.createFormVisible = false
      this.resetForm()
    }
  }
})
</script>
