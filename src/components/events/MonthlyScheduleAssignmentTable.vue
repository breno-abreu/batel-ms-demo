<template>
  <div class="monthly-schedule-assignment-table-wrapper">
    <table class="repertoire-table monthly-schedule-assignment-table">
      <thead>
        <tr>
          <th class="monthly-schedule-assignment-table__date-header">
            Evento
          </th>
          <th
            v-for="(column, columnIndex) in columns"
            :key="column.id"
            class="monthly-schedule-assignment-table__column-header"
          >
            <div class="monthly-schedule-assignment-table__column-header-content">
              <span>Pessoa {{ columnIndex + 1 }}</span>
              <AppTooltip v-if="canManage" text="Remover coluna">
                <button
                  type="button"
                  class="monthly-schedule-assignment-table__remove-column"
                  :disabled="columns.length <= minColumnCount"
                  :aria-label="`Remover pessoa ${columnIndex + 1}`"
                  @click="$emit('remove-column', column.id)"
                >
                  <MinusIcon :size="14" aria-hidden="true" />
                </button>
              </AppTooltip>
            </div>
          </th>
          <th
            v-if="canManage"
            class="monthly-schedule-assignment-table__add-header"
            aria-label="Adicionar coluna"
          >
            <AppTooltip text="Adicionar coluna">
              <button
                type="button"
                class="monthly-schedule-assignment-table__add-column"
                aria-label="Adicionar coluna de pessoa"
                @click="$emit('add-column')"
              >
                <PlusIcon :size="16" aria-hidden="true" />
              </button>
            </AppTooltip>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="event in events"
          :key="event.eventId"
        >
          <th
            scope="row"
            class="monthly-schedule-assignment-table__date-cell"
          >
            {{ formatScheduleEventLabel(event, { includeTime: false }) }}
          </th>
          <td
            v-for="column in columns"
            :key="`${event.eventId}-${column.id}`"
            class="monthly-schedule-assignment-table__cell"
          >
            <div class="monthly-schedule-assignment-table__cell-content">
              <button
                v-if="!getAssignment(event.eventId, column.id) && canManage"
                type="button"
                class="monthly-schedule-assignment-table__cell-button"
                :aria-label="`Definir pessoa para ${formatScheduleEventLabel(event, { includeTime: false })}`"
                @click="$emit('open-cell', event.eventId, column.id)"
              >
                <PlusIcon :size="16" aria-hidden="true" />
              </button>

              <span
                v-else-if="!getAssignment(event.eventId, column.id)"
                class="monthly-schedule-assignment-table__assignment-skill--empty"
              >
                —
              </span>

              <div
                v-else
                class="monthly-schedule-assignment-table__assignment-row"
              >
                <button
                  v-if="canManage"
                  type="button"
                  class="monthly-schedule-assignment-table__assignment monthly-schedule-assignment-table__assignment-button"
                  :aria-label="`Alterar ${getAssignment(event.eventId, column.id)?.personName}`"
                  @click="$emit('open-cell', event.eventId, column.id)"
                >
                  <span class="monthly-schedule-assignment-table__assignment-name">
                    {{ getAssignment(event.eventId, column.id)?.personName }}
                  </span>
                  <span
                    v-if="getAssignment(event.eventId, column.id)?.skillName"
                    class="monthly-schedule-assignment-table__assignment-skill"
                  >
                    {{ getAssignment(event.eventId, column.id)?.skillName }}
                  </span>
                  <span
                    v-else
                    class="monthly-schedule-assignment-table__assignment-skill monthly-schedule-assignment-table__assignment-skill--empty"
                  >
                    Sem função
                  </span>
                </button>

                <span
                  v-else
                  class="monthly-schedule-assignment-table__assignment"
                >
                  <span class="monthly-schedule-assignment-table__assignment-name">
                    {{ getAssignment(event.eventId, column.id)?.personName }}
                  </span>
                  <span
                    v-if="getAssignment(event.eventId, column.id)?.skillName"
                    class="monthly-schedule-assignment-table__assignment-skill"
                  >
                    {{ getAssignment(event.eventId, column.id)?.skillName }}
                  </span>
                </span>

                <AppTooltip v-if="canManage" text="Remover pessoa">
                  <button
                    type="button"
                    class="monthly-schedule-assignment-table__remove"
                    :aria-label="`Remover ${getAssignment(event.eventId, column.id)?.personName}`"
                    @click="$emit('remove-cell', event.eventId, column.id)"
                  >
                    <Trash2Icon :size="14" aria-hidden="true" />
                  </button>
                </AppTooltip>
              </div>
            </div>
          </td>
          <td
            class="monthly-schedule-assignment-table__spacer"
            aria-hidden="true"
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { MinusIcon, PlusIcon, Trash2Icon } from '@lucide/vue'
import AppTooltip from '@/components/feedback/AppTooltip.vue'
import {
  buildCellAssignmentKey,
  formatScheduleEventLabel,
  MIN_MONTHLY_SCHEDULE_COLUMN_COUNT,
  type MonthlyScheduleCellAssignment,
  type MonthlyScheduleColumn,
  type ScheduleEventItem
} from '@/utils/monthlySchedule'

export default defineComponent({
  name: 'MonthlyScheduleAssignmentTable',
  components: {
    AppTooltip,
    MinusIcon,
    PlusIcon,
    Trash2Icon
  },
  props: {
    events: {
      type: Array as PropType<ScheduleEventItem[]>,
      required: true
    },
    columns: {
      type: Array as PropType<MonthlyScheduleColumn[]>,
      required: true
    },
    assignments: {
      type: Object as PropType<Record<string, MonthlyScheduleCellAssignment>>,
      required: true
    },
    canManage: {
      type: Boolean,
      default: true
    }
  },
  emits: ['add-column', 'remove-column', 'open-cell', 'remove-cell'],
  computed: {
    minColumnCount(): number {
      return MIN_MONTHLY_SCHEDULE_COLUMN_COUNT
    }
  },
  methods: {
    formatScheduleEventLabel,
    getAssignment(eventId: number, columnId: string): MonthlyScheduleCellAssignment | null {
      return this.assignments[buildCellAssignmentKey(eventId, columnId)] ?? null
    }
  }
})
</script>
