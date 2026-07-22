<template>
  <section
    class="
      repertoire-page
      repertoire-page--public
      event-schedule-public-page
      team-schedule-repertoire-public-page
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
          Repertório da escala
        </p>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <MusicIcon :size="22" />
          </span>
          <h1>{{ pageTitle }}</h1>
        </div>
        <p class="description repertoire-page__header-description">
          {{ pageDescription }}
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
      v-else-if="schedule"
      class="
        repertoire-card
        team-schedule-repertoire-public-page__content
        fluent-card
      "
    >
      <div class="repertoire-card__title-row">
        <h2>{{ songsSectionTitle }}</h2>
        <span class="repertoire-badge">{{ songsCountLabel }}</span>
      </div>

      <div class="team-schedule-repertoire-public-page__filter">
        <span
          id="public-repertoire-resource-filter-label"
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
            aria-labelledby="public-repertoire-resource-filter-label"
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
            :aria-activedescendant="`resource-filter-${resourceFilter}`"
          >
            <li
              v-for="option in resourceFilterOptions"
              :id="`resource-filter-${option.value}`"
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
        Nenhuma música definida para este evento.
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
import {
  resolvePublicResourceFilter,
  setPublicResourceFilter
} from '@/services/publicResourceFilterStorage'
import {
  teamScheduleService,
  type PublicTeamSchedule
} from '@/services/teamScheduleService'
import type { RepertoireListItem } from '@/types/repertoire'
import { formatEventTimeLabel } from '@/utils/eventCalendar'

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
  name: 'TeamSchedulePublicView',
  components: {
    AppFormModal,
    ChevronDownIcon,
    ListFilterIcon,
    MusicIcon,
    RepertoireSongCard
  },
  data() {
    return {
      schedule: null as PublicTeamSchedule | null,
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
      return this.schedule?.eventName ?? 'Repertório compartilhado'
    },
    pageDescription(): string {
      if (!this.schedule) {
        return 'Repertório compartilhado do Bless App.'
      }

      const dateLabel = new Date(`${this.schedule.eventDate}T00:00:00`).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
      const timeLabel = formatEventTimeLabel(this.schedule.startTime, this.schedule.endTime)
      const base = timeLabel
        ? `${this.schedule.ministryName} — ${dateLabel} (${timeLabel})`
        : `${this.schedule.ministryName} — ${dateLabel}`

      return base
    },
    songsSectionTitle(): string {
      if (this.schedule?.usesFolder && this.schedule.folderName) {
        return `Pasta ${this.schedule.folderName}`
      }

      return 'Músicas do evento'
    },
    songsCountLabel(): string {
      const count = this.songs.length

      if (count === 0) {
        return 'Nenhuma música'
      }

      if (count === 1) {
        return '1 música'
      }

      return `${count} músicas`
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
        const [scheduleResponse, songsResponse] = await Promise.all([
          teamScheduleService.getPublicByShareHash(this.shareHash),
          teamScheduleService.listPublicRepertoires(this.shareHash)
        ])

        if (!scheduleResponse.payload) {
          throw new Error('Repertório não encontrado.')
        }

        this.schedule = scheduleResponse.payload
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
