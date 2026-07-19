<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <UsersRoundIcon :size="20" />
          </span>
          <h1>Engajamento</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Indicadores de participação nas escalas (apenas eventos já ocorridos).
          <span
            v-if="useMockData"
            class="analytics-mock-badge"
          >
            Dados de teste
          </span>
        </p>
      </div>
    </header>

    <section class="repertoire-card analytics-filters-card">
      <div class="repertoire-card__title-row">
        <h2>Filtros</h2>
      </div>

      <div
        v-if="filtersLoading"
        class="analytics-filters analytics-filters--skeleton"
        aria-hidden="true"
      >
        <span class="app-skeleton app-skeleton--description" />
        <span class="app-skeleton app-skeleton--description" />
      </div>

      <div
        v-else
        class="analytics-filters"
      >
        <div class="analytics-filters__field">
          <label class="analytics-filters__label" for="analytics-ministry">Ministério</label>
          <select
            id="analytics-ministry"
            v-model.number="ministryId"
            class="field-control"
            @change="loadAnalytics"
          >
            <option
              v-for="ministry in ministries"
              :key="ministry.id"
              :value="ministry.id"
            >
              {{ ministry.name }}
            </option>
          </select>
        </div>

        <div class="analytics-filters__field analytics-filters__field--inline">
          <span class="analytics-filters__label">Período</span>
          <div class="analytics-filters__chips analytics-filters__chips--nowrap" role="radiogroup" aria-label="Período da análise">
            <button
              v-for="option in rangeOptions"
              :key="option.value"
              type="button"
              class="analytics-filters__chip"
              :class="{ 'analytics-filters__chip--active': range === option.value }"
              role="radio"
              :aria-checked="range === option.value ? 'true' : 'false'"
              @click="setRange(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <div
      v-if="listLoading"
      class="analytics-panels"
      aria-hidden="true"
    >
      <section
        v-for="index in 5"
        :key="index"
        class="repertoire-card"
      >
        <span class="app-skeleton app-skeleton--title" />
        <span class="app-skeleton app-skeleton--description" />
        <span class="app-skeleton app-skeleton--description" />
      </section>
    </div>

    <p
      v-else-if="!ministryId"
      class="description"
    >
      Selecione um ministério para visualizar os indicadores.
    </p>

    <div
      v-else-if="analytics"
      class="analytics-panels"
    >
      <section class="repertoire-card analytics-panel--unique">
        <div class="repertoire-card__title-row">
          <h2>Pessoas distintas ao longo do tempo</h2>
        </div>
        <p class="description analytics-panel__hint">
          Quantidade de pessoas diferentes que participaram de escalas em cada mês.
        </p>
        <div class="analytics-chart-wrap">
          <Line
            :data="uniquePeopleChartData"
            :options="lineChartOptions"
          />
        </div>
      </section>

      <section class="repertoire-card analytics-panel--ranking">
        <div class="repertoire-card__title-row">
          <h2>Ranking de participação</h2>
          <span class="repertoire-badge repertoire-badge--campfire">{{ visibleRanking.length }} pessoas</span>
        </div>
        <p class="description analytics-panel__hint">
          Pessoas que mais participaram de escalas no período. Ajuste o slider para mostrar mais ou menos nomes.
        </p>
        <div class="analytics-ranking-slider">
          <label
            class="analytics-filters__label"
            for="analytics-ranking-limit"
          >
            Exibir até {{ rankingVisibleCount }} pessoa{{ rankingVisibleCount === 1 ? '' : 's' }}
          </label>
          <input
            id="analytics-ranking-limit"
            v-model.number="rankingVisibleCount"
            class="analytics-slider analytics-slider--campfire"
            type="range"
            min="1"
            :max="rankingSliderMax"
            step="1"
          >
        </div>
        <div class="analytics-chart-wrap analytics-chart-wrap--ranking">
          <Bar
            :data="rankingChartData"
            :options="rankingChartOptions"
          />
        </div>
      </section>

      <section class="repertoire-card analytics-panel--newcomers">
        <div class="repertoire-card__title-row">
          <h2>Pessoas novas</h2>
          <span class="repertoire-badge repertoire-badge--grapevine">{{ analytics.newcomersCount }}</span>
        </div>
        <p class="description analytics-panel__hint">
          Pessoas cuja primeira participação neste ministério ocorreu no período selecionado.
        </p>
        <div
          v-if="analytics.newcomers.length === 0"
          class="description"
        >
          Nenhuma pessoa nova no período.
        </div>
        <div
          v-else
          class="analytics-timeline-wrap"
        >
          <div class="analytics-timeline">
            <div class="analytics-timeline__axis" aria-hidden="true" />
            <div
              v-for="tick in timelineMonthTicks"
              :key="`mark-${tick.key}`"
              class="analytics-timeline__tick"
              :style="{ left: `${tick.offsetPercent}%` }"
              aria-hidden="true"
            >
              <span class="analytics-timeline__tick-mark" />
            </div>
            <div
              v-for="(person, index) in newcomersTimeline"
              :key="person.personId"
              class="analytics-timeline__item"
              :class="{ 'analytics-timeline__item--below': index % 2 === 1 }"
              :style="{
                left: `${person.offsetPercent}%`,
                animationDelay: `${-(index * 0.7) % 5}s`,
                animationDuration: `${5 + (index % 3) * 0.4}s`
              }"
              :title="`${person.personName} — ${formatOptionalDate(person.firstParticipationDate)}`"
            >
              <span class="analytics-timeline__name">{{ person.personName }}</span>
              <span class="analytics-timeline__dot" aria-hidden="true" />
              <span class="analytics-timeline__date">{{ formatOptionalDate(person.firstParticipationDate) }}</span>
            </div>
          </div>
          <div class="analytics-timeline__months" aria-hidden="true">
            <span
              v-for="tick in timelineMonthTicks"
              :key="`label-${tick.key}`"
              class="analytics-timeline__month-label"
              :style="{ left: `${tick.offsetPercent}%` }"
            >
              {{ tick.label }}
            </span>
          </div>
          <div class="analytics-timeline__legend">
            <span>{{ formatOptionalDate(timelineBounds.start) }}</span>
            <span>{{ formatOptionalDate(timelineBounds.end) }}</span>
          </div>
        </div>
      </section>

      <section class="repertoire-card analytics-panel--inactive">
        <div class="repertoire-card__title-row">
          <h2>Pessoas sem escala</h2>
          <span class="repertoire-badge repertoire-badge--earth">{{ analytics.inactivePeople.length }}</span>
        </div>
        <p class="description analytics-panel__hint">
          Membros do ministério que não participaram de nenhuma escala no período de ausência definido.
        </p>
        <div class="analytics-filters__field analytics-filters__field--inline analytics-panel__absence">
          <span class="analytics-filters__label">Ausência (sem escala)</span>
          <div class="analytics-filters__chips" role="radiogroup" aria-label="Período de ausência">
            <button
              v-for="option in absenceOptions"
              :key="option.value"
              type="button"
              class="analytics-filters__chip"
              :class="{ 'analytics-filters__chip--active': absencePeriod === option.value }"
              role="radio"
              :aria-checked="absencePeriod === option.value ? 'true' : 'false'"
              @click="setAbsencePeriod(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <div
          v-if="inactiveLoading"
          class="analytics-inactive-loading"
          aria-hidden="true"
        >
          <span class="app-skeleton app-skeleton--description" />
          <span class="app-skeleton app-skeleton--description" />
        </div>
        <div
          v-else-if="analytics.inactivePeople.length === 0"
          class="description"
        >
          Todos os membros ativos participaram no período de ausência.
        </div>
        <div
          v-else
          class="analytics-table-wrap"
        >
          <table class="analytics-table analytics-table--inactive">
            <colgroup>
              <col class="analytics-table__col-person">
              <col class="analytics-table__col-last">
              <col class="analytics-table__col-days">
            </colgroup>
            <thead>
              <tr>
                <th>Pessoa</th>
                <th class="analytics-table__cell--last">Última escala</th>
                <th class="analytics-table__cell--days">Dias sem servir</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="person in analytics.inactivePeople"
                :key="person.personId"
              >
                <td>{{ person.personName }}</td>
                <td class="analytics-table__cell--last">{{ formatOptionalDate(person.lastParticipationDate) }}</td>
                <td class="analytics-table__cell--days">{{ person.daysSinceLastParticipation }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="repertoire-card analytics-panel--heatmap">
        <div class="repertoire-card__title-row">
          <h2>Heatmap de presença</h2>
        </div>
        <p class="description analytics-panel__hint">
          Meses no eixo horizontal e pessoas no vertical. Intensidade indica quantas escalas a pessoa esteve no mês.
        </p>
        <div
          v-if="analytics.heatmapPeople.length === 0 || analytics.heatmapMonths.length === 0"
          class="description"
        >
          Sem dados de presença para montar o heatmap.
        </div>
        <div
          v-else
          class="analytics-heatmap-wrap"
        >
          <table
            class="analytics-heatmap"
            :style="{ '--heatmap-months': analytics.heatmapMonths.length }"
          >
            <thead>
              <tr>
                <th class="analytics-heatmap__corner">Pessoa</th>
                <th
                  v-for="month in analytics.heatmapMonths"
                  :key="month.monthKey"
                  class="analytics-heatmap__month"
                  :title="month.monthStart"
                >
                  {{ month.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="person in analytics.heatmapPeople"
                :key="person.personId"
              >
                <th scope="row" class="analytics-heatmap__person">
                  {{ person.personName }}
                </th>
                <td
                  v-for="month in analytics.heatmapMonths"
                  :key="`${person.personId}-${month.monthKey}`"
                  class="analytics-heatmap__cell"
                  :class="{
                    'analytics-heatmap__cell--active': heatmapCount(person.personId, month.monthKey) > 0
                  }"
                  :style="heatmapCellStyle(person.personId, month.monthKey)"
                  @mouseenter="showHeatmapTooltip($event, person.personName, month, person.personId)"
                  @mousemove="moveHeatmapTooltip"
                  @mouseleave="hideHeatmapTooltip"
                />
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <div
        v-if="heatmapTooltip.visible"
        class="analytics-heatmap-tooltip"
        :style="{
          left: `${heatmapTooltip.x}px`,
          top: `${heatmapTooltip.y}px`
        }"
        role="tooltip"
      >
        <strong class="analytics-heatmap-tooltip__title">{{ heatmapTooltip.personName }}</strong>
        <span class="analytics-heatmap-tooltip__line">{{ heatmapTooltip.monthLabel }}</span>
        <span class="analytics-heatmap-tooltip__line analytics-heatmap-tooltip__line--emphasis">
          {{ heatmapTooltip.countLabel }}
        </span>
      </div>
    </Teleport>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { UsersRoundIcon } from '@lucide/vue'
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type TooltipItem
} from 'chart.js'
import { Bar, Line } from 'vue-chartjs'
import { analyticsService, USE_ENGAGEMENT_ANALYTICS_MOCK } from '@/services/analyticsService'
import { MOCK_ANALYTICS_MINISTRIES } from '@/services/analyticsEngagementMock'
import { ministryService } from '@/services/ministryService'
import { toastService } from '@/services/toastService'
import type {
  AnalyticsAbsencePeriod,
  AnalyticsTimeRange,
  EngagementAnalytics,
  HeatmapMonth
} from '@/types/analytics'
import type { Ministry } from '@/types/people'
import { HttpError } from '@/services/httpClient'

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip
)

;(Tooltip.positioners as unknown as Record<string, unknown>).mouse = function (
  _items: unknown,
  eventPosition: { x: number; y: number }
) {
  return eventPosition
}

const RANGE_OPTIONS: Array<{ value: AnalyticsTimeRange; label: string }> = [
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' },
  { value: '1y', label: '1 ano' },
  { value: '5y', label: '5 anos' },
  { value: 'all', label: 'Todo o tempo' }
]

const ABSENCE_OPTIONS: Array<{ value: AnalyticsAbsencePeriod; label: string }> = [
  { value: '1m', label: 'Mais de 1 mês' },
  { value: '3m', label: 'Mais de 3 meses' },
  { value: '6m', label: 'Mais de 6 meses' },
  { value: '1y', label: 'Mais de 1 ano' }
]

/** Paleta adventista (sem Denim/azul primário das demais views). */
const CHART_THEME = {
  unique: {
    solid: '#3e8391', // Ming
    soft: 'rgba(62, 131, 145, 0.16)',
    grid: 'rgba(62, 131, 145, 0.12)'
  },
  ranking: {
    solid: '#eb8a4a', // Campfire suavizado
    soft: 'rgba(235, 138, 74, 0.2)',
    grid: 'rgba(235, 138, 74, 0.14)'
  },
  newcomers: {
    solid: '#7f264a', // Grapevine
    soft: 'rgba(127, 38, 74, 0.14)'
  },
  inactive: {
    solid: '#5e3929' // Earth
  },
  heatmap: {
    solid: '#7f264a', // Grapevine
    rgb: '127, 38, 74'
  }
} as const

export default defineComponent({
  name: 'EngagementAnalyticsView',
  components: {
    Bar,
    Line,
    UsersRoundIcon
  },
  data() {
    return {
      filtersLoading: true,
      listLoading: false,
      inactiveLoading: false,
      ministries: [] as Ministry[],
      ministryId: 0,
      range: '1y' as AnalyticsTimeRange,
      absencePeriod: '3m' as AnalyticsAbsencePeriod,
      rankingVisibleCount: 10,
      analytics: null as EngagementAnalytics | null,
      rangeOptions: RANGE_OPTIONS,
      absenceOptions: ABSENCE_OPTIONS,
      useMockData: USE_ENGAGEMENT_ANALYTICS_MOCK,
      heatmapTooltip: {
        visible: false,
        x: 0,
        y: 0,
        personName: '',
        monthLabel: '',
        countLabel: ''
      }
    }
  },
  computed: {
    selectedMinistryName(): string {
      return this.ministries.find((item) => item.id === this.ministryId)?.name ?? 'Ministério'
    },
    visibleRanking() {
      if (!this.analytics) {
        return []
      }

      return this.analytics.ranking.slice(0, this.rankingVisibleCount)
    },
    rankingSliderMax(): number {
      const total = this.analytics?.ranking.length ?? 1
      return Math.max(total, 1)
    },
    uniquePeopleChartData(): ChartData<'line'> {
      const points = this.analytics?.uniquePeopleOverTime ?? []

      return {
        labels: points.map((item) => item.label),
        datasets: [
          {
            label: 'Pessoas distintas',
            data: points.map((item) => item.uniquePeopleCount),
            borderColor: CHART_THEME.unique.solid,
            backgroundColor: CHART_THEME.unique.soft,
            fill: true,
            tension: 0.25,
            pointRadius: 4,
            pointHoverRadius: 8,
            pointHitRadius: 16,
            pointBorderWidth: 2,
            pointHoverBorderWidth: 3,
            pointBackgroundColor: CHART_THEME.unique.solid,
            pointBorderColor: '#ffffff',
            pointHoverBackgroundColor: CHART_THEME.unique.solid,
            pointHoverBorderColor: '#ffffff'
          }
        ]
      }
    },
    rankingChartData(): ChartData<'bar'> {
      const items = this.visibleRanking

      return {
        labels: items.map((item) => item.personName),
        datasets: [
          {
            label: 'Participações',
            data: items.map((item) => item.participationCount),
            backgroundColor: CHART_THEME.ranking.solid,
            hoverBackgroundColor: '#f0a06a',
            borderWidth: 0,
            borderSkipped: false
          }
        ]
      }
    },
    lineChartOptions(): ChartOptions<'line'> {
      const points = this.analytics?.uniquePeopleOverTime ?? []

      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest',
          intersect: true,
          axis: 'xy'
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            displayColors: false,
            backgroundColor: '#1a2b3c',
            titleColor: '#ffffff',
            bodyColor: '#e8eef4',
            titleFont: {
              family: 'Noto Sans, sans-serif',
              size: 12,
              weight: 700
            },
            bodyFont: {
              family: 'Noto Sans, sans-serif',
              size: 12,
              weight: 500
            },
            padding: 12,
            cornerRadius: 0,
            caretSize: 6,
            caretPadding: 8,
            callbacks: {
              title(tooltipItems) {
                const label = tooltipItems[0]?.label
                return label ? String(label) : ''
              },
              label(tooltipItem) {
                const total = tooltipItem.parsed.y ?? 0
                const suffix = total === 1 ? 'pessoa distinta' : 'pessoas distintas'
                return `Total: ${total} ${suffix}`
              },
              afterBody(tooltipItems) {
                const dataIndex = tooltipItems[0]?.dataIndex

                if (dataIndex == null) {
                  return []
                }

                const names = points[dataIndex]?.personNames ?? []

                if (names.length === 0) {
                  return []
                }

                return ['', ...names.map((name) => `• ${name}`)]
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: CHART_THEME.unique.grid }
          },
          x: {
            grid: { display: false }
          }
        },
        animations: {
          colors: {
            duration: 200
          },
          radius: {
            duration: 180,
            easing: 'easeOutQuad'
          }
        }
      }
    },
    rankingChartOptions(): ChartOptions<'bar'> {
      return {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest',
          intersect: true,
          axis: 'y'
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            displayColors: false,
            position: 'mouse' as 'average',
            backgroundColor: '#1a2b3c',
            titleColor: '#ffffff',
            bodyColor: '#e8eef4',
            titleFont: {
              family: 'Noto Sans, sans-serif',
              size: 12,
              weight: 700
            },
            bodyFont: {
              family: 'Noto Sans, sans-serif',
              size: 13,
              weight: 600
            },
            padding: 12,
            cornerRadius: 0,
            caretSize: 0,
            caretPadding: 8,
            callbacks: {
              title(tooltipItems: TooltipItem<'bar'>[]) {
                const label = tooltipItems[0]?.label
                return label ? String(label) : ''
              },
              label(tooltipItem: TooltipItem<'bar'>) {
                const total = tooltipItem.parsed.x ?? 0
                const suffix = total === 1 ? 'participação' : 'participações'
                return `Total: ${total} ${suffix}`
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: CHART_THEME.ranking.grid }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    },
    heatmapMaxCount(): number {
      if (!this.analytics) {
        return 1
      }

      const max = this.analytics.heatmapCells.reduce(
        (current, cell) => Math.max(current, cell.participationCount),
        0
      )

      return Math.max(max, 1)
    },
    timelineBounds(): { start: string; end: string } {
      if (!this.analytics || this.analytics.newcomers.length === 0) {
        return {
          start: this.analytics?.rangeStart ?? this.analytics?.rangeEnd ?? '',
          end: this.analytics?.rangeEnd ?? ''
        }
      }

      const dates = this.analytics.newcomers.map((item) => item.firstParticipationDate)
      const start = this.analytics.rangeStart
        ?? dates.reduce((min, value) => (value < min ? value : min), dates[0])
      const end = this.analytics.rangeEnd
        || dates.reduce((max, value) => (value > max ? value : max), dates[0])

      return { start, end }
    },
    timelineMonthTicks(): Array<{ key: string; label: string; offsetPercent: number }> {
      if (!this.timelineBounds.start || !this.timelineBounds.end) {
        return []
      }

      const start = new Date(`${this.timelineBounds.start}T00:00:00`)
      const end = new Date(`${this.timelineBounds.end}T00:00:00`)
      const startMs = start.getTime()
      const endMs = end.getTime()
      const span = Math.max(endMs - startMs, 1)

      const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
      if (cursor < start) {
        cursor.setMonth(cursor.getMonth() + 1)
      }

      const ticks: Array<{ key: string; label: string; offsetPercent: number }> = []

      while (cursor <= end) {
        const offsetPercent = ((cursor.getTime() - startMs) / span) * 100
        const label = cursor.toLocaleDateString('pt-BR', {
          month: 'short',
          year: cursor.getFullYear() !== end.getFullYear() || cursor.getFullYear() !== start.getFullYear()
            ? '2-digit'
            : undefined
        }).replace('.', '')

        ticks.push({
          key: `${cursor.getFullYear()}-${cursor.getMonth() + 1}`,
          label,
          offsetPercent: Math.min(100, Math.max(0, offsetPercent))
        })

        cursor.setMonth(cursor.getMonth() + 1)
      }

      return ticks
    },
    newcomersTimeline() {
      if (!this.analytics) {
        return []
      }

      const startMs = new Date(`${this.timelineBounds.start}T00:00:00`).getTime()
      const endMs = new Date(`${this.timelineBounds.end}T00:00:00`).getTime()
      const span = Math.max(endMs - startMs, 1)

      return this.analytics.newcomers.map((person) => {
        const dateMs = new Date(`${person.firstParticipationDate}T00:00:00`).getTime()
        const rawPercent = ((dateMs - startMs) / span) * 100
        const offsetPercent = Math.min(96, Math.max(4, rawPercent))

        return {
          ...person,
          offsetPercent
        }
      })
    }
  },
  async mounted() {
    await this.loadMinistries()
    this.filtersLoading = false

    if (this.ministryId > 0) {
      await this.loadAnalytics()
    }
  },
  methods: {
    async loadMinistries() {
      if (this.useMockData) {
        this.ministries = MOCK_ANALYTICS_MINISTRIES
        this.ministryId = this.ministries[0]?.id ?? 0
        return
      }

      try {
        const response = await ministryService.list()
        this.ministries = (response.payload ?? []).filter((item) => item.isActive)

        if (this.ministries.length > 0 && this.ministryId <= 0) {
          this.ministryId = this.ministries[0].id
        }
      } catch (error) {
        const message = error instanceof HttpError
          ? error.message
          : 'Não foi possível carregar os ministérios.'
        toastService.error(message)
      }
    },

    setRange(value: AnalyticsTimeRange) {
      if (this.range === value) {
        return
      }

      this.range = value
      void this.loadAnalytics()
    },

    setAbsencePeriod(value: AnalyticsAbsencePeriod) {
      if (this.absencePeriod === value) {
        return
      }

      this.absencePeriod = value
      void this.loadInactivePeople()
    },

    async loadInactivePeople() {
      if (this.ministryId <= 0 || !this.analytics) {
        return
      }

      this.inactiveLoading = true

      try {
        const response = await analyticsService.getInactivePeople({
          ministryId: this.ministryId,
          absencePeriod: this.absencePeriod,
          range: this.range,
          ministryName: this.selectedMinistryName
        })

        this.analytics = {
          ...this.analytics,
          inactivePeople: response.payload
        }
      } catch (error) {
        console.error('[Engajamento] Falha ao carregar pessoas sem escala', error)
        const message = error instanceof HttpError
          ? error.message
          : 'Não foi possível atualizar as pessoas sem escala.'
        toastService.error(message)
      } finally {
        this.inactiveLoading = false
      }
    },

    async loadAnalytics() {
      if (this.ministryId <= 0) {
        this.analytics = null
        return
      }

      this.listLoading = true

      try {
        const response = await analyticsService.getEngagement({
          ministryId: this.ministryId,
          range: this.range,
          absencePeriod: this.absencePeriod,
          rankingLimit: 50,
          ministryName: this.selectedMinistryName
        })

        if (!response.payload) {
          this.analytics = null
          return
        }

        this.analytics = response.payload
        this.rankingVisibleCount = Math.min(
          Math.max(this.rankingVisibleCount, 1),
          Math.max(this.analytics.ranking.length, 1)
        )
      } catch (error) {
        console.error('[Engajamento] Falha ao carregar análises', error)
        this.analytics = null
        const message = error instanceof HttpError
          ? error.message
          : 'Não foi possível carregar as análises de engajamento.'
        toastService.error(message)
      } finally {
        this.listLoading = false
      }
    },

    heatmapCount(personId: number, monthKey: string): number {
      if (!this.analytics) {
        return 0
      }

      const cell = this.analytics.heatmapCells.find(
        (item) => item.personId === personId && item.monthKey === monthKey
      )

      return cell?.participationCount ?? 0
    },

    heatmapCellStyle(personId: number, monthKey: string): Record<string, string> {
      const count = this.heatmapCount(personId, monthKey)

      if (count <= 0) {
        return { background: '#f3f6f9' }
      }

      const intensity = Math.min(count / this.heatmapMaxCount, 1)
      const alpha = 0.18 + intensity * 0.72

      return {
        background: `rgba(${CHART_THEME.heatmap.rgb}, ${alpha.toFixed(2)})`
      }
    },

    showHeatmapTooltip(
      event: MouseEvent,
      personName: string,
      month: HeatmapMonth,
      personId: number
    ): void {
      const count = this.heatmapCount(personId, month.monthKey)
      const monthDate = this.formatOptionalDate(month.monthStart)
      const countLabel = count === 1
        ? '1 escala neste mês'
        : `${count} escalas neste mês`

      this.heatmapTooltip = {
        visible: true,
        x: event.clientX + 14,
        y: event.clientY + 14,
        personName,
        monthLabel: `${month.label} · ${monthDate}`,
        countLabel
      }
    },

    moveHeatmapTooltip(event: MouseEvent): void {
      if (!this.heatmapTooltip.visible) {
        return
      }

      this.heatmapTooltip.x = event.clientX + 14
      this.heatmapTooltip.y = event.clientY + 14
    },

    hideHeatmapTooltip(): void {
      this.heatmapTooltip.visible = false
    },

    formatOptionalDate(value: string | null): string {
      if (!value) {
        return 'Nunca'
      }

      const date = new Date(`${value}T00:00:00`)

      if (Number.isNaN(date.getTime())) {
        return value
      }

      return date.toLocaleDateString('pt-BR')
    }
  }
})
</script>
