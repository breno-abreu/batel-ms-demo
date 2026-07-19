<template>
  <section
    class="
      repertoire-page
      repertoire-page--public
      event-schedule-public-page
      monthly-team-schedule-public-page
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
          Escala mensal
        </p>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <CalendarDaysIcon :size="22" />
          </span>
          <h1>{{ schedule?.ministryName ?? 'Escala compartilhada' }}</h1>
        </div>
        <p class="description repertoire-page__header-description">
          {{ monthYearLabel }}
        </p>
      </div>
    </header>

    <main class="monthly-team-schedule-public-page__content">
      <AppListSkeleton
        v-if="pageLoading"
        :rows="4"
        :action-count="0"
      />

      <p
        v-else-if="!schedule || schedule.events.length === 0"
        class="monthly-team-schedule-public-page__empty fluent-card"
      >
        Nenhum evento encontrado nesta escala.
      </p>

      <div
        v-else
        class="monthly-team-schedule-public-page__events"
      >
        <article
          v-for="(event, eventIndex) in schedule.events"
          :key="`${event.eventDate}-${event.eventName}-${eventIndex}`"
          class="monthly-team-schedule-public-event fluent-card"
        >
          <header class="monthly-team-schedule-public-event__header">
            <div>
              <p class="monthly-team-schedule-public-event__date">
                {{ formatEventDate(event.eventDate) }}
              </p>
              <h2>{{ event.eventName }}</h2>
            </div>
            <span
              v-if="formatEventTime(event)"
              class="monthly-team-schedule-public-event__time"
            >
              {{ formatEventTime(event) }}
            </span>
          </header>

          <div class="monthly-team-schedule-public-event__sections">
            <section class="monthly-team-schedule-public-event__section">
              <h3>
                <UsersIcon :size="18" aria-hidden="true" />
                Escala
              </h3>

              <p
                v-if="event.assignments.length === 0"
                class="monthly-team-schedule-public-event__empty"
              >
                Nenhuma pessoa definida.
              </p>

              <ul
                v-else
                class="monthly-team-schedule-public-event__assignment-list"
              >
                <li
                  v-for="assignment in event.assignments"
                  :key="`${assignment.displayOrder}-${assignment.personName}`"
                >
                  <strong>{{ assignment.personName }}</strong>
                  <span>{{ assignment.skillName ?? 'Sem função definida' }}</span>
                </li>
              </ul>
            </section>

            <section
              v-if="schedule.isMusicMinistry"
              class="monthly-team-schedule-public-event__section"
            >
              <div class="monthly-team-schedule-public-event__section-title">
                <h3>
                  <MusicIcon :size="18" aria-hidden="true" />
                  Repertório
                </h3>
                <span v-if="event.repertoireGroupName">
                  Pasta: {{ event.repertoireGroupName }}
                </span>
              </div>

              <p
                v-if="event.repertoires.length === 0"
                class="monthly-team-schedule-public-event__empty"
              >
                Nenhuma música definida.
              </p>

              <ol
                v-else
                class="monthly-team-schedule-public-event__repertoire-list"
              >
                <li
                  v-for="repertoire in event.repertoires"
                  :key="`${repertoire.displayOrder}-${repertoire.songName}`"
                >
                  <div>
                    <strong>{{ repertoire.songName }}</strong>
                    <span v-if="repertoire.author">{{ repertoire.author }}</span>
                  </div>
                </li>
              </ol>
            </section>
          </div>
        </article>
      </div>
    </main>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CalendarDaysIcon, MusicIcon, UsersIcon } from '@lucide/vue'
import AppListSkeleton from '@/components/feedback/AppListSkeleton.vue'
import { teamScheduleService } from '@/services/teamScheduleService'
import type {
  PublicMonthlyTeamScheduleData,
  PublicMonthlyTeamScheduleEvent
} from '@/types/teamSchedules'
import { formatEventTimeLabel } from '@/utils/eventCalendar'

export default defineComponent({
  name: 'MonthlyTeamSchedulePublicView',
  components: {
    AppListSkeleton,
    CalendarDaysIcon,
    MusicIcon,
    UsersIcon
  },
  data() {
    return {
      schedule: null as PublicMonthlyTeamScheduleData | null,
      pageLoading: true
    }
  },
  computed: {
    shareHash(): string | null {
      const value = this.$route.params.shareHash
      return typeof value === 'string' && value.trim() ? value.trim() : null
    },
    monthYearLabel(): string {
      if (!this.schedule) {
        return 'Escala pública do Bless App'
      }

      const value = new Date(this.schedule.year, this.schedule.month - 1, 1)
        .toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric'
        })

      return value.charAt(0).toUpperCase() + value.slice(1)
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

      try {
        const response = await teamScheduleService.getPublicMonthlyByShareHash(
          this.shareHash
        )

        if (!response.payload) {
          throw new Error('Escala mensal não encontrada.')
        }

        this.schedule = response.payload
      } catch {
        await this.$router.replace({ name: 'public-not-found' })
      } finally {
        this.pageLoading = false
      }
    },
    formatEventDate(eventDate: string): string {
      const value = new Date(`${eventDate}T00:00:00`).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long'
      })

      return value.charAt(0).toUpperCase() + value.slice(1)
    },
    formatEventTime(event: PublicMonthlyTeamScheduleEvent): string {
      return formatEventTimeLabel(event.startTime, event.endTime)
    }
  }
})
</script>
