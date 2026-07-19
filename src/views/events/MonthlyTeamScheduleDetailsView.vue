<template>
  <section class="repertoire-page repertoire-page--wide">
    <header class="repertoire-page__header repertoire-page__header--actions">
      <div>
        <div class="repertoire-page__header-title">
          <span class="repertoire-page__header-icon" aria-hidden="true">
            <CalendarDaysIcon :size="20" />
          </span>
          <h1>Escala</h1>
        </div>
        <p class="description repertoire-page__header-description">
          {{ pageDescription }}
        </p>
      </div>

      <div class="repertoire-page__header-actions">
        <button
          v-if="canManageTeamSchedule"
          type="button"
          class="repertoire-link-button repertoire-link-button--with-icon"
          :disabled="pageLoading || monthlyShareLinkLoading || events.length === 0"
          @click="handleMonthlyShareLink"
        >
          <LinkIcon :size="16" aria-hidden="true" />
          {{ monthlyShareLinkLoading ? 'Preparando link...' : 'Copiar link externo' }}
        </button>

        <button
          type="button"
          class="repertoire-link-button repertoire-link-button--with-icon"
          :disabled="pageLoading || shareImageLoading || events.length === 0"
          @click="handleShareImage"
        >
          <ImageIcon :size="16" aria-hidden="true" />
          {{ shareImageLoading ? 'Exportando...' : 'Exportar escala' }}
        </button>

        <RouterLink
          class="repertoire-link-button repertoire-link-button--ghost repertoire-link-button--with-icon"
          :to="{ name: 'events-schedules' }"
        >
          <ArrowLeftIcon :size="16" aria-hidden="true" />
          Voltar para escalas
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
    </div>

    <div
      v-else
      class="repertoire-details-form"
    >
      <Tabs
        v-model:value="activeTab"
        class="app-tabs"
        :show-navigators="false"
      >
        <TabList>
          <Tab value="assignment">
            <span class="app-tabs__label">
              <UsersIcon :size="16" aria-hidden="true" />
              <span>Escala</span>
              <span class="app-tabs__badge">{{ assignmentCount }}</span>
            </span>
          </Tab>
          <Tab
            v-if="isMusicMinistry"
            value="repertoire"
          >
            <span class="app-tabs__label">
              <MusicIcon :size="16" aria-hidden="true" />
              <span>Repertório</span>
              <span class="app-tabs__badge">{{ repertoireCount }}</span>
            </span>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="assignment">
            <div class="app-tabs__panel app-tabs__panel--monthly-step">
              <section class="repertoire-card monthly-schedule-assignment-card monthly-schedule-step-card">
                <div class="repertoire-card__title-row">
                  <h2>Montar escala</h2>
                  <span class="repertoire-badge">{{ assignmentSummary }}</span>
                </div>

                <p
                  v-if="events.length === 0"
                  class="description monthly-schedule-assignment__hint"
                >
                  Nenhum evento cadastrado na Agenda para este mês. Cadastre os eventos na Agenda antes de montar a escala.
                </p>

                <p
                  v-else
                  class="description monthly-schedule-assignment__hint"
                >
                  {{ eventsSummary }}. Clique no botão de adicionar em uma célula para escolher a pessoa e a função.
                </p>

                <div
                  v-if="ministryMembersLoading"
                  class="monthly-schedule-assignment-table-wrapper"
                  aria-hidden="true"
                >
                  <span class="app-skeleton app-skeleton--description" />
                  <span class="app-skeleton app-skeleton--description" />
                  <span class="app-skeleton app-skeleton--description" />
                </div>

                <MonthlyScheduleAssignmentTable
                  v-else-if="events.length > 0"
                  :events="events"
                  :columns="columns"
                  :assignments="visibleCellAssignments"
                  :can-manage="canManageTeamSchedule"
                  @add-column="addColumn"
                  @remove-column="removeColumn"
                  @open-cell="openAssignModal"
                  @remove-cell="handleAssignmentRemove"
                />

                <AppTooltip
                  v-if="isMusicMinistry && events.length > 0"
                  text="Ir para o repertório"
                  class="monthly-schedule-step-card__nav-tooltip monthly-schedule-step-card__nav-tooltip--next"
                >
                  <button
                    type="button"
                    class="monthly-schedule-step-card__nav-button"
                    aria-label="Ir para o repertório"
                    @click="goToRepertoireTab"
                  >
                    <ArrowRightIcon :size="18" aria-hidden="true" />
                  </button>
                </AppTooltip>
              </section>
            </div>
          </TabPanel>

          <TabPanel
            v-if="isMusicMinistry"
            value="repertoire"
          >
            <div class="app-tabs__panel app-tabs__panel--monthly-step">
              <section class="repertoire-card monthly-schedule-assignment-card monthly-schedule-step-card">
                <div class="repertoire-card__title-row">
                  <h2>Montar repertório</h2>
                  <span class="repertoire-badge">{{ repertoireSummary }}</span>
                </div>

                <p
                  v-if="events.length === 0"
                  class="description monthly-schedule-assignment__hint"
                >
                  Nenhum evento cadastrado na Agenda para este mês. Cadastre os eventos na Agenda antes de montar o repertório.
                </p>

                <p
                  v-else
                  class="description monthly-schedule-assignment__hint"
                >
                  {{ eventsSummary }}. Clique em uma célula para escolher a música ou associe uma pasta — as duas opções são exclusivas por evento.
                </p>

                <MonthlyScheduleRepertoireTable
                  v-if="events.length > 0"
                  :events="events"
                  :repertoires="visibleCellRepertoires"
                  :repertoire-groups="visibleEventRepertoireGroups"
                  :share-loading-event-id="shareLoadingEventId"
                  :can-manage="canManageTeamSchedule"
                  @open-cell="openRepertoireModal"
                  @remove-cell="handleRepertoireRemove"
                  @open-folder="openFolderModal"
                  @view-folder="openFolderSongsModal"
                  @remove-folder="handleFolderRemove"
                  @share-link="handleShareLink"
                />

                <AppTooltip
                  text="Voltar para a escala"
                  class="monthly-schedule-step-card__nav-tooltip monthly-schedule-step-card__nav-tooltip--prev"
                >
                  <button
                    type="button"
                    class="monthly-schedule-step-card__nav-button"
                    aria-label="Voltar para a escala"
                    @click="goToAssignmentTab"
                  >
                    <ArrowLeftIcon :size="18" aria-hidden="true" />
                  </button>
                </AppTooltip>
              </section>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <MonthlyScheduleAssignPersonModal
      v-model="assignModalVisible"
      :people="ministryMembers"
      :excluded-person-ids="excludedPersonIdsForAssignModal"
      :event-label="activeCellEventLabel"
      :initial-assignment="activeCellAssignment"
      @confirm="handleAssignConfirm"
    />

    <RepertoireGroupAddSongsModal
      v-model="repertoireModalVisible"
      title="Adicionar música ao repertório"
      :included-repertoire-ids="includedRepertoireIdsForModal"
      :initial-musical-theme-name="repertoireModalThemeName"
      suppress-add-toast
      @added="handleRepertoireAdded"
    />

    <MonthlyScheduleSelectFolderModal
      v-model="folderModalVisible"
      :event-label="activeFolderEventLabel"
      :initial-folder="activeFolderCell"
      @select="handleFolderSelected"
    />

    <MonthlyScheduleFolderSongsModal
      v-model="folderSongsModalVisible"
      :folder-id="activeFolderCell?.repertoireGroupId ?? null"
      :folder-name="activeFolderCell?.repertoireGroupName ?? ''"
      :event-label="activeFolderEventLabel"
      @change-folder="handleChangeFolderFromSongsModal"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ImageIcon,
  LinkIcon,
  MusicIcon,
  UsersIcon
} from '@lucide/vue'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'
import MonthlyScheduleAssignmentTable from '@/components/events/MonthlyScheduleAssignmentTable.vue'
import MonthlyScheduleRepertoireTable from '@/components/events/MonthlyScheduleRepertoireTable.vue'
import MonthlyScheduleAssignPersonModal from '@/views/events/components/MonthlyScheduleAssignPersonModal.vue'
import MonthlyScheduleFolderSongsModal from '@/views/events/components/MonthlyScheduleFolderSongsModal.vue'
import MonthlyScheduleSelectFolderModal from '@/views/events/components/MonthlyScheduleSelectFolderModal.vue'
import RepertoireGroupAddSongsModal from '@/components/repertoire/RepertoireGroupAddSongsModal.vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import { ministryService } from '@/services/ministryService'
import {
  buildPublicMonthlyTeamScheduleShareUrl,
  buildPublicTeamScheduleShareUrl,
  teamScheduleService
} from '@/services/teamScheduleService'
import { toastService } from '@/services/toastService'
import { useAuthStore } from '@/stores/authStore'
import type { RepertoireListItem } from '@/types/repertoire'
import type {
  MinistryMemberForSchedule,
  MonthlyTeamScheduleAssignment,
  MonthlyTeamScheduleRepertoire,
  MonthlyTeamScheduleRepertoireGroup,
  ScheduleEventItem
} from '@/types/teamSchedules'
import {
  buildMonthlyScheduleShareFilename,
  buildMonthlyScheduleShareImageBlob,
  copyImageBlobToClipboard,
  downloadBlob
} from '@/utils/monthlyScheduleShareImage'
import {
  buildCellAssignmentKey,
  buildRepertoireCellKey,
  clearEventRepertoiresForEvent,
  createMonthlyScheduleColumnId,
  createMonthlyScheduleColumns,
  eventHasRepertoireSlots,
  filterAssignmentsForEvents,
  filterEventRepertoireGroupsForEvents,
  filterRepertoiresForEvents,
  formatEventsSummary,
  formatMonthYearLabel,
  formatScheduleEventLabel,
  getMusicalThemeNameForRepertoireSlot,
  mapCellAssignmentsToMonthlyPayload,
  mapCellRepertoireGroupsToMonthlyPayload,
  mapCellRepertoiresToMonthlyPayload,
  mapMonthlyAssignmentsToCellState,
  mapMonthlyRepertoireGroupsToCellState,
  mapMonthlyRepertoiresToCellState,
  pruneCellAssignments,
  type MonthlyScheduleCellAssignment,
  type MonthlyScheduleColumn,
  type MonthlyScheduleDetailsTab,
  type MonthlyScheduleRepertoireCell,
  type MonthlyScheduleRepertoireGroupCell
} from '@/utils/monthlySchedule'
import { Permissions } from '@/utils/permissions'

export default defineComponent({
  name: 'MonthlyTeamScheduleDetailsView',
  components: {
    AppTooltip,
    ArrowLeftIcon,
    ArrowRightIcon,
    CalendarDaysIcon,
    ImageIcon,
    LinkIcon,
    MonthlyScheduleAssignPersonModal,
    MonthlyScheduleAssignmentTable,
    MonthlyScheduleFolderSongsModal,
    MonthlyScheduleRepertoireTable,
    MonthlyScheduleSelectFolderModal,
    MusicIcon,
    RepertoireGroupAddSongsModal,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    UsersIcon
  },
  data() {
    return {
      pageLoading: true,
      saveLoading: false,
      shareImageLoading: false,
      monthlyShareLinkLoading: false,
      ministryMembersLoading: false,
      ministryId: 0,
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      ministryName: '',
      isMusicMinistry: false,
      events: [] as ScheduleEventItem[],
      ministryMembers: [] as MinistryMemberForSchedule[],
      activeTab: 'assignment' as MonthlyScheduleDetailsTab,
      columns: createMonthlyScheduleColumns() as MonthlyScheduleColumn[],
      cellAssignments: {} as Record<string, MonthlyScheduleCellAssignment>,
      cellRepertoires: {} as Record<string, MonthlyScheduleRepertoireCell>,
      eventRepertoireGroups: {} as Record<number, MonthlyScheduleRepertoireGroupCell>,
      assignModalVisible: false,
      repertoireModalVisible: false,
      folderModalVisible: false,
      folderSongsModalVisible: false,
      shareLoadingEventId: null as number | null,
      activeCell: null as { eventId: number; columnId: string } | null,
      activeRepertoireCell: null as { eventId: number; displayOrder: number } | null,
      activeFolderEventId: null as number | null
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    canManageTeamSchedule(): boolean {
      return this.authStore.hasPermission(Permissions.TeamSchedulesManage)
    },
    eventIds(): number[] {
      return this.events.map((event) => event.eventId)
    },
    monthYearLabel(): string {
      return formatMonthYearLabel(this.selectedYear, this.selectedMonth)
    },
    pageDescription(): string {
      return this.ministryName
        ? `${this.ministryName} — ${this.monthYearLabel}`
        : this.monthYearLabel
    },
    eventsSummary(): string {
      return formatEventsSummary(this.events)
    },
    assignmentCount(): number {
      return Object.keys(this.visibleCellAssignments).length
    },
    assignmentSummary(): string {
      const filledCells = this.assignmentCount

      if (filledCells === 0) {
        return 'Nenhuma pessoa definida'
      }

      if (filledCells === 1) {
        return '1 pessoa definida'
      }

      return `${filledCells} pessoas definidas`
    },
    visibleCellAssignments(): Record<string, MonthlyScheduleCellAssignment> {
      return filterAssignmentsForEvents(this.cellAssignments, this.eventIds)
    },
    repertoireCount(): number {
      return Object.keys(this.visibleCellRepertoires).length
        + Object.keys(this.visibleEventRepertoireGroups).length
    },
    repertoireSummary(): string {
      const filledCells = this.repertoireCount

      if (filledCells === 0) {
        return 'Nenhum item definido'
      }

      if (filledCells === 1) {
        return '1 item definido'
      }

      return `${filledCells} itens definidos`
    },
    visibleCellRepertoires(): Record<string, MonthlyScheduleRepertoireCell> {
      return filterRepertoiresForEvents(this.cellRepertoires, this.eventIds)
    },
    visibleEventRepertoireGroups(): Record<number, MonthlyScheduleRepertoireGroupCell> {
      return filterEventRepertoireGroupsForEvents(this.eventRepertoireGroups, this.eventIds)
    },
    includedRepertoireIdsForModal(): Set<number> {
      if (!this.activeRepertoireCell) {
        return new Set()
      }

      const activeEventId = this.activeRepertoireCell.eventId
      const activeKey = buildRepertoireCellKey(
        activeEventId,
        this.activeRepertoireCell.displayOrder
      )

      return new Set(
        Object.entries(this.cellRepertoires)
          .filter(([key]) => {
            const [eventIdRaw] = key.split('::')

            return Number(eventIdRaw) === activeEventId && key !== activeKey
          })
          .map(([, repertoire]) => repertoire.repertoireId)
      )
    },
    repertoireModalThemeName(): string | null {
      if (!this.activeRepertoireCell) {
        return null
      }

      return getMusicalThemeNameForRepertoireSlot(this.activeRepertoireCell.displayOrder)
    },
    excludedPersonIdsForAssignModal(): Set<number> {
      if (!this.activeCell) {
        return new Set()
      }

      const activeEventId = this.activeCell.eventId
      const activeKey = buildCellAssignmentKey(this.activeCell.eventId, this.activeCell.columnId)

      return new Set(
        Object.entries(this.cellAssignments)
          .filter(([key]) => {
            const [eventIdRaw] = key.split('::')

            return Number(eventIdRaw) === activeEventId && key !== activeKey
          })
          .map(([, assignment]) => assignment.personId)
      )
    },
    activeCellAssignment(): MonthlyScheduleCellAssignment | null {
      if (!this.activeCell) {
        return null
      }

      return this.cellAssignments[buildCellAssignmentKey(
        this.activeCell.eventId,
        this.activeCell.columnId
      )] ?? null
    },
    activeCellEventLabel(): string {
      if (!this.activeCell) {
        return ''
      }

      const event = this.events.find((item) => item.eventId === this.activeCell?.eventId)

      return event ? formatScheduleEventLabel(event) : ''
    },
    activeFolderCell(): MonthlyScheduleRepertoireGroupCell | null {
      if (this.activeFolderEventId === null) {
        return null
      }

      return this.eventRepertoireGroups[this.activeFolderEventId] ?? null
    },
    activeFolderEventLabel(): string {
      if (this.activeFolderEventId === null) {
        return ''
      }

      const event = this.events.find((item) => item.eventId === this.activeFolderEventId)

      return event ? formatScheduleEventLabel(event) : ''
    }
  },
  async mounted() {
    this.parseRouteParams()
    await Promise.all([
      this.loadMonthlySchedule(),
      this.loadMinistryMembers()
    ])
    this.pageLoading = false
  },
  methods: {
    parseRouteParams() {
      const ministryId = Number(this.$route.params.ministryId)
      const year = Number(this.$route.params.year)
      const month = Number(this.$route.params.month)

      if (!Number.isInteger(ministryId) || ministryId <= 0
        || !Number.isInteger(year) || year < 2000
        || !Number.isInteger(month) || month < 1 || month > 12) {
        void this.$router.replace({ name: 'events-schedules' })
        return
      }

      this.ministryId = ministryId
      this.selectedYear = year
      this.selectedMonth = month
    },
    applyLoadedSchedule(
      payload: {
        ministryName: string
        isMusicMinistry: boolean
        events: ScheduleEventItem[]
        columnCount: number
        assignments: MonthlyTeamScheduleAssignment[]
        repertoires: MonthlyTeamScheduleRepertoire[]
        repertoireGroups: MonthlyTeamScheduleRepertoireGroup[]
      },
      options?: { mergeColumnCount?: boolean }
    ) {
      const columnCount = options?.mergeColumnCount
        ? Math.max(payload.columnCount, this.columns.length)
        : payload.columnCount

      this.ministryName = payload.ministryName
      this.isMusicMinistry = payload.isMusicMinistry
      this.events = payload.events
      this.columns = createMonthlyScheduleColumns(columnCount)
      this.cellAssignments = mapMonthlyAssignmentsToCellState(
        payload.assignments,
        this.columns
      )
      this.cellRepertoires = mapMonthlyRepertoiresToCellState(payload.repertoires)
      this.eventRepertoireGroups = mapMonthlyRepertoireGroupsToCellState(
        payload.repertoireGroups ?? []
      )

      if (this.activeTab === 'repertoire' && !this.isMusicMinistry) {
        this.activeTab = 'assignment'
      }
    },
    async loadMonthlySchedule() {
      try {
        const response = await teamScheduleService.getMonthly(
          this.ministryId,
          this.selectedYear,
          this.selectedMonth
        )
        const payload = response.payload

        if (!payload) {
          return
        }

        this.applyLoadedSchedule(payload)
      } catch {
        toastService.error('Não foi possível carregar a escala.')
      }
    },
    async loadMinistryMembers() {
      this.ministryMembersLoading = true

      try {
        const response = await ministryService.listMembersForSchedule(this.ministryId)
        this.ministryMembers = response.payload ?? []
      } catch {
        this.ministryMembers = []
      } finally {
        this.ministryMembersLoading = false
      }
    },
    syncAssignmentsForColumns() {
      this.cellAssignments = pruneCellAssignments(
        this.cellAssignments,
        this.eventIds,
        this.columns.map((column) => column.id)
      )
    },
    goToAssignmentTab() {
      this.activeTab = 'assignment'
    },
    goToRepertoireTab() {
      if (!this.isMusicMinistry || this.events.length === 0) {
        return
      }

      this.activeTab = 'repertoire'
    },
    async addColumn() {
      if (!this.canManageTeamSchedule) {
        return
      }

      const previousColumns = this.columns

      this.columns = [
        ...this.columns,
        { id: createMonthlyScheduleColumnId() }
      ]

      const saved = await this.saveMonthlySchedule()

      if (!saved) {
        this.columns = previousColumns
      }
    },
    async removeColumn(columnId: string) {
      if (!this.canManageTeamSchedule || this.columns.length <= 1) {
        return
      }

      const previousColumns = this.columns
      const previousAssignments = this.cellAssignments

      this.columns = this.columns.filter((column) => column.id !== columnId)
      this.syncAssignmentsForColumns()

      const saved = await this.saveMonthlySchedule()

      if (!saved) {
        this.columns = previousColumns
        this.cellAssignments = previousAssignments
      }
    },
    openAssignModal(eventId: number, columnId: string) {
      if (!this.canManageTeamSchedule) {
        return
      }

      this.activeCell = { eventId, columnId }
      this.assignModalVisible = true
    },
    async handleAssignConfirm(assignment: MonthlyScheduleCellAssignment) {
      if (!this.activeCell) {
        return
      }

      const key = buildCellAssignmentKey(this.activeCell.eventId, this.activeCell.columnId)
      const isUpdate = Boolean(this.cellAssignments[key])
      const previousAssignments = this.cellAssignments

      this.cellAssignments = {
        ...this.cellAssignments,
        [key]: assignment
      }
      this.activeCell = null

      const saved = await this.saveMonthlySchedule({
        successMessage: isUpdate
          ? 'Pessoa atualizada na escala com sucesso.'
          : 'Pessoa adicionada à escala com sucesso.'
      })

      if (!saved) {
        this.cellAssignments = previousAssignments
      }
    },
    async handleAssignmentRemove(eventId: number, columnId: string) {
      if (!this.canManageTeamSchedule) {
        return
      }

      const key = buildCellAssignmentKey(eventId, columnId)

      if (!this.cellAssignments[key]) {
        return
      }

      const previousAssignments = this.cellAssignments
      const nextAssignments = { ...this.cellAssignments }

      delete nextAssignments[key]
      this.cellAssignments = nextAssignments

      const saved = await this.saveMonthlySchedule({
        successMessage: 'Pessoa removida da escala com sucesso.'
      })

      if (!saved) {
        this.cellAssignments = previousAssignments
      }
    },
    openRepertoireModal(eventId: number, displayOrder: number) {
      if (!this.canManageTeamSchedule || this.eventRepertoireGroups[eventId]) {
        return
      }

      this.activeRepertoireCell = { eventId, displayOrder }
      this.repertoireModalVisible = true
    },
    async handleRepertoireAdded(item: RepertoireListItem) {
      if (!this.activeRepertoireCell) {
        return
      }

      const eventId = this.activeRepertoireCell.eventId
      const firstTheme = item.musicalThemes[0] ?? null
      const key = buildRepertoireCellKey(eventId, this.activeRepertoireCell.displayOrder)
      const isUpdate = Boolean(this.cellRepertoires[key])
      const previousRepertoires = this.cellRepertoires
      const previousGroups = this.eventRepertoireGroups

      this.cellRepertoires = {
        ...this.cellRepertoires,
        [key]: {
          repertoireId: item.id,
          songName: item.songName,
          author: item.author,
          key: item.key,
          musicalThemeId: firstTheme?.id ?? null,
          musicalThemeName: firstTheme?.name ?? null
        }
      }

      if (this.eventRepertoireGroups[eventId]) {
        const nextGroups = { ...this.eventRepertoireGroups }
        delete nextGroups[eventId]
        this.eventRepertoireGroups = nextGroups
      }

      this.activeRepertoireCell = null
      this.repertoireModalVisible = false

      const saved = await this.saveMonthlySchedule({
        successMessage: isUpdate
          ? 'Música atualizada no repertório com sucesso.'
          : 'Música adicionada ao repertório com sucesso.'
      })

      if (!saved) {
        this.cellRepertoires = previousRepertoires
        this.eventRepertoireGroups = previousGroups
      }
    },
    async handleRepertoireRemove(eventId: number, displayOrder: number) {
      if (!this.canManageTeamSchedule) {
        return
      }

      const key = buildRepertoireCellKey(eventId, displayOrder)
      const previousRepertoires = this.cellRepertoires
      const nextRepertoires = { ...this.cellRepertoires }

      delete nextRepertoires[key]
      this.cellRepertoires = nextRepertoires

      const saved = await this.saveMonthlySchedule({
        successMessage: 'Música removida do repertório com sucesso.'
      })

      if (!saved) {
        this.cellRepertoires = previousRepertoires
      }
    },
    openFolderModal(eventId: number) {
      if (!this.canManageTeamSchedule) {
        return
      }

      this.activeFolderEventId = eventId
      this.folderModalVisible = true
    },
    async handleShareImage() {
      if (this.shareImageLoading || this.events.length === 0) {
        return
      }

      this.shareImageLoading = true

      try {
        const blob = await buildMonthlyScheduleShareImageBlob({
          ministryName: this.ministryName,
          year: this.selectedYear,
          month: this.selectedMonth,
          events: this.events,
          columns: this.columns,
          assignments: this.visibleCellAssignments,
          includeRepertoire: this.isMusicMinistry,
          repertoires: this.visibleCellRepertoires,
          repertoireGroups: this.visibleEventRepertoireGroups
        })

        const filename = buildMonthlyScheduleShareFilename(
          this.ministryName,
          this.selectedYear,
          this.selectedMonth
        )

        downloadBlob(blob, filename)

        const copied = await copyImageBlobToClipboard(blob)

        toastService.success(
          copied
            ? 'Imagem gerada e copiada. Baixe o arquivo ou cole no WhatsApp.'
            : 'Imagem gerada. O download começou — envie o arquivo no WhatsApp.'
        )
      } catch {
        toastService.error('Não foi possível gerar a imagem da escala.')
      } finally {
        this.shareImageLoading = false
      }
    },
    async handleMonthlyShareLink() {
      if (
        !this.canManageTeamSchedule
        || this.monthlyShareLinkLoading
        || this.events.length === 0
      ) {
        return
      }

      this.monthlyShareLinkLoading = true

      try {
        const response = await teamScheduleService.generateMonthlyShareLink(
          this.ministryId,
          this.selectedYear,
          this.selectedMonth
        )
        const shareHash = response.payload?.shareHash

        if (!shareHash) {
          throw new Error('Não foi possível gerar o link externo.')
        }

        await navigator.clipboard.writeText(
          buildPublicMonthlyTeamScheduleShareUrl(shareHash)
        )
        toastService.success('Link externo da escala copiado para a área de transferência.')
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'Não foi possível criar ou copiar o link externo.'

        toastService.error(message)
      } finally {
        this.monthlyShareLinkLoading = false
      }
    },
    async handleShareLink(eventId: number) {
      if (!this.canManageTeamSchedule || this.shareLoadingEventId !== null) {
        return
      }

      this.shareLoadingEventId = eventId

      try {
        const response = await teamScheduleService.generateShareLink(this.ministryId, eventId)
        const shareHash = response.payload?.shareHash

        if (!shareHash) {
          throw new Error('Não foi possível gerar o link.')
        }

        this.events = this.events.map((event) => (
          event.eventId === eventId
            ? { ...event, publicShareHash: shareHash }
            : event
        ))

        await navigator.clipboard.writeText(buildPublicTeamScheduleShareUrl(shareHash))
        toastService.success('Link público copiado para a área de transferência.')
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'Não foi possível criar ou copiar o link.'

        toastService.error(message)
      } finally {
        this.shareLoadingEventId = null
      }
    },
    openFolderSongsModal(eventId: number) {
      if (!this.eventRepertoireGroups[eventId]) {
        return
      }

      this.activeFolderEventId = eventId
      this.folderSongsModalVisible = true
    },
    handleChangeFolderFromSongsModal() {
      this.folderSongsModalVisible = false

      if (!this.canManageTeamSchedule || this.activeFolderEventId === null) {
        return
      }

      this.folderModalVisible = true
    },
    async handleFolderSelected(folder: MonthlyScheduleRepertoireGroupCell) {
      if (!this.canManageTeamSchedule || this.activeFolderEventId === null) {
        return
      }

      const eventId = this.activeFolderEventId
      const isUpdate = Boolean(this.eventRepertoireGroups[eventId])
      const previousGroups = this.eventRepertoireGroups
      const previousRepertoires = this.cellRepertoires
      const hadStandardSlots = eventHasRepertoireSlots(this.cellRepertoires, eventId)

      this.eventRepertoireGroups = {
        ...this.eventRepertoireGroups,
        [eventId]: folder
      }

      if (hadStandardSlots) {
        this.cellRepertoires = clearEventRepertoiresForEvent(this.cellRepertoires, eventId)
      }

      this.activeFolderEventId = null

      const saved = await this.saveMonthlySchedule({
        successMessage: isUpdate
          ? 'Pasta atualizada no repertório com sucesso.'
          : 'Pasta associada ao evento com sucesso.'
      })

      if (!saved) {
        this.eventRepertoireGroups = previousGroups
        this.cellRepertoires = previousRepertoires
      }
    },
    async handleFolderRemove(eventId: number) {
      if (!this.canManageTeamSchedule || !this.eventRepertoireGroups[eventId]) {
        return
      }

      const previousGroups = this.eventRepertoireGroups
      const nextGroups = { ...this.eventRepertoireGroups }

      delete nextGroups[eventId]
      this.eventRepertoireGroups = nextGroups

      const saved = await this.saveMonthlySchedule({
        successMessage: 'Pasta removida do evento com sucesso.'
      })

      if (!saved) {
        this.eventRepertoireGroups = previousGroups
      }
    },
    async saveMonthlySchedule(options?: { successMessage?: string }): Promise<boolean> {
      this.saveLoading = true

      try {
        const response = await teamScheduleService.saveMonthly({
          ministryId: this.ministryId,
          year: this.selectedYear,
          month: this.selectedMonth,
          columnCount: this.columns.length,
          assignments: mapCellAssignmentsToMonthlyPayload(
            this.visibleCellAssignments,
            this.columns
          ),
          repertoires: this.isMusicMinistry
            ? mapCellRepertoiresToMonthlyPayload(this.visibleCellRepertoires)
            : [],
          repertoireGroups: this.isMusicMinistry
            ? mapCellRepertoireGroupsToMonthlyPayload(this.visibleEventRepertoireGroups)
            : []
        })

        const payload = response.payload

        if (payload) {
          this.applyLoadedSchedule(payload, { mergeColumnCount: true })
        }

        if (options?.successMessage) {
          toastService.success(options.successMessage)
        }

        return true
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'Não foi possível salvar a escala.'

        toastService.error(message)
        return false
      } finally {
        this.saveLoading = false
      }
    }
  }
})
</script>
