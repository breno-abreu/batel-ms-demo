<template>
  <div
    class="repertoire-table-wrapper app-skeleton-block"
    aria-hidden="true"
  >
    <div
      v-if="showSearch"
      class="app-skeleton app-skeleton--search app-skeleton--search-table"
    />

    <table class="repertoire-table">
      <thead v-if="showHeader">
        <tr>
          <th
            v-for="columnIndex in columns"
            :key="`header-${columnIndex}`"
          >
            <span class="app-skeleton app-skeleton--th" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="rowIndex in rows"
          :key="`row-${rowIndex}`"
        >
          <td
            v-for="columnIndex in columns"
            :key="`cell-${rowIndex}-${columnIndex}`"
          >
            <span
              class="app-skeleton"
              :class="getCellClass(columnIndex)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
/**
 * Skeleton de tabela para estados de carregamento.
 * Use em páginas com `.repertoire-table`; ajuste `columns`, `show-search` e `rows` conforme o layout.
 */
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppTableSkeleton',
  props: {
    rows: {
      type: Number,
      default: 3
    },
    columns: {
      type: Number,
      default: 4
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showSearch: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getCellClass(columnIndex: number): string {
      if (columnIndex === 1) {
        return 'app-skeleton--cell-icon'
      }

      if (columnIndex === this.columns) {
        return 'app-skeleton--cell-actions'
      }

      return columnIndex === 2
        ? 'app-skeleton--cell-wide'
        : 'app-skeleton--cell'
    }
  }
})
</script>
