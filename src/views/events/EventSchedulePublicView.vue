<template>
  <section
    class="
      repertoire-page
      event-schedule-page
      repertoire-page--public
      event-schedule-public-page
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
          Cronograma público
        </p>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <ListOrderedIcon :size="22" />
          </span>
          <h1>{{ pageTitle }}</h1>
        </div>
        <p class="description repertoire-page__header-description">
          {{ pageDescription }}
        </p>
      </div>
    </header>

    <AppListSkeleton
      v-if="pageLoading"
      class="event-schedule-public-page__content"
      :rows="4"
      :action-count="0"
    />

    <section
      v-else
      class="
        event-schedule-timeline
        event-schedule-public-page__content
        event-schedule-public-page__timeline
        fluent-card
      "
    >
      <div
        v-if="items.length === 0"
        class="event-schedule-timeline__empty"
      >
        <p class="description">
          Nenhuma etapa no cronograma deste evento.
        </p>
      </div>

      <ul
        v-else
        class="event-schedule-timeline__list"
        aria-label="Etapas do cronograma"
      >
        <li
          v-for="(item, index) in items"
          :key="`${item.name}-${index}`"
          class="event-schedule-timeline__entry event-schedule-timeline__entry--public"
        >
          <article
            class="event-schedule-timeline__item"
            :class="{
              'event-schedule-timeline__item--live': isLiveStage(index)
            }"
            :style="getItemHeightStyle(item.durationMinutes)"
          >
            <div
              v-if="isLiveStage(index) && nowLineStyle(index)"
              class="event-schedule-timeline__now-line"
              :style="nowLineStyle(index)!"
              aria-hidden="true"
            >
              <span class="event-schedule-timeline__now-dot" />
            </div>

            <div class="event-schedule-timeline__main event-schedule-timeline__main--static">
              <div class="event-schedule-timeline__content">
                <h2 class="event-schedule-timeline__name">
                  {{ item.name }}
                </h2>
                <p
                  v-if="item.responsibleDisplayName"
                  class="event-schedule-timeline__responsible"
                >
                  <span class="event-schedule-timeline__label">Responsável:</span>
                  {{ item.responsibleDisplayName }}
                </p>
                <p
                  v-if="item.notes"
                  class="event-schedule-timeline__notes"
                >
                  <span class="event-schedule-timeline__label">Detalhes/Convidado/Execução:</span>
                  {{ item.notes }}
                </p>
              </div>

              <div class="event-schedule-timeline__time">
                <span class="event-schedule-timeline__start">
                  {{ formatStartTime(item.startTime) }}
                </span>
                <span
                  v-if="item.durationMinutes"
                  class="event-schedule-timeline__duration"
                >
                  {{ item.durationMinutes }} min
                </span>
              </div>
            </div>
          </article>
        </li>
      </ul>
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ListOrderedIcon } from '@lucide/vue'
import AppListSkeleton from '@/components/feedback/AppListSkeleton.vue'
import { eventScheduleService } from '@/services/eventScheduleService'
import type {
  PublicEventScheduleItem,
  PublicEventSchedulePage
} from '@/types/eventSchedule'
import {
  getActiveScheduleNowIndicator,
  getScheduleItemHeightStyle,
  isEventHappeningNow
} from '@/utils/eventScheduleTimeline'

function formatDateLabel(value: string): string {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) {
    return value
  }

  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export default defineComponent({
  name: 'EventSchedulePublicView',
  components: {
    AppListSkeleton,
    ListOrderedIcon
  },
  data() {
    return {
      pageLoading: true,
      page: null as PublicEventSchedulePage | null,
      now: new Date(),
      nowTimer: null as ReturnType<typeof setInterval> | null
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
    items(): PublicEventScheduleItem[] {
      return this.page?.items ?? []
    },
    isEventLive(): boolean {
      if (!this.page) {
        return false
      }

      return isEventHappeningNow(
        this.page.eventDate,
        this.page.eventStartTime,
        this.page.eventEndTime,
        this.items,
        this.now
      )
    },
    activeNowIndicator() {
      if (!this.isEventLive) {
        return null
      }

      return getActiveScheduleNowIndicator(
        this.items,
        this.page?.eventEndTime ?? null,
        this.now
      )
    },
    pageTitle(): string {
      return this.page?.eventName ?? 'Cronograma compartilhado'
    },
    pageDescription(): string {
      if (!this.page) {
        return 'Cronograma do evento compartilhado pelo Bless App.'
      }

      const dateLabel = formatDateLabel(this.page.eventDate)
      const start = this.formatStartTime(this.page.eventStartTime)
      return start !== '—'
        ? `${dateLabel} · ${start}`
        : dateLabel
    }
  },
  watch: {
    '$route.params.shareHash'() {
      void this.initializePage()
    }
  },
  mounted() {
    this.nowTimer = setInterval(() => {
      this.now = new Date()
    }, 30_000)
    void this.initializePage()
  },
  beforeUnmount() {
    if (this.nowTimer) {
      clearInterval(this.nowTimer)
      this.nowTimer = null
    }
  },
  methods: {
    isLiveStage(index: number): boolean {
      return this.activeNowIndicator?.itemIndex === index
    },
    nowLineStyle(index: number): { top: string } | null {
      if (!this.activeNowIndicator || this.activeNowIndicator.itemIndex !== index) {
        return null
      }

      const progress = Math.min(0.98, Math.max(0.02, this.activeNowIndicator.progress))
      return { top: `${progress * 100}%` }
    },
    getItemHeightStyle(durationMinutes: number | null | undefined) {
      return getScheduleItemHeightStyle(durationMinutes)
    },
    formatStartTime(value: string | null | undefined): string {
      if (!value) {
        return '—'
      }

      return value.length >= 5 ? value.slice(0, 5) : value
    },
    async initializePage(): Promise<void> {
      if (!this.shareHash) {
        await this.$router.replace({ name: 'public-not-found' })
        return
      }

      this.pageLoading = true

      try {
        const response = await eventScheduleService.getPublicByShareHash(this.shareHash)

        if (!response.payload) {
          throw new Error('Cronograma não encontrado.')
        }

        this.page = response.payload
      } catch {
        await this.$router.replace({ name: 'public-not-found' })
      } finally {
        this.pageLoading = false
      }
    }
  }
})
</script>
