<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <MusicIcon :size="20" />
          </span>
          <h1>{{ pageTitle }}</h1>
        </div>
        <p class="description repertoire-page__header-description">
          {{ isCreateMode ? 'Cadastre uma nova música no repertório.' : 'Edite os detalhes da música selecionada.' }}
        </p>
      </div>

      <RouterLink
        class="repertoire-link-button repertoire-link-button--ghost repertoire-link-button--with-icon"
        :to="{ name: 'repertoire-list' }"
      >
        <ArrowLeftIcon :size="16" aria-hidden="true" />
        Voltar para a lista
      </RouterLink>
    </header>

    <div
      v-if="pageLoading"
      class="repertoire-details-form repertoire-details-form--skeleton"
      aria-hidden="true"
    >
      <section
        v-for="sectionIndex in 4"
        :key="sectionIndex"
        class="repertoire-card"
      >
        <span class="app-skeleton app-skeleton--title" />
        <span class="app-skeleton app-skeleton--description" />
        <span class="app-skeleton app-skeleton--description" />
      </section>
    </div>

    <form v-unsaved-changes
      v-else
      class="repertoire-details-form"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <section class="repertoire-card">
        <h2>Dados básicos</h2>

        <div class="repertoire-form repertoire-form--grid">
          <label class="repertoire-form__field--full">
            Nome da música *
            <input
              id="repertoire-song-name"
              v-model="form.songName"
              type="text"
              class="field-control"
              :maxlength="songNameMaxLength"
              placeholder="Ex.: Amazing Grace"
              :class="{ 'field-control--invalid': songNameError }"
              :aria-invalid="songNameError ? 'true' : 'false'"
              @input="clearSongNameError"
            >
            <span
              id="repertoire-song-name-counter"
              class="field-counter"
              aria-live="polite"
            >
              {{ form.songName.length }}/{{ songNameMaxLength }}
            </span>
            <span
              v-if="songNameError"
              id="repertoire-song-name-error"
              class="field-error"
              role="alert"
            >
              {{ songNameError }}
            </span>
          </label>

          <label>
            Autor
            <input
              id="repertoire-author"
              v-model="form.author"
              type="text"
              class="field-control"
              :maxlength="authorMaxLength"
              placeholder="Ex.: John Newton"
              aria-describedby="repertoire-author-counter"
            >
            <span
              id="repertoire-author-counter"
              class="field-counter"
              aria-live="polite"
            >
              {{ form.author.length }}/{{ authorMaxLength }}
            </span>
          </label>

          <label>
            Versão
            <input
              id="repertoire-version"
              v-model="form.version"
              type="text"
              class="field-control"
              :maxlength="versionMaxLength"
              placeholder="Ex.: Congregacional"
              aria-describedby="repertoire-version-counter"
            >
            <span
              id="repertoire-version-counter"
              class="field-counter"
              aria-live="polite"
            >
              {{ form.version.length }}/{{ versionMaxLength }}
            </span>
          </label>

          <label>
            Número do hino
            <input
              id="repertoire-hymn-number"
              v-model="form.hymnNumber"
              type="text"
              class="field-control"
              :maxlength="hymnNumberMaxLength"
              placeholder="Ex.: 123"
              aria-describedby="repertoire-hymn-number-counter"
            >
            <span
              id="repertoire-hymn-number-counter"
              class="field-counter"
              aria-live="polite"
            >
              {{ form.hymnNumber.length }}/{{ hymnNumberMaxLength }}
            </span>
          </label>

          <label>
            Tom
            <input
              id="repertoire-key"
              v-model="form.key"
              type="text"
              class="field-control"
              :maxlength="keyMaxLength"
              placeholder="Ex.: G"
              aria-describedby="repertoire-key-counter"
            >
            <span
              id="repertoire-key-counter"
              class="field-counter"
              aria-live="polite"
            >
              {{ form.key.length }}/{{ keyMaxLength }}
            </span>
          </label>
        </div>
      </section>

      <section class="repertoire-card">
        <h2>Classificação</h2>

        <div class="repertoire-form repertoire-form--grid">
          <label>
            Nível de dificuldade
            <select v-model="form.difficultyLevelId" class="field-control">
              <option :value="null">
                Não informado
              </option>
              <option
                v-for="level in difficultyLevels"
                :key="level.id"
                :value="level.id"
              >
                {{ level.name }}
              </option>
            </select>
          </label>

          <label>
            Nível de popularidade
            <select v-model="form.popularityLevelId" class="field-control">
              <option :value="null">
                Não informado
              </option>
              <option
                v-for="level in popularityLevels"
                :key="level.id"
                :value="level.id"
              >
                {{ level.name }}
              </option>
            </select>
          </label>
        </div>

        <div class="repertoire-theme-picker">
          <div class="repertoire-theme-picker__header">
            <span class="repertoire-theme-picker__label">
              Temas musicais
              <span class="repertoire-theme-picker__hint">(Selecione um ou mais temas)</span>
            </span>
          </div>

          <p v-if="musicalThemes.length === 0" class="description">
            Nenhum tema musical cadastrado.
          </p>

          <div
            v-else
            class="repertoire-theme-picker__options"
            role="group"
            aria-label="Selecionar temas musicais"
          >
            <button
              v-for="theme in musicalThemes"
              :key="theme.id"
              type="button"
              data-unsaved-change
              class="repertoire-theme-picker__option"
              :class="{
                'repertoire-theme-picker__option--selected': isThemeSelected(theme.id),
                'repertoire-theme-picker__option--animating': animatedThemeId === theme.id
              }"
              :aria-pressed="isThemeSelected(theme.id) ? 'true' : 'false'"
              @click="toggleTheme(theme.id)"
              @animationend="clearThemeAnimation(theme.id, $event)"
            >
              <TagIcon :size="14" aria-hidden="true" />
              {{ theme.name }}
            </button>
          </div>
        </div>
      </section>

      <section class="repertoire-card">
        <h2>Links e materiais</h2>

        <div class="repertoire-form repertoire-form--grid">
          <label
            v-for="urlField in urlFields"
            :key="urlField.key"
          >
            {{ urlField.label }}
            <input
              v-model="form[urlField.key]"
              type="text"
              class="field-control"
              :maxlength="urlMaxLength"
              :placeholder="urlPlaceholder"
              :class="{ 'field-control--invalid': urlErrors[urlField.key] }"
              :aria-invalid="urlErrors[urlField.key] ? 'true' : 'false'"
              @input="clearUrlError(urlField.key)"
            >
            <span class="field-counter" aria-live="polite">
              {{ form[urlField.key].length }}/{{ urlMaxLength }}
            </span>
            <span
              v-if="urlErrors[urlField.key]"
              class="field-error"
              role="alert"
            >
              {{ urlErrors[urlField.key] }}
            </span>
          </label>
        </div>
      </section>

      <section class="repertoire-card">
        <h2>Letra e observações</h2>

        <div class="repertoire-form">
          <label>
            Letra
            <textarea
              v-model="form.lyrics"
              class="field-control"
              rows="16"
              :maxlength="lyricsMaxLength"
              placeholder="Letra da música"
            />
            <span class="field-counter" aria-live="polite">
              {{ form.lyrics.length }}/{{ lyricsMaxLength }}
            </span>
          </label>

          <label>
            Observações
            <textarea
              v-model="form.notes"
              class="field-control"
              rows="4"
              :maxlength="notesMaxLength"
              placeholder="Observações adicionais"
            />
            <span class="field-counter" aria-live="polite">
              {{ form.notes.length }}/{{ notesMaxLength }}
            </span>
          </label>
        </div>
      </section>

      <div v-if="canManageRepertoire" class="repertoire-details-form__actions">
        <RouterLink
          class="field-button field-button--ghost"
          :to="{ name: 'repertoire-list' }"
        >
          Cancelar
        </RouterLink>
        <button type="submit" class="repertoire-button" :disabled="loading">
          {{ loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeftIcon, MusicIcon, TagIcon } from '@lucide/vue'
import { difficultyLevelService } from '@/services/difficultyLevelService'
import { musicalThemeService } from '@/services/musicalThemeService'
import { popularityLevelService } from '@/services/popularityLevelService'
import { repertoireService } from '@/services/repertoireService'
import { toastService } from '@/services/toastService'
import { useAuthStore } from '@/stores/authStore'
import type {
  DifficultyLevel,
  MusicalTheme,
  PopularityLevel,
  SaveRepertoireRequest
} from '@/types/repertoire'
import { isValidOptionalUrl, normalizeOptionalUrl } from '@/utils/urlUtils'
import { Permissions } from '@/utils/permissions'

const SONG_NAME_MAX_LENGTH = 100
const AUTHOR_MAX_LENGTH = 100
const VERSION_MAX_LENGTH = 50
const KEY_MAX_LENGTH = 5
const HYMN_NUMBER_MAX_LENGTH = 10
const URL_MAX_LENGTH = 1000
const LYRICS_MAX_LENGTH = 10000
const NOTES_MAX_LENGTH = 500

type RepertoireForm = {
  songName: string
  author: string
  version: string
  difficultyLevelId: number | null
  popularityLevelId: number | null
  referenceUrl1: string
  referenceUrl2: string
  playbackUrl: string
  lyrics: string
  chordUrl: string
  sheetMusicUrl: string
  key: string
  hymnNumber: string
  sopranoKitVoiceUrl: string
  contraltoKitVoiceUrl: string
  tenorKitVoiceUrl: string
  notes: string
  musicalThemeIds: number[]
}

type UrlFieldKey =
  | 'referenceUrl1'
  | 'referenceUrl2'
  | 'playbackUrl'
  | 'chordUrl'
  | 'sheetMusicUrl'
  | 'sopranoKitVoiceUrl'
  | 'contraltoKitVoiceUrl'
  | 'tenorKitVoiceUrl'

type UrlFieldConfig = {
  key: UrlFieldKey
  label: string
}

const URL_FIELDS: UrlFieldConfig[] = [
  { key: 'referenceUrl1', label: 'URL de referência 1' },
  { key: 'referenceUrl2', label: 'URL de referência 2' },
  { key: 'playbackUrl', label: 'URL de playback' },
  { key: 'chordUrl', label: 'URL de cifra' },
  { key: 'sheetMusicUrl', label: 'URL de partitura' },
  { key: 'sopranoKitVoiceUrl', label: 'URL kit soprano' },
  { key: 'contraltoKitVoiceUrl', label: 'URL kit contralto' },
  { key: 'tenorKitVoiceUrl', label: 'URL kit tenor' }
]

function createEmptyForm(): RepertoireForm {
  return {
    songName: '',
    author: '',
    version: '',
    difficultyLevelId: null,
    popularityLevelId: null,
    referenceUrl1: '',
    referenceUrl2: '',
    playbackUrl: '',
    lyrics: '',
    chordUrl: '',
    sheetMusicUrl: '',
    key: '',
    hymnNumber: '',
    sopranoKitVoiceUrl: '',
    contraltoKitVoiceUrl: '',
    tenorKitVoiceUrl: '',
    notes: '',
    musicalThemeIds: []
  }
}

function createEmptyUrlErrors(): Record<UrlFieldKey, string> {
  return {
    referenceUrl1: '',
    referenceUrl2: '',
    playbackUrl: '',
    chordUrl: '',
    sheetMusicUrl: '',
    sopranoKitVoiceUrl: '',
    contraltoKitVoiceUrl: '',
    tenorKitVoiceUrl: ''
  }
}

export default defineComponent({
  name: 'RepertoireDetailsView',
  components: {
    ArrowLeftIcon,
    MusicIcon,
    RouterLink,
    TagIcon
  },
  data() {
    return {
      form: createEmptyForm(),
      difficultyLevels: [] as DifficultyLevel[],
      popularityLevels: [] as PopularityLevel[],
      musicalThemes: [] as MusicalTheme[],
      urlFields: URL_FIELDS,
      urlPlaceholder: 'exemplo.com/recurso',
      songNameMaxLength: SONG_NAME_MAX_LENGTH,
      authorMaxLength: AUTHOR_MAX_LENGTH,
      versionMaxLength: VERSION_MAX_LENGTH,
      keyMaxLength: KEY_MAX_LENGTH,
      hymnNumberMaxLength: HYMN_NUMBER_MAX_LENGTH,
      urlMaxLength: URL_MAX_LENGTH,
      lyricsMaxLength: LYRICS_MAX_LENGTH,
      notesMaxLength: NOTES_MAX_LENGTH,
      songNameError: '',
      urlErrors: createEmptyUrlErrors(),
      pageLoading: false,
      loading: false,
      animatedThemeId: null as number | null
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    canManageRepertoire(): boolean {
      return this.authStore.hasPermission(Permissions.RepertoireManage)
    },
    isCreateMode(): boolean {
      return this.$route.params.id === 'new'
    },
    repertoireId(): number | null {
      if (this.isCreateMode) {
        return null
      }

      const parsedId = Number(this.$route.params.id)
      return Number.isNaN(parsedId) ? null : parsedId
    },
    pageTitle(): string {
      return this.isCreateMode ? 'Nova música' : 'Editar música'
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
    async initializePage(): Promise<void> {
      this.pageLoading = true
      this.songNameError = ''
      this.urlErrors = createEmptyUrlErrors()

      try {
        await this.loadLookups()

        if (!this.isCreateMode) {
          if (this.repertoireId === null) {
            throw new Error('Identificador da música inválido.')
          }

          await this.loadDetails(this.repertoireId)
        } else {
          this.form = createEmptyForm()
        }
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao carregar a página.'
        )
      } finally {
        this.pageLoading = false
      }
    },

    async loadLookups(): Promise<void> {
      const [difficultyResponse, popularityResponse, themesResponse] = await Promise.all([
        difficultyLevelService.list(),
        popularityLevelService.list(),
        musicalThemeService.list()
      ])

      this.difficultyLevels = difficultyResponse.payload ?? []
      this.popularityLevels = popularityResponse.payload ?? []
      this.musicalThemes = themesResponse.payload ?? []
    },

    async loadDetails(id: number): Promise<void> {
      const response = await repertoireService.getById(id)
      const details = response.payload

      if (!details) {
        throw new Error('Música não encontrada.')
      }

      this.form = {
        songName: details.songName,
        author: details.author ?? '',
        version: details.version ?? '',
        difficultyLevelId: details.difficultyLevelId,
        popularityLevelId: details.popularityLevelId,
        referenceUrl1: details.referenceUrl1 ?? '',
        referenceUrl2: details.referenceUrl2 ?? '',
        playbackUrl: details.playbackUrl ?? '',
        lyrics: details.lyrics ?? '',
        chordUrl: details.chordUrl ?? '',
        sheetMusicUrl: details.sheetMusicUrl ?? '',
        key: details.key ?? '',
        hymnNumber: details.hymnNumber ?? '',
        sopranoKitVoiceUrl: details.sopranoKitVoiceUrl ?? '',
        contraltoKitVoiceUrl: details.contraltoKitVoiceUrl ?? '',
        tenorKitVoiceUrl: details.tenorKitVoiceUrl ?? '',
        notes: details.notes ?? '',
        musicalThemeIds: [...details.musicalThemeIds]
      }
    },

    isThemeSelected(themeId: number): boolean {
      return this.form.musicalThemeIds.includes(themeId)
    },

    toggleTheme(themeId: number): void {
      this.animatedThemeId = themeId

      if (this.isThemeSelected(themeId)) {
        this.form.musicalThemeIds = this.form.musicalThemeIds.filter((id) => id !== themeId)
        return
      }

      this.form.musicalThemeIds = [...this.form.musicalThemeIds, themeId]
    },

    clearThemeAnimation(themeId: number, event: AnimationEvent): void {
      if (event.target !== event.currentTarget) {
        return
      }

      if (this.animatedThemeId === themeId) {
        this.animatedThemeId = null
      }
    },

    clearSongNameError(): void {
      this.songNameError = ''
    },

    clearUrlError(fieldKey: UrlFieldKey): void {
      this.urlErrors[fieldKey] = ''
    },

    validateForm(): boolean {
      this.songNameError = ''
      this.urlErrors = createEmptyUrlErrors()

      const trimmedName = this.form.songName.trim()

      if (!trimmedName) {
        this.songNameError = 'O nome da música é obrigatório.'
      } else if (trimmedName.length > SONG_NAME_MAX_LENGTH) {
        this.songNameError = `O nome da música deve ter no máximo ${SONG_NAME_MAX_LENGTH} caracteres.`
      }

      for (const urlField of URL_FIELDS) {
        const value = this.form[urlField.key]

        if (value.trim() && !isValidOptionalUrl(value)) {
          this.urlErrors[urlField.key] = 'Informe uma URL válida.'
        }
      }

      return !this.songNameError
        && Object.values(this.urlErrors).every((message) => !message)
    },

    buildPayload(): SaveRepertoireRequest {
      return {
        songName: this.form.songName.trim(),
        author: this.form.author.trim() || null,
        version: this.form.version.trim() || null,
        difficultyLevelId: this.form.difficultyLevelId,
        popularityLevelId: this.form.popularityLevelId,
        referenceUrl1: normalizeOptionalUrl(this.form.referenceUrl1),
        referenceUrl2: normalizeOptionalUrl(this.form.referenceUrl2),
        playbackUrl: normalizeOptionalUrl(this.form.playbackUrl),
        lyrics: this.form.lyrics.trim() || null,
        chordUrl: normalizeOptionalUrl(this.form.chordUrl),
        sheetMusicUrl: normalizeOptionalUrl(this.form.sheetMusicUrl),
        key: this.form.key.trim() || null,
        hymnNumber: this.form.hymnNumber.trim() || null,
        sopranoKitVoiceUrl: normalizeOptionalUrl(this.form.sopranoKitVoiceUrl),
        contraltoKitVoiceUrl: normalizeOptionalUrl(this.form.contraltoKitVoiceUrl),
        tenorKitVoiceUrl: normalizeOptionalUrl(this.form.tenorKitVoiceUrl),
        notes: this.form.notes.trim() || null,
        musicalThemeIds: [...this.form.musicalThemeIds]
      }
    },

    async handleSubmit(): Promise<void> {
      if (!this.canManageRepertoire || !this.validateForm()) {
        return
      }

      this.loading = true
      const payload = this.buildPayload()

      try {
        if (this.isCreateMode) {
          const response = await repertoireService.create(payload)
          toastService.success(response.message)

          if (response.payload?.id) {
            await this.$router.push({
              name: 'repertoire-details',
              params: { id: String(response.payload.id) }
            })
          }

          return
        }

        if (this.repertoireId === null) {
          throw new Error('Identificador da música inválido.')
        }

        const response = await repertoireService.update(this.repertoireId, payload)
        toastService.success(response.message)
        await this.loadDetails(this.repertoireId)
      } catch (error) {
        toastService.error(
          error instanceof Error ? error.message : 'Erro ao salvar a música.'
        )
      } finally {
        this.loading = false
      }
    }
  }
})
</script>
