<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <CalendarDaysIcon :size="20" />
          </span>
          <h1>Escalas</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Selecione o ministério e o período para visualizar ou montar a escala dos eventos da Agenda.
        </p>
      </div>
    </header>

    <section class="repertoire-card">
      <div class="repertoire-card__title-row">
        <h2>Período e ministério</h2>
      </div>

      <div
        v-if="filtersLoading"
        class="monthly-schedule-filters monthly-schedule-filters--skeleton"
        aria-hidden="true"
      >
        <span class="app-skeleton app-skeleton--description" />
        <span class="app-skeleton app-skeleton--description" />
        <span class="app-skeleton app-skeleton--description" />
      </div>

      <div
        v-else
        class="monthly-schedule-filters"
      >
        <div class="monthly-schedule-filters__ministries">
          <span class="monthly-schedule-filters__label">Ministério</span>

          <p
            v-if="ministries.length === 0"
            class="description"
          >
            Nenhum ministério ativo disponível.
          </p>

          <div
            v-else
            class="monthly-schedule-filters__ministry-grid"
            role="radiogroup"
            aria-label="Selecionar ministério"
          >
            <button
              v-for="ministry in ministries"
              :key="ministry.id"
              type="button"
              class="fluent-card selectable-card monthly-schedule-filters__ministry-card"
              :class="{
                'selectable-card--selected': ministryId === ministry.id
              }"
              role="radio"
              :aria-checked="ministryId === ministry.id ? 'true' : 'false'"
              @click="selectMinistry(ministry.id)"
            >
              <span class="selectable-card__icon" aria-hidden="true">
                <MusicIcon
                  v-if="ministry.isMusicMinistry"
                  :size="20"
                />
                <ChurchIcon
                  v-else
                  :size="20"
                />
              </span>

              <span class="selectable-card__content">
                <span class="selectable-card__title">{{ ministry.name }}</span>
                <span
                  v-if="ministry.isMusicMinistry"
                  class="selectable-card__description"
                >
                  Inclui escala e repertório musical
                </span>
              </span>

              <span
                class="selectable-card__indicator"
                aria-hidden="true"
              >
                <CheckIcon
                  v-if="ministryId === ministry.id"
                  :size="14"
                />
              </span>
            </button>
          </div>
        </div>

        <div class="repertoire-form repertoire-form--grid monthly-schedule-filters__period">
          <label>
            Mês
            <select
              id="monthly-schedule-month"
              v-model="selectedMonth"
              class="field-control"
            >
              <option
                v-for="monthOption in monthOptions"
                :key="monthOption.value"
                :value="monthOption.value"
              >
                {{ monthOption.label }}
              </option>
            </select>
          </label>

          <label>
            Ano
            <select
              id="monthly-schedule-year"
              v-model="selectedYear"
              class="field-control"
            >
              <option
                v-for="year in yearOptions"
                :key="year"
                :value="year"
              >
                {{ year }}
              </option>
            </select>
          </label>
        </div>
      </div>
    </section>

    <div
      v-if="!filtersLoading"
      class="monthly-schedule-step__action"
    >
      <button
        type="button"
        class="monthly-schedule-step__button"
        :disabled="!canViewSchedule"
        @click="goToScheduleDetails"
      >
        <span>Ver escala</span>
        <ArrowRightIcon :size="18" aria-hidden="true" />
      </button>

      <p
        v-if="!canViewSchedule"
        class="description monthly-schedule-step__hint"
      >
        Selecione um ministério para continuar.
      </p>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChurchIcon,
  MusicIcon
} from '@lucide/vue'
import { ministryService } from '@/services/ministryService'
import type { Ministry } from '@/types/people'
import {
  buildYearOptions,
  MONTH_OPTIONS
} from '@/utils/monthlySchedule'

export default defineComponent({
  name: 'MonthlyTeamScheduleView',
  components: {
    ArrowRightIcon,
    CalendarDaysIcon,
    CheckIcon,
    ChurchIcon,
    MusicIcon
  },
  data() {
    const today = new Date()

    return {
      ministries: [] as Ministry[],
      filtersLoading: true,
      ministryId: null as number | null,
      selectedMonth: today.getMonth() + 1,
      selectedYear: today.getFullYear(),
      monthOptions: MONTH_OPTIONS
    }
  },
  computed: {
    yearOptions(): number[] {
      return buildYearOptions(new Date().getFullYear())
    },
    canViewSchedule(): boolean {
      return this.ministryId !== null
    }
  },
  async mounted() {
    await this.loadMinistries()
    this.filtersLoading = false
  },
  methods: {
    async loadMinistries() {
      try {
        const response = await ministryService.list()
        this.ministries = (response.payload ?? []).filter((item) => item.isActive)
      } catch {
        this.ministries = []
      }
    },
    selectMinistry(ministryId: number) {
      this.ministryId = ministryId
    },
    goToScheduleDetails() {
      if (!this.canViewSchedule || this.ministryId === null) {
        return
      }

      void this.$router.push({
        name: 'events-schedules-details',
        params: {
          ministryId: String(this.ministryId),
          year: String(this.selectedYear),
          month: String(this.selectedMonth)
        }
      })
    }
  }
})
</script>
