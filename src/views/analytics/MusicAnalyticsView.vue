<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <MusicIcon :size="20" />
          </span>
          <h1>Músicas</h1>
        </div>
        <p class="description repertoire-page__header-description">
          Indicadores de uso do repertório nas escalas (apenas eventos já ocorridos).
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
              :aria-checked="range === option.value"
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
        v-for="index in 8"
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
      <section class="repertoire-card analytics-panel--ranking">
        <div class="repertoire-card__title-row">
          <h2>Mais tocadas</h2>
          <span class="repertoire-badge repertoire-badge--campfire">
            {{ visibleMostPlayed.length }} música{{ visibleMostPlayed.length === 1 ? '' : 's' }}
          </span>
        </div>
        <p class="description analytics-panel__hint">
          Ranking das músicas com mais execuções nas escalas do período. Ajuste o slider para mostrar mais ou menos itens.
        </p>
        <div
          v-if="analytics.mostPlayed.length === 0"
          class="description"
        >
          Sem execuções no período.
        </div>
        <template v-else>
          <div class="analytics-ranking-slider">
            <label
              class="analytics-filters__label"
              for="music-most-played-limit"
            >
              Exibir até {{ mostPlayedVisibleCount }} música{{ mostPlayedVisibleCount === 1 ? '' : 's' }}
            </label>
            <input
              id="music-most-played-limit"
              v-model.number="mostPlayedVisibleCount"
              class="analytics-slider analytics-slider--campfire"
              type="range"
              min="1"
              :max="mostPlayedSliderMax"
              step="1"
            >
          </div>
          <div class="analytics-chart-wrap analytics-chart-wrap--ranking">
            <Bar
              :data="mostPlayedChartData"
              :options="rankingChartOptions"
            />
          </div>
        </template>
      </section>

      <section class="repertoire-card analytics-panel--ranking">
        <div class="repertoire-card__title-row">
          <h2>Menos tocadas</h2>
          <span class="repertoire-badge repertoire-badge--ming">
            {{ visibleLeastPlayed.length }} música{{ visibleLeastPlayed.length === 1 ? '' : 's' }}
          </span>
        </div>
        <p class="description analytics-panel__hint">
          Músicas do catálogo com menos (ou nenhuma) execução no período. Ajuste o slider para mostrar mais ou menos itens.
        </p>
        <div
          v-if="analytics.leastPlayed.length === 0"
          class="description"
        >
          Sem dados para o ranking.
        </div>
        <template v-else>
          <div class="analytics-ranking-slider">
            <label
              class="analytics-filters__label"
              for="music-least-played-limit"
            >
              Exibir até {{ leastPlayedVisibleCount }} música{{ leastPlayedVisibleCount === 1 ? '' : 's' }}
            </label>
            <input
              id="music-least-played-limit"
              v-model.number="leastPlayedVisibleCount"
              class="analytics-slider analytics-slider--ming"
              type="range"
              min="1"
              :max="leastPlayedSliderMax"
              step="1"
            >
          </div>
          <div class="analytics-chart-wrap analytics-chart-wrap--ranking">
            <Bar
              :data="leastPlayedChartData"
              :options="leastPlayedChartOptions"
            />
          </div>
        </template>
      </section>

      <section class="repertoire-card">
        <div class="repertoire-card__title-row">
          <h2>Músicas esquecidas</h2>
          <span class="repertoire-badge repertoire-badge--grapevine">{{ analytics.forgottenSongs.length }}</span>
        </div>
        <p class="description analytics-panel__hint">
          Última execução e tempo sem tocar, conforme o filtro de esquecimento.
        </p>
        <div class="analytics-filters__field analytics-filters__field--inline analytics-panel__absence">
          <span class="analytics-filters__label">Esquecidas (sem uso)</span>
          <div class="analytics-filters__chips" role="radiogroup" aria-label="Período de esquecimento">
            <button
              v-for="option in forgottenOptions"
              :key="option.value"
              type="button"
              class="analytics-filters__chip"
              :class="{ 'analytics-filters__chip--active': forgottenPeriod === option.value }"
              role="radio"
              :aria-checked="forgottenPeriod === option.value"
              @click="setForgottenPeriod(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <div
          v-if="forgottenLoading"
          class="analytics-inactive-loading"
          aria-hidden="true"
        >
          <span class="app-skeleton app-skeleton--description" />
          <span class="app-skeleton app-skeleton--description" />
        </div>
        <div
          v-else-if="analytics.forgottenSongs.length === 0"
          class="description"
        >
          Nenhuma música esquecida neste critério.
        </div>
        <div
          v-else
          class="analytics-table-wrap"
        >
          <table class="analytics-table analytics-table--inactive">
            <thead>
              <tr>
                <th>Música</th>
                <th class="analytics-table__cell--last">Última execução</th>
                <th class="analytics-table__cell--days">Dias sem tocar</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="song in analytics.forgottenSongs"
                :key="song.repertoireId"
              >
                <td>
                  <strong>{{ song.songName }}</strong>
                  <span
                    v-if="song.author"
                    class="analytics-table__sub"
                  >{{ song.author }}</span>
                </td>
                <td class="analytics-table__cell--last">{{ formatOptionalDate(song.lastPlayedDate) }}</td>
                <td class="analytics-table__cell--days">{{ song.daysSinceLastPlayed }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section
        v-for="panel in distributionPanels"
        :key="panel.key"
        class="repertoire-card"
      >
        <div class="repertoire-card__title-row">
          <h2>{{ panel.title }}</h2>
        </div>
        <p class="description analytics-panel__hint">{{ panel.hint }}</p>
        <div
          v-if="panel.series.length === 0"
          class="description"
        >
          Sem dados no período selecionado.
        </div>
        <div
          v-else
          class="analytics-chart-block"
        >
          <div class="analytics-chart-wrap">
            <Line
              :data="buildChartData(panel.series, panel.hiddenKeys)"
              :options="multiLineChartOptions"
            />
          </div>
          <div
            class="analytics-series-legend"
            role="group"
            :aria-label="panel.legendLabel"
          >
            <button
              v-for="(series, index) in panel.series"
              :key="series.seriesKey"
              type="button"
              class="analytics-series-legend__item"
              :class="{ 'analytics-series-legend__item--off': panel.hiddenKeys.includes(series.seriesKey) }"
              :aria-pressed="!panel.hiddenKeys.includes(series.seriesKey)"
              @click="toggleSeries(panel.key, series.seriesKey)"
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

      <section class="repertoire-card">
        <div class="repertoire-card__title-row">
          <h2>Intervalo médio entre execuções</h2>
        </div>
        <p class="description analytics-panel__hint">
          Média de dias entre execuções distintas da mesma música no período (mínimo 2 execuções).
        </p>
        <div
          v-if="analytics.averageIntervals.length > 0"
          class="analytics-filters__field analytics-filters__field--inline analytics-panel__absence"
        >
          <span class="analytics-filters__label">Ordenar por</span>
          <div class="analytics-filters__chips" role="radiogroup" aria-label="Ordenação do intervalo médio">
            <button
              v-for="option in intervalSortOptions"
              :key="option.value"
              type="button"
              class="analytics-filters__chip analytics-filters__chip--with-icon"
              :class="{ 'analytics-filters__chip--active': intervalSort === option.value }"
              role="radio"
              :aria-checked="intervalSort === option.value"
              @click="intervalSort = option.value"
            >
              <component
                :is="option.icon"
                class="analytics-filters__chip-icon"
                :size="15"
                aria-hidden="true"
              />
              <span>{{ option.label }}</span>
            </button>
          </div>
        </div>
        <div
          v-if="analytics.averageIntervals.length === 0"
          class="description"
        >
          Nenhuma música com execuções suficientes para calcular o intervalo.
        </div>
        <div
          v-else
          class="analytics-table-wrap"
        >
          <table class="analytics-table">
            <thead>
              <tr>
                <th>Música</th>
                <th>Autor</th>
                <th class="analytics-table__cell--days">Execuções</th>
                <th class="analytics-table__cell--days">Média (dias)</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="song in sortedAverageIntervals"
                :key="song.repertoireId"
              >
                <td>{{ song.songName }}</td>
                <td>{{ song.author || '—' }}</td>
                <td class="analytics-table__cell--days">{{ song.playCount }}</td>
                <td class="analytics-table__cell--days">{{ formatInterval(song.averageDaysBetweenPlays) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="repertoire-card analytics-panel--heatmap">
        <div class="repertoire-card__title-row">
          <h2>Heatmap de uso</h2>
        </div>
        <p class="description analytics-panel__hint">
          Meses no eixo horizontal e músicas no vertical. Intensidade indica quantas vezes a música foi escalada no mês.
        </p>
        <div
          v-if="analytics.heatmapSongs.length === 0 || analytics.heatmapMonths.length === 0"
          class="description"
        >
          Sem dados de uso para montar o heatmap.
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
                <th class="analytics-heatmap__corner">Música</th>
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
                v-for="song in analytics.heatmapSongs"
                :key="song.repertoireId"
              >
                <th scope="row" class="analytics-heatmap__person">
                  {{ song.songName }}
                </th>
                <td
                  v-for="month in analytics.heatmapMonths"
                  :key="`${song.repertoireId}-${month.monthKey}`"
                  class="analytics-heatmap__cell"
                  :class="{
                    'analytics-heatmap__cell--active': heatmapCount(song.repertoireId, month.monthKey) > 0
                  }"
                  :style="heatmapCellStyle(song.repertoireId, month.monthKey)"
                  @mouseenter="showHeatmapTooltip($event, song.songName, month, song.repertoireId)"
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
        <strong class="analytics-heatmap-tooltip__title">{{ heatmapTooltip.songName }}</strong>
        <span class="analytics-heatmap-tooltip__line">{{ heatmapTooltip.monthLabel }}</span>
        <span class="analytics-heatmap-tooltip__line analytics-heatmap-tooltip__line--emphasis">
          {{ heatmapTooltip.countLabel }}
        </span>
      </div>
    </Teleport>
  </section>
</template>

<script lang="ts">
import { defineComponent, type Component } from 'vue'
import {
  ArrowDownWideNarrowIcon,
  ArrowUpNarrowWideIcon,
  ClockArrowDownIcon,
  ClockArrowUpIcon,
  MusicIcon
} from '@lucide/vue'
import {
  BarController,
  BarElement,
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
import { Bar, Line } from 'vue-chartjs'
import { analyticsService, USE_MUSIC_ANALYTICS_MOCK } from '@/services/analyticsService'
import { toastService } from '@/services/toastService'
import type {
  AnalyticsAbsencePeriod,
  AnalyticsTimeRange,
  EventAnalyticsSeries,
  HeatmapMonth,
  MusicAnalytics,
  MusicInterval
} from '@/types/analytics'
import { HttpError } from '@/services/httpClient'

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip
)

type IntervalSort =
  | 'plays-desc'
  | 'plays-asc'
  | 'days-desc'
  | 'days-asc'

const RANGE_OPTIONS: Array<{ value: AnalyticsTimeRange; label: string }> = [
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' },
  { value: '1y', label: '1 ano' },
  { value: '5y', label: '5 anos' },
  { value: 'all', label: 'Todo o tempo' }
]

const FORGOTTEN_OPTIONS: Array<{ value: AnalyticsAbsencePeriod; label: string }> = [
  { value: '3m', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último ano' }
]

const INTERVAL_SORT_OPTIONS: Array<{
  value: IntervalSort
  label: string
  icon: Component
}> = [
  { value: 'plays-desc', label: 'Mais executadas', icon: ArrowDownWideNarrowIcon },
  { value: 'plays-asc', label: 'Menos executadas', icon: ArrowUpNarrowWideIcon },
  { value: 'days-desc', label: 'Maior intervalo', icon: ClockArrowDownIcon },
  { value: 'days-asc', label: 'Menor intervalo', icon: ClockArrowUpIcon }
]

const SERIES_COLORS = [
  '#3e8391',
  '#eb8a4a',
  '#4b207f',
  '#7f264a',
  '#5e3929',
  '#cf9a5c',
  '#517b22',
  '#2f557f'
] as const

const GRID_COLOR = 'rgba(62, 131, 145, 0.12)'
const HEATMAP_RGB = '127, 38, 74' // Grapevine (mesmo do heatmap de Engajamento)
const MOST_PLAYED_COLOR = '#eb8a4a'
const LEAST_PLAYED_COLOR = '#3e8391'

function seriesColorAt(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length] ?? SERIES_COLORS[0]
}

function buildBarChartOptions(barColor: string, _hoverColor: string): ChartOptions<'bar'> {
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
        caretSize: 6,
        caretPadding: 8,
        callbacks: {
          title(tooltipItems: TooltipItem<'bar'>[]) {
            const label = tooltipItems[0]?.label
            return label ? String(label) : ''
          },
          label(tooltipItem: TooltipItem<'bar'>) {
            const total = tooltipItem.parsed.x ?? 0
            const suffix = total === 1 ? 'execução' : 'execuções'
            return `Total: ${total} ${suffix}`
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: `${barColor}22` }
      },
      y: {
        grid: { display: false }
      }
    }
  }
}

export default defineComponent({
  name: 'MusicAnalyticsView',
  components: {
    Bar,
    Line,
    MusicIcon
  },
  data() {
    return {
      listLoading: false,
      forgottenLoading: false,
      range: '1y' as AnalyticsTimeRange,
      forgottenPeriod: '3m' as AnalyticsAbsencePeriod,
      analytics: null as MusicAnalytics | null,
      rangeOptions: RANGE_OPTIONS,
      forgottenOptions: FORGOTTEN_OPTIONS,
      intervalSortOptions: INTERVAL_SORT_OPTIONS,
      intervalSort: 'days-desc' as IntervalSort,
      useMockData: USE_MUSIC_ANALYTICS_MOCK,
      mostPlayedVisibleCount: 10,
      leastPlayedVisibleCount: 10,
      hiddenThemeKeys: [] as string[],
      hiddenDifficultyKeys: [] as string[],
      hiddenPopularityKeys: [] as string[],
      heatmapTooltip: {
        visible: false,
        x: 0,
        y: 0,
        songName: '',
        monthLabel: '',
        countLabel: ''
      }
    }
  },
  computed: {
    visibleMostPlayed() {
      if (!this.analytics) {
        return []
      }

      return this.analytics.mostPlayed.slice(0, this.mostPlayedVisibleCount)
    },
    visibleLeastPlayed() {
      if (!this.analytics) {
        return []
      }

      return this.analytics.leastPlayed.slice(0, this.leastPlayedVisibleCount)
    },
    mostPlayedSliderMax(): number {
      return Math.max(this.analytics?.mostPlayed.length ?? 1, 1)
    },
    leastPlayedSliderMax(): number {
      return Math.max(this.analytics?.leastPlayed.length ?? 1, 1)
    },
    mostPlayedChartData(): ChartData<'bar'> {
      return {
        labels: this.visibleMostPlayed.map((item) => item.songName),
        datasets: [
          {
            label: 'Execuções',
            data: this.visibleMostPlayed.map((item) => item.playCount),
            backgroundColor: MOST_PLAYED_COLOR,
            hoverBackgroundColor: '#f0a06a',
            borderWidth: 0,
            borderSkipped: false
          }
        ]
      }
    },
    leastPlayedChartData(): ChartData<'bar'> {
      return {
        labels: this.visibleLeastPlayed.map((item) => item.songName),
        datasets: [
          {
            label: 'Execuções',
            data: this.visibleLeastPlayed.map((item) => item.playCount),
            backgroundColor: LEAST_PLAYED_COLOR,
            hoverBackgroundColor: '#5a9eaa',
            borderWidth: 0,
            borderSkipped: false
          }
        ]
      }
    },
    rankingChartOptions(): ChartOptions<'bar'> {
      return buildBarChartOptions(MOST_PLAYED_COLOR, '#f0a06a')
    },
    leastPlayedChartOptions(): ChartOptions<'bar'> {
      return buildBarChartOptions(LEAST_PLAYED_COLOR, '#5a9eaa')
    },
    sortedAverageIntervals(): MusicInterval[] {
      const items = [...(this.analytics?.averageIntervals ?? [])]

      items.sort((a, b) => {
        if (this.intervalSort === 'plays-desc') {
          return b.playCount - a.playCount || a.songName.localeCompare(b.songName, 'pt-BR')
        }

        if (this.intervalSort === 'plays-asc') {
          return a.playCount - b.playCount || a.songName.localeCompare(b.songName, 'pt-BR')
        }

        if (this.intervalSort === 'days-asc') {
          return a.averageDaysBetweenPlays - b.averageDaysBetweenPlays
            || a.songName.localeCompare(b.songName, 'pt-BR')
        }

        return b.averageDaysBetweenPlays - a.averageDaysBetweenPlays
          || a.songName.localeCompare(b.songName, 'pt-BR')
      })

      return items
    },
    distributionPanels() {
      if (!this.analytics) {
        return []
      }

      return [
        {
          key: 'theme' as const,
          title: 'Distribuição por tema musical',
          hint: 'Quantidade de execuções por mês em cada tema do catálogo. Músicas sem tema entram em “Sem tema”.',
          legendLabel: 'Séries por tema',
          series: this.analytics.byTheme,
          hiddenKeys: this.hiddenThemeKeys
        },
        {
          key: 'difficulty' as const,
          title: 'Distribuição por dificuldade',
          hint: 'Quantidade de execuções por mês em cada nível de dificuldade.',
          legendLabel: 'Séries por dificuldade',
          series: this.analytics.byDifficulty,
          hiddenKeys: this.hiddenDifficultyKeys
        },
        {
          key: 'popularity' as const,
          title: 'Distribuição por popularidade',
          hint: 'Quantidade de execuções por mês em cada nível de popularidade.',
          legendLabel: 'Séries por popularidade',
          series: this.analytics.byPopularity,
          hiddenKeys: this.hiddenPopularityKeys
        }
      ]
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
          legend: { display: false },
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
                const suffix = total === 1 ? 'execução' : 'execuções'
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
    },
    heatmapMaxCount(): number {
      if (!this.analytics) {
        return 1
      }

      const max = this.analytics.heatmapCells.reduce(
        (current, cell) => Math.max(current, cell.playCount),
        0
      )

      return Math.max(max, 1)
    }
  },
  mounted() {
    void this.loadAnalytics()
  },
  methods: {
    seriesColor(index: number): string {
      return seriesColorAt(index)
    },

    buildChartData(
      series: EventAnalyticsSeries[],
      hiddenKeys: string[]
    ): ChartData<'line'> {
      const labels = this.analytics?.periods.map((item) => item.label) ?? []
      const hidden = new Set(hiddenKeys)

      return {
        labels,
        datasets: series.map((item, index) => {
          const color = seriesColorAt(index)

          return {
            label: item.label,
            data: item.values,
            borderColor: color,
            backgroundColor: color,
            fill: false,
            tension: 0.25,
            hidden: hidden.has(item.seriesKey),
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
    },

    toggleSeries(
      panelKey: 'theme' | 'difficulty' | 'popularity',
      seriesKey: string
    ): void {
      if (panelKey === 'theme') {
        this.hiddenThemeKeys = this.toggleHiddenKey(this.hiddenThemeKeys, seriesKey)
        return
      }

      if (panelKey === 'difficulty') {
        this.hiddenDifficultyKeys = this.toggleHiddenKey(this.hiddenDifficultyKeys, seriesKey)
        return
      }

      this.hiddenPopularityKeys = this.toggleHiddenKey(this.hiddenPopularityKeys, seriesKey)
    },

    toggleHiddenKey(keys: string[], seriesKey: string): string[] {
      if (keys.includes(seriesKey)) {
        return keys.filter((key) => key !== seriesKey)
      }

      return [...keys, seriesKey]
    },

    setRange(value: AnalyticsTimeRange): void {
      if (this.range === value) {
        return
      }

      this.range = value
      void this.loadAnalytics()
    },

    setForgottenPeriod(value: AnalyticsAbsencePeriod): void {
      if (this.forgottenPeriod === value) {
        return
      }

      this.forgottenPeriod = value
      void this.reloadForgottenSongs()
    },

    async reloadForgottenSongs(): Promise<void> {
      if (!this.analytics) {
        return
      }

      this.forgottenLoading = true

      try {
        const response = await analyticsService.getMusic({
          range: this.range,
          forgottenPeriod: this.forgottenPeriod,
          rankingLimit: 50
        })

        if (!response.payload) {
          return
        }

        this.analytics = {
          ...this.analytics,
          forgottenPeriod: response.payload.forgottenPeriod,
          forgottenSongs: response.payload.forgottenSongs
        }
      } catch (error) {
        console.error('[Músicas] Falha ao atualizar músicas esquecidas', error)
        const message = error instanceof HttpError
          ? error.message
          : 'Não foi possível atualizar as músicas esquecidas.'
        toastService.error(message)
      } finally {
        this.forgottenLoading = false
      }
    },

    async loadAnalytics(): Promise<void> {
      this.listLoading = true

      try {
        const response = await analyticsService.getMusic({
          range: this.range,
          forgottenPeriod: this.forgottenPeriod,
          rankingLimit: 50
        })

        if (!response.payload) {
          this.analytics = null
          return
        }

        this.analytics = response.payload
        this.mostPlayedVisibleCount = Math.min(
          Math.max(this.mostPlayedVisibleCount, 1),
          Math.max(this.analytics.mostPlayed.length, 1)
        )
        this.leastPlayedVisibleCount = Math.min(
          Math.max(this.leastPlayedVisibleCount, 1),
          Math.max(this.analytics.leastPlayed.length, 1)
        )
        this.hiddenThemeKeys = []
        this.hiddenDifficultyKeys = []
        this.hiddenPopularityKeys = []
      } catch (error) {
        console.error('[Músicas] Falha ao carregar análises', error)
        this.analytics = null
        const message = error instanceof HttpError
          ? error.message
          : 'Não foi possível carregar as análises de músicas.'
        toastService.error(message)
      } finally {
        this.listLoading = false
      }
    },

    heatmapCount(repertoireId: number, monthKey: string): number {
      if (!this.analytics) {
        return 0
      }

      const cell = this.analytics.heatmapCells.find(
        (item) => item.repertoireId === repertoireId && item.monthKey === monthKey
      )

      return cell?.playCount ?? 0
    },

    heatmapCellStyle(repertoireId: number, monthKey: string): Record<string, string> {
      const count = this.heatmapCount(repertoireId, monthKey)

      if (count <= 0) {
        return { background: '#f3f6f9' }
      }

      const intensity = Math.min(count / this.heatmapMaxCount, 1)
      const alpha = 0.18 + intensity * 0.72

      return {
        background: `rgba(${HEATMAP_RGB}, ${alpha.toFixed(2)})`
      }
    },

    showHeatmapTooltip(
      event: MouseEvent,
      songName: string,
      month: HeatmapMonth,
      repertoireId: number
    ): void {
      const count = this.heatmapCount(repertoireId, month.monthKey)
      const monthDate = this.formatOptionalDate(month.monthStart)
      const countLabel = count === 1
        ? '1 execução neste mês'
        : `${count} execuções neste mês`

      this.heatmapTooltip = {
        visible: true,
        x: event.clientX + 14,
        y: event.clientY + 14,
        songName,
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
    },

    formatInterval(value: number): string {
      return value.toLocaleString('pt-BR', {
        minimumFractionDigits: value % 1 === 0 ? 0 : 1,
        maximumFractionDigits: 1
      })
    }
  }
})
</script>
