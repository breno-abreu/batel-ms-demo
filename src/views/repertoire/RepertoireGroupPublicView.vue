<template>
  <section
    class="
      repertoire-page
      repertoire-page--public
      event-schedule-public-page
      team-schedule-repertoire-public-page
      repertoire-group-public-page
    "
  >
    <header
      class="
        repertoire-page__header
        event-schedule-public-page__header
        fluent-card
      "
    >
      <div>
        <p class="event-schedule-public-page__eyebrow">
          Repertório compartilhado
        </p>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <FolderIcon :size="22" />
          </span>
          <h1>{{ pageTitle }}</h1>
        </div>
        <p
          v-if="group?.description"
          class="description repertoire-page__header-description"
        >
          {{ group.description }}
        </p>
        <p
          v-else
          class="description repertoire-page__header-description"
        >
          Pasta compartilhada do repertório Bless App.
        </p>
      </div>
    </header>

    <div
      v-if="pageLoading"
      class="
        repertoire-song-grid
        repertoire-song-grid--skeleton
        team-schedule-repertoire-public-page__content
      "
      aria-hidden="true"
    >
      <div
        v-for="index in 3"
        :key="index"
        class="repertoire-song-card repertoire-song-card--skeleton"
      >
        <span class="app-skeleton app-skeleton--title" />
        <span class="app-skeleton app-skeleton--description" />
      </div>
    </div>

    <section
      v-else-if="group"
      class="
        repertoire-card
        team-schedule-repertoire-public-page__content
        fluent-card
      "
    >
      <div class="repertoire-card__title-row">
        <h2>Músicas na pasta</h2>
        <span class="repertoire-badge">{{ songsCountLabel }}</span>
      </div>

      <div class="team-schedule-repertoire-public-page__filter">
        <span
          id="public-group-repertoire-resource-filter-label"
          class="team-schedule-repertoire-public-page__filter-label"
        >
          <ListFilterIcon :size="20" aria-hidden="true" />
          Filtrar links
        </span>

        <div class="public-repertoire-resource-select">
          <button
            type="button"
            class="public-repertoire-resource-select__trigger"
            :aria-expanded="resourceFilterOpen ? 'true' : 'false'"
            aria-haspopup="listbox"
            aria-labelledby="public-group-repertoire-resource-filter-label"
            @click="toggleResourceFilter"
          >
            <span class="public-repertoire-resource-select__option">
              <component
                :is="selectedResourceFilterOption.icon"
                :size="19"
                aria-hidden="true"
              />
              {{ selectedResourceFilterOption.label }}
            </span>
            <ChevronDownIcon :size="20" aria-hidden="true" />
          </button>

          <ul
            v-if="resourceFilterOpen"
            class="public-repertoire-resource-select__list"
            role="listbox"
            :aria-activedescendant="`group-resource-filter-${resourceFilter}`"
          >
            <li
              v-for="option in resourceFilterOptions"
              :id="`group-resource-filter-${option.value}`"
              :key="option.value"
              role="option"
              :aria-selected="resourceFilter === option.value ? 'true' : 'false'"
            >
              <button
                type="button"
                class="public-repertoire-resource-select__option-button"
                :class="{
                  'public-repertoire-resource-select__option-button--selected':
                    resourceFilter === option.value
                }"
                @click="selectResourceFilter(option.value)"
              >
                <span class="public-repertoire-resource-select__option">
                  <component :is="option.icon" :size="20" aria-hidden="true" />
                  {{ option.label }}
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>

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
          header-mode="view"
          :resource-filter="resourceFilter"
          @open-lyrics="openLyricsModal"
        />
      </div>
    </section>

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
import { defineComponent, type Component } from 'vue'
import {
  ChevronDownIcon,
  CirclePlayIcon,
  ExternalLinkIcon,
  FileMusicIcon,
  FolderIcon,
  LinkIcon,
  ListFilterIcon,
  MicIcon,
  MusicIcon,
  ScrollTextIcon
} from '@lucide/vue'
import AppFormModal from '@/components/feedback/AppFormModal.vue'
import RepertoireSongCard, {
  type RepertoireSongCardResourceFilter
} from '@/components/repertoire/RepertoireSongCard.vue'
import { repertoireGroupService } from '@/services/repertoireGroupService'
import {
  resolvePublicResourceFilter,
  setPublicResourceFilter
} from '@/services/publicResourceFilterStorage'
import type { RepertoireListItem } from '@/types/repertoire'
import type { PublicRepertoireGroup } from '@/types/repertoireGroup'

type ResourceFilterOption = {
  value: Exclude<RepertoireSongCardResourceFilter, 'all'>
  label: string
  icon: Component
  isAvailable: (item: RepertoireListItem) => boolean
}

type ResourceFilterSelectOption = {
  value: RepertoireSongCardResourceFilter
  label: string
  icon: Component
}

const RESOURCE_FILTER_OPTIONS: ResourceFilterOption[] = [
  { value: 'reference1', label: 'Referência 1', icon: ExternalLinkIcon, isAvailable: (item) => Boolean(item.referenceUrl1) },
  { value: 'reference2', label: 'Referência 2', icon: ExternalLinkIcon, isAvailable: (item) => Boolean(item.referenceUrl2) },
  { value: 'lyrics', label: 'Letra', icon: ScrollTextIcon, isAvailable: (item) => Boolean(item.lyrics) },
  { value: 'playback', label: 'Playback', icon: CirclePlayIcon, isAvailable: (item) => Boolean(item.playbackUrl) },
  { value: 'soprano', label: 'Soprano', icon: MicIcon, isAvailable: (item) => Boolean(item.sopranoKitVoiceUrl) },
  {
    value: 'contralto',
    label: 'Contralto',
    icon: MicIcon,
    isAvailable: (item) => Boolean(item.contraltoKitVoiceUrl || item.contraltoKitUnavailable)
  },
  { value: 'tenor', label: 'Tenor', icon: MicIcon, isAvailable: (item) => Boolean(item.tenorKitVoiceUrl) },
  { value: 'chord', label: 'Cifra', icon: MusicIcon, isAvailable: (item) => Boolean(item.chordUrl) },
  { value: 'sheetMusic', label: 'Partitura', icon: FileMusicIcon, isAvailable: (item) => Boolean(item.sheetMusicUrl) }
]

export default defineComponent({
  name: 'RepertoireGroupPublicView',
  components: {
    AppFormModal,
    ChevronDownIcon,
    FolderIcon,
    ListFilterIcon,
    RepertoireSongCard
  },
  data() {
    return {
      group: null as PublicRepertoireGroup | null,
      songs: [] as RepertoireListItem[],
      resourceFilter: 'all' as RepertoireSongCardResourceFilter,
      resourceFilterOpen: false,
      pageLoading: false,
      lyricsModalVisible: false,
      lyricsItem: null as RepertoireListItem | null
    }
  },
  computed: {
    shareHash(): string | null {
      const value = this.$route.params.shareHash

      if (typeof value !== 'string' || !value.trim()) {
        return null
      }

      return value.trim()
    },
    pageTitle(): string {
      return this.group?.name ?? 'Pasta compartilhada'
    },
    songsCountLabel(): string {
      if (this.songs.length === 0) {
        return 'Nenhuma música'
      }

      if (this.songs.length === 1) {
        return '1 música'
      }

      return `${this.songs.length} músicas`
    },
    resourceFilterOptions(): ResourceFilterSelectOption[] {
      return [
        { value: 'all', label: 'Todos os links', icon: LinkIcon },
        ...RESOURCE_FILTER_OPTIONS
          .filter((option) => this.songs.some(option.isAvailable))
          .map(({ value, label, icon }) => ({ value, label, icon }))
      ]
    },
    selectedResourceFilterOption(): ResourceFilterSelectOption {
      return this.resourceFilterOptions.find(
        (option) => option.value === this.resourceFilter
      ) ?? { value: 'all', label: 'Todos os links', icon: LinkIcon }
    }
  },
  watch: {
    '$route.params.shareHash'() {
      void this.initializePage()
    }
  },
  mounted() {
    void this.initializePage()
  },
  methods: {
    async initializePage(): Promise<void> {
      if (!this.shareHash) {
        await this.$router.replace({ name: 'public-not-found' })
        return
      }

      this.pageLoading = true
      this.resourceFilterOpen = false

      try {
        const [groupResponse, songsResponse] = await Promise.all([
          repertoireGroupService.getPublicByShareHash(this.shareHash),
          repertoireGroupService.listPublicRepertoires(this.shareHash)
        ])

        if (!groupResponse.payload) {
          throw new Error('Pasta não encontrada.')
        }

        this.group = groupResponse.payload
        this.songs = songsResponse.payload ?? []
        this.resourceFilter = resolvePublicResourceFilter(
          this.resourceFilterOptions.map((option) => option.value)
        )
      } catch {
        await this.$router.replace({ name: 'public-not-found' })
      } finally {
        this.pageLoading = false
      }
    },

    toggleResourceFilter(): void {
      this.resourceFilterOpen = !this.resourceFilterOpen
    },

    selectResourceFilter(value: RepertoireSongCardResourceFilter): void {
      this.resourceFilter = value
      this.resourceFilterOpen = false
      setPublicResourceFilter(value)
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
