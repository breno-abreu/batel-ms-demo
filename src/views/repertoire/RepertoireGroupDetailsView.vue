<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <FolderIcon :size="20" />
          </span>
          <h1>{{ pageTitle }}</h1>
        </div>
        <p class="description repertoire-page__header-description">
          {{ pageDescription }}
        </p>
      </div>

      <div class="repertoire-page__header-actions">
        <button
          v-if="canEdit && group?.isPublic && group.allowPublicLinkAccess"
          type="button"
          class="repertoire-link-button repertoire-link-button--ghost repertoire-link-button--with-icon"
          :disabled="shareLinkLoading"
          @click="copyShareLink"
        >
          <CopyIcon :size="16" aria-hidden="true" />
          {{ shareLinkLoading ? 'Copiando...' : 'Copiar link' }}
        </button>

        <button
          type="button"
          class="repertoire-link-button repertoire-link-button--ghost repertoire-link-button--with-icon"
          :aria-expanded="detailsVisible ? 'true' : 'false'"
          aria-controls="repertoire-group-details-panel"
          @click="toggleDetailsVisible"
        >
          <ChevronDownIcon
            v-if="!detailsVisible"
            :size="16"
            aria-hidden="true"
          />
          <ChevronUpIcon
            v-else
            :size="16"
            aria-hidden="true"
          />
          {{ detailsVisible ? 'Ocultar detalhes' : 'Mostrar detalhes' }}
        </button>

        <RouterLink
          class="repertoire-link-button repertoire-link-button--ghost repertoire-link-button--with-icon"
          :to="{ name: 'repertoire-groups' }"
        >
          <ArrowLeftIcon :size="16" aria-hidden="true" />
          Voltar para pastas
        </RouterLink>
      </div>
    </header>

    <div
      v-if="pageLoading"
      class="repertoire-details-form repertoire-details-form--skeleton"
      aria-hidden="true"
    >
      <section class="repertoire-card">
        <span class="app-skeleton app-skeleton--title" />
        <span class="app-skeleton app-skeleton--description" />
        <span class="app-skeleton app-skeleton--description" />
      </section>
      <section class="repertoire-card">
        <span class="app-skeleton app-skeleton--title" />
        <span class="app-skeleton app-skeleton--description" />
      </section>
    </div>

    <template v-else-if="group">
      <Transition name="repertoire-panel-reveal">
        <section
          v-show="detailsVisible"
          id="repertoire-group-details-panel"
          class="repertoire-card"
        >
          <h2>Dados da pasta</h2>

        <form v-unsaved-changes
          v-if="canEdit"
          class="repertoire-form"
          novalidate
          @submit.prevent="handleSave"
        >
          <label>
            Nome *
            <input
              id="repertoire-group-edit-name"
              v-model="form.name"
              type="text"
              class="field-control"
              :maxlength="nameMaxLength"
              placeholder="Ex.: Louvor congregacional"
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
            Descrição
            <textarea
              id="repertoire-group-edit-description"
              v-model="form.description"
              rows="3"
              class="field-control"
              :maxlength="descriptionMaxLength"
              placeholder="Descrição opcional da pasta"
            />
            <span class="field-counter" aria-live="polite">
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

          <p
            v-if="form.allowPublicLinkAccess && !group.allowPublicLinkAccess"
            class="description repertoire-folder-access__hint"
          >
            Salve as alterações para habilitar a geração do link.
          </p>

          <div class="repertoire-form__actions">
            <button type="submit" class="repertoire-button" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Salvar alterações' }}
            </button>
          </div>
        </form>

        <div v-else class="repertoire-group-readonly">
          <div class="repertoire-group-readonly__row">
            <span class="repertoire-group-readonly__label">Nome</span>
            <span class="repertoire-group-readonly__value">{{ group.name }}</span>
          </div>
          <div class="repertoire-group-readonly__row">
            <span class="repertoire-group-readonly__label">Descrição</span>
            <span class="repertoire-group-readonly__value">
              {{ group.description || 'Sem descrição' }}
            </span>
          </div>
          <div class="repertoire-group-readonly__row">
            <span class="repertoire-group-readonly__label">Visibilidade</span>
            <span
              class="repertoire-folder-card__visibility"
              :class="group.isPublic
                ? 'repertoire-folder-card__visibility--public'
                : 'repertoire-folder-card__visibility--private'"
            >
              <GlobeIcon
                v-if="group.isPublic"
                :size="12"
                aria-hidden="true"
              />
              <LockIcon
                v-else
                :size="12"
                aria-hidden="true"
              />
              {{ group.isPublic ? 'Pública' : 'Privada' }}
            </span>
          </div>
          <div
            v-if="group.isPublic"
            class="repertoire-group-readonly__row"
          >
            <span class="repertoire-group-readonly__label">Acesso</span>
            <span class="repertoire-group-readonly__value">{{ accessLabel }}</span>
          </div>
        </div>
        </section>
      </Transition>

      <section class="repertoire-card">
        <div class="repertoire-card__title-row">
          <h2>Músicas na pasta</h2>
          <span class="repertoire-badge">{{ songsCountLabel }}</span>
        </div>

        <div
          v-if="canEdit"
          class="repertoire-group-details__toolbar"
        >
          <button
            type="button"
            class="repertoire-button"
            @click="addSongsModalVisible = true"
          >
            <PlusIcon :size="16" aria-hidden="true" />
            Incluir música
          </button>
        </div>

        <div
          v-if="songsLoading"
          class="repertoire-song-grid repertoire-song-grid--skeleton"
          aria-hidden="true"
        >
          <div
            v-for="index in 2"
            :key="index"
            class="repertoire-song-card repertoire-song-card--skeleton"
          >
            <span class="app-skeleton app-skeleton--title" />
            <span class="app-skeleton app-skeleton--description" />
          </div>
        </div>

        <template v-else>
          <p v-if="songs.length === 0" class="description">
            Nenhuma música incluída nesta pasta.
          </p>

          <div
            v-else
            class="repertoire-song-grid"
          >
            <RepertoireSongCard
              v-for="item in songs"
              :key="item.id"
              :item="item"
              :header-mode="canEdit ? 'group' : 'view'"
              :favorite-loading-id="favoriteLoadingId"
              :action-loading-id="actionLoadingId"
              :can-manage="canManageRepertoire"
              @toggle-favorite="toggleFavorite"
              @remove-from-group="handleRemoveFromGroup"
              @open-lyrics="openLyricsModal"
            />
          </div>
        </template>
      </section>
    </template>

    <RepertoireGroupAddSongsModal
      v-if="group"
      v-model="addSongsModalVisible"
      :group-id="group.id"
      :included-repertoire-ids="includedRepertoireIds"
      @added="handleSongAdded"
    />

    <AppFormModal
      v-model="lyricsModalVisible"
      title="Letra"
      confirm-label="Fechar"
      single-action
      @confirm="closeLyricsModal"
      @cancel="closeLyricsModal"
    >
      <div class="repertoire-song-lyrics">
        <p class="repertoire-song-lyrics__title">
          {{ lyricsItem?.songName }}
        </p>
        <pre class="repertoire-song-lyrics__content">{{ lyricsItem?.lyrics }}</pre>
      </div>
    </AppFormModal>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  FolderIcon,
  GlobeIcon,
  Link2Icon,
  LockIcon,
  PlusIcon,
  UsersIcon
} from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import RepertoireGroupAddSongsModal from '@/components/repertoire/RepertoireGroupAddSongsModal.vue'
import RepertoireSongCard from '@/components/repertoire/RepertoireSongCard.vue'
import { confirmDialogService } from '@/services/confirmDialogService'
import {
  buildPublicShareUrl,
  repertoireGroupService
} from '@/services/repertoireGroupService'
import { repertoireService } from '@/services/repertoireService'
import { toastService } from '@/services/toastService'
import { useAuthStore } from '@/stores/authStore'
import type { RepertoireListItem } from '@/types/repertoire'
import type { RepertoireGroup, UpdateRepertoireGroupRequest } from '@/types/repertoireGroup'
import { Permissions } from '@/utils/permissions'

const NAME_MAX_LENGTH = 120
const DESCRIPTION_MAX_LENGTH = 2000

type GroupForm = {
  name: string
  description: string
  isPublic: boolean
  allowPublicLinkAccess: boolean
}

export default defineComponent({
  name: 'RepertoireGroupDetailsView',
  components: {
    AppFormModal,
    ArrowLeftIcon,
    CopyIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    FolderIcon,
    GlobeIcon,
    Link2Icon,
    LockIcon,
    PlusIcon,
    UsersIcon,
    RepertoireGroupAddSongsModal,
    RepertoireSongCard,
    RouterLink
  },
  data() {
    return {
      group: null as RepertoireGroup | null,
      form: {
        name: '',
        description: '',
        isPublic: false,
        allowPublicLinkAccess: false
      } as GroupForm,
      songs: [] as RepertoireListItem[],
      nameMaxLength: NAME_MAX_LENGTH,
      descriptionMaxLength: DESCRIPTION_MAX_LENGTH,
      pageLoading: false,
      songsLoading: false,
      saving: false,
      nameError: '',
      favoriteLoadingId: null as number | null,
      actionLoadingId: null as number | null,
      addSongsModalVisible: false,
      lyricsModalVisible: false,
      lyricsItem: null as RepertoireListItem | null,
      detailsVisible: false,
      shareLinkLoading: false
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    canManageRepertoire(): boolean {
      return this.authStore.hasPermission(Permissions.RepertoireManage)
    },
    groupId(): number | null {
      const parsedId = Number(this.$route.params.id)
      return Number.isNaN(parsedId) ? null : parsedId
    },
    canEdit(): boolean {
      if (!this.group) {
        return false
      }

      return this.authStore.hasPermission(Permissions.RepertoireGroupsManage)
        || (
          this.authStore.hasPermission(Permissions.RepertoireGroupsManageOwn)
          && this.group.isOwnedByCurrentUser
        )
    },
    pageTitle(): string {
      return this.group?.name ?? 'Pasta do repertório'
    },
    pageDescription(): string {
      if (this.detailsVisible) {
        return this.canEdit
          ? 'Edite os dados da pasta e gerencie as músicas incluídas.'
          : 'Consulte os dados da pasta e as músicas incluídas.'
      }

      return 'Gerencie as músicas incluídas nesta pasta.'
    },
    songsCountLabel(): string {
      if (this.songsLoading) {
        return '—'
      }

      return String(this.songs.length)
    },
    includedRepertoireIds(): Set<number> {
      return new Set(this.songs.map((song) => song.id))
    },
    accessLabel(): string {
      if (!this.group?.isPublic) {
        return 'Privada'
      }

      if (this.group.allowPublicLinkAccess) {
        return 'Pública com link externo'
      }

      return 'Pública para usuários logados'
    }
  },
  watch: {
    '$route.params.id'() {
      void this.initializePage()
    }
  },
  mounted() {
    void this.initializePage()
  },
  methods: {
    toggleDetailsVisible(): void {
      this.detailsVisible = !this.detailsVisible
    },

    selectPrivateVisibility(): void {
      this.form.isPublic = false
      this.form.allowPublicLinkAccess = false
    },

    selectPublicVisibility(): void {
      this.form.isPublic = true
    },

    async copyShareLink(): Promise<void> {
      if (!this.group || this.groupId === null) {
        return
      }

      this.shareLinkLoading = true

      try {
        let shareHash = this.group.publicShareHash

        if (!shareHash) {
          const response = await repertoireGroupService.generateShareLink(this.groupId)
          shareHash = response.payload?.shareHash ?? null

          if (shareHash) {
            this.group = {
              ...this.group,
              hasPublicShareLink: true,
              publicShareHash: shareHash
            }
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
        this.shareLinkLoading = false
      }
    },

    async initializePage(): Promise<void> {
      if (this.groupId === null) {
        await this.$router.replace({ name: 'not-found' })
        return
      }

      this.pageLoading = true

      try {
        await this.loadGroup()
        await this.loadSongs()
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar a pasta.'
        )
        await this.$router.replace({ name: 'repertoire-groups' })
      } finally {
        this.pageLoading = false
      }
    },

    async loadGroup(): Promise<void> {
      if (this.groupId === null) {
        return
      }

      const response = await repertoireGroupService.getById(this.groupId)
      const payload = response.payload

      if (!payload) {
        throw new Error('Pasta não encontrada.')
      }

      this.group = payload
      this.form = {
        name: payload.name,
        description: payload.description ?? '',
        isPublic: payload.isPublic,
        allowPublicLinkAccess: payload.allowPublicLinkAccess
      }
    },

    async loadSongs(): Promise<void> {
      if (this.groupId === null) {
        return
      }

      this.songsLoading = true

      try {
        const response = await repertoireGroupService.listRepertoires(this.groupId)
        this.songs = response.payload ?? []
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar músicas da pasta.'
        )
      } finally {
        this.songsLoading = false
      }
    },

    clearNameError(): void {
      this.nameError = ''
    },

    async handleSave(): Promise<void> {
      if (!this.group || this.groupId === null) {
        return
      }

      const trimmedName = this.form.name.trim()

      if (!trimmedName) {
        this.nameError = 'O nome é obrigatório.'
        return
      }

      this.saving = true

      const payload: UpdateRepertoireGroupRequest = {
        name: trimmedName,
        description: this.form.description.trim() || null,
        isPublic: this.form.isPublic,
        allowPublicLinkAccess: this.form.allowPublicLinkAccess
      }

      try {
        const response = await repertoireGroupService.update(this.groupId, payload)

        if (response.payload) {
          this.group = response.payload
          this.form = {
            name: response.payload.name,
            description: response.payload.description ?? '',
            isPublic: response.payload.isPublic,
            allowPublicLinkAccess: response.payload.allowPublicLinkAccess
          }
        }

        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao salvar a pasta.'
        )
      } finally {
        this.saving = false
      }
    },

    async handleSongAdded(item: RepertoireListItem): Promise<void> {
      if (this.songs.some((song) => song.id === item.id)) {
        return
      }

      this.songs = [...this.songs, item].sort((first, second) =>
        first.songName.localeCompare(second.songName, 'pt-BR', { sensitivity: 'base' })
      )

      if (this.group) {
        this.group = {
          ...this.group,
          itemCount: this.songs.length
        }
      }
    },

    async toggleFavorite(item: RepertoireListItem): Promise<void> {
      this.favoriteLoadingId = item.id
      const nextValue = !item.isFavorite

      try {
        const response = await repertoireService.setFavorite(item.id, nextValue)
        item.isFavorite = nextValue
        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao atualizar favorito.'
        )
      } finally {
        this.favoriteLoadingId = null
      }
    },

    async handleRemoveFromGroup(item: RepertoireListItem): Promise<void> {
      if (this.groupId === null) {
        return
      }

      const confirmed = await confirmDialogService.confirm({
        title: 'Remover da pasta',
        message: `Deseja remover "${item.songName}" desta pasta? A música continuará no repertório.`,
        confirmLabel: 'Remover',
        cancelLabel: 'Cancelar',
        tone: 'danger'
      })

      if (!confirmed) {
        return
      }

      this.actionLoadingId = item.id

      try {
        const response = await repertoireGroupService.removeRepertoire(this.groupId, item.id)
        this.songs = this.songs.filter((song) => song.id !== item.id)

        if (this.group) {
          this.group = {
            ...this.group,
            itemCount: this.songs.length
          }
        }

        toastService.success(response.message)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao remover música da pasta.'
        )
      } finally {
        this.actionLoadingId = null
      }
    },

    openLyricsModal(item: RepertoireListItem): void {
      this.lyricsItem = item
      this.lyricsModalVisible = true
    },

    closeLyricsModal(): void {
      this.lyricsModalVisible = false
      this.lyricsItem = null
    }
  }
})
</script>
