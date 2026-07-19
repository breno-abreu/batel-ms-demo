<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <CalendarDaysIcon :size="20" />
          </span>
          <h1>Eventos</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Distribuição de eventos ocorridos por tipo e por ministério ao longo do tempo.
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

      <div class="analytics-filters">
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
        v-for="index in 2"
        :key="index"
        class="repertoire-card"
      >
        <span class="app-skeleton app-skeleton--title" />
        <span class="app-skeleton app-skeleton--description" />
        <span class="app-skeleton app-skeleton--description" />
      </section>
    </div>

    <div
      v-else-if="analytics"
      class="analytics-panels"
    >
      <section class="repertoire-card analytics-panel--event-type">
        <div class="repertoire-card__title-row">
          <h2>Distribuição por tipo</h2>
        </div>
        <p class="description analytics-panel__hint">
          Quantidade de eventos por mês em cada tipo. Inclui a série “Sem tipo” quando o tipo estiver vazio.
        </p>
        <div
          v-if="analytics.byType.length === 0"
          class="description"
        >
          Sem eventos no período selecionado.
        </div>
        <div
          v-else
          class="analytics-chart-block"
        >
          <div class="analytics-chart-wrap">
            <Line
              :data="typeChartData"
              :options="multiLineChartOptions"
            />
          </div>
          <div
            class="analytics-series-legend"
            role="group"
            aria-label="Séries por tipo"
          >
            <button
              v-for="(series, index) in analytics.byType"
              :key="series.seriesKey"
              type="button"
              class="analytics-series-legend__item"
              :class="{ 'analytics-series-legend__item--off': isTypeHidden(series.seriesKey) }"
              :aria-pressed="!isTypeHidden(series.seriesKey)"
              @click="toggleTypeSeries(series.seriesKey)"
            >
              <span
                class="analytics-series-legend__swatch"
                :style="{ '--series-color': seriesColor(index) }"
                aria-hidden="true"
              />
              <span class="analytics-series-legend__label">{{ series.label }}</span>
            </button>
          </div>
        </div>
      </section>

      <section class="repertoire-card analytics-panel--event-ministry">
        <div class="repertoire-card__title-row">
          <h2>Distribuição por ministério</h2>
        </div>
        <p class="description analytics-panel__hint">
          Quantidade de eventos por mês em cada ministério. Eventos sem ministério entram em “Sem ministério”.
        </p>
        <div
          v-if="analytics.byMinistry.length === 0"
          class="description"
        >
          Sem eventos no período selecionado.
        </div>
        <div
          v-else
          class="analytics-chart-block"
        >
          <div class="analytics-chart-wrap">
            <Line
              :data="ministryChartData"
              :options="multiLineChartOptions"
            />
          </div>
          <div
            class="analytics-series-legend"
            role="group"
            aria-label="Séries por ministério"
          >
            <button
              v-for="(series, index) in analytics.byMinistry"
              :key="series.seriesKey"
              type="button"
              class="analytics-series-legend__item"
              :class="{ 'analytics-series-legend__item--off': isMinistryHidden(series.seriesKey) }"
              :aria-pressed="!isMinistryHidden(series.seriesKey)"
              @click="toggleMinistrySeries(series.seriesKey)"
            >
              <span
                class="analytics-series-legend__swatch"
                :style="{ '--series-color': seriesColor(index) }"
                aria-hidden="true"
              />
              <span class="analytics-series-legend__label">{{ series.label }}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CalendarDaysIcon } from '@lucide/vue'
import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartDataset,
  type ChartOptions,
  type TooltipItem
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { analyticsService, USE_EVENT_ANALYTICS_MOCK } from '@/services/analyticsService'
import { toastService } from '@/services/toastService'
import type {
  AnalyticsTimeRange,
  EventAnalytics,
  EventAnalyticsSeries
} from '@/types/analytics'
import { HttpError } from '@/services/httpClient'

Chart.register(
  CategoryScale,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip
)

const RANGE_OPTIONS: Array<{ value: AnalyticsTimeRange; label: string }> = [
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' },
  { value: '1y', label: '1 ano' },
  { value: '5y', label: '5 anos' },
  { value: 'all', label: 'Todo o tempo' }
]

/** Paleta adventista para múltiplas séries (sem priorizar Denim). */
const SERIES_COLORS = [
  '#3e8391', // Ming
  '#eb8a4a', // Campfire
  '#4b207f', // Emperor
  '#7f264a', // Grapevine
  '#5e3929', // Earth
  '#cf9a5c', // Gold suave
  '#517b22', // Moss
  '#2f557f' // Denim (último recurso)
] as const

const GRID_COLOR = 'rgba(62, 131, 145, 0.12)'

function seriesColorAt(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length] ?? SERIES_COLORS[0]
}

function buildMultiLineData(
  labels: string[],
  series: EventAnalyticsSeries[],
  hiddenKeys: string[]
): ChartData<'line'> {
  const hidden = new Set(hiddenKeys)

  return {
    labels,
    datasets: series.map((item, index) => {
      const color = seriesColorAt(index)
      const isHidden = hidden.has(item.seriesKey)

      return {
        label: item.label,
        data: item.values,
        borderColor: color,
        backgroundColor: color,
        fill: false,
        tension: 0.25,
        hidden: isHidden,
        pointRadius: 3,
        pointHoverRadius: 7,
        pointHitRadius: 14,
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#ffffff'
      } satisfies ChartDataset<'line'>
    })
  }
}

export default defineComponent({
  name: 'EventAnalyticsView',
  components: {
    CalendarDaysIcon,
    Line
  },
  data() {
    return {
      listLoading: false,
      range: '1y' as AnalyticsTimeRange,
      analytics: null as EventAnalytics | null,
      rangeOptions: RANGE_OPTIONS,
      useMockData: USE_EVENT_ANALYTICS_MOCK,
      hiddenTypeKeys: [] as string[],
      hiddenMinistryKeys: [] as string[]
    }
  },
  computed: {
    typeChartData(): ChartData<'line'> {
      if (!this.analytics) {
        return { labels: [], datasets: [] }
      }

      return buildMultiLineData(
        this.analytics.periods.map((item) => item.label),
        this.analytics.byType,
        this.hiddenTypeKeys
      )
    },
    ministryChartData(): ChartData<'line'> {
      if (!this.analytics) {
        return { labels: [], datasets: [] }
      }

      return buildMultiLineData(
        this.analytics.periods.map((item) => item.label),
        this.analytics.byMinistry,
        this.hiddenMinistryKeys
      )
    },
    multiLineChartOptions(): ChartOptions<'line'> {
      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            displayColors: true,
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
            filter(tooltipItem) {
              return !tooltipItem.dataset.hidden
            },
            callbacks: {
              label(tooltipItem: TooltipItem<'line'>) {
                const total = tooltipItem.parsed.y ?? 0
                const seriesLabel = tooltipItem.dataset.label ?? 'Série'
                const suffix = total === 1 ? 'evento' : 'eventos'
                return `${seriesLabel}: ${total} ${suffix}`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: GRID_COLOR }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    }
  },
  mounted() {
    void this.loadAnalytics()
  },
  methods: {
    seriesColor(index: number): string {
      return seriesColorAt(index)
    },

    isTypeHidden(seriesKey: string): boolean {
      return this.hiddenTypeKeys.includes(seriesKey)
    },

    isMinistryHidden(seriesKey: string): boolean {
      return this.hiddenMinistryKeys.includes(seriesKey)
    },

    toggleTypeSeries(seriesKey: string): void {
      this.hiddenTypeKeys = this.toggleHiddenKey(this.hiddenTypeKeys, seriesKey)
    },

    toggleMinistrySeries(seriesKey: string): void {
      this.hiddenMinistryKeys = this.toggleHiddenKey(this.hiddenMinistryKeys, seriesKey)
    },

    toggleHiddenKey(keys: string[], seriesKey: string): string[] {
      if (keys.includes(seriesKey)) {
        return keys.filter((key) => key !== seriesKey)
      }

      return [...keys, seriesKey]
    },

    setRange(range: AnalyticsTimeRange): void {
      if (this.range === range) {
        return
      }

      this.range = range
      void this.loadAnalytics()
    },

    async loadAnalytics(): Promise<void> {
      this.listLoading = true

      try {
        const response = await analyticsService.getEvents({
          range: this.range
        })
        this.analytics = response.payload
        this.hiddenTypeKeys = []
        this.hiddenMinistryKeys = []
      } catch (error) {
        console.error('[Eventos] Falha ao carregar análises', error)
        this.analytics = null
        const message = error instanceof HttpError
          ? error.message
          : 'Não foi possível carregar as análises de eventos.'
        toastService.error(message)
      } finally {
        this.listLoading = false
      }
    }
  }
})
</script>
