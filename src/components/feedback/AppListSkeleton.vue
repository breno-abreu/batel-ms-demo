<template>
  <div
    class="app-skeleton-block"
    aria-hidden="true"
  >
    <div
      v-if="showSearch"
      class="app-skeleton app-skeleton--search"
    />

    <ul
      class="sortable-list app-skeleton-list"
      :class="{ 'sortable-list--draggable': draggable }"
      role="presentation"
    >
      <li
        v-for="index in rows"
        :key="index"
        class="sortable-list__item app-skeleton-list__item"
      >
        <span
          v-if="draggable"
          class="app-skeleton app-skeleton--handle"
        />
        <div class="sortable-list__info">
          <span class="app-skeleton app-skeleton--title" />
          <span class="app-skeleton app-skeleton--description" />
        </div>
        <div class="sortable-list__actions">
          <span
            v-for="actionIndex in actionCount"
            :key="actionIndex"
            class="app-skeleton app-skeleton--action"
          />
        </div>
        <span class="app-skeleton app-skeleton--status" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
/**
 * Skeleton de lista para estados de carregamento.
 * Use em páginas com `.sortable-list`; props comuns: `show-search`, `draggable`, `action-count`.
 */
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppListSkeleton',
  props: {
    rows: {
      type: Number,
      default: 3
    },
    draggable: {
      type: Boolean,
      default: false
    },
    showSearch: {
      type: Boolean,
      default: false
    },
    actionCount: {
      type: Number,
      default: 3
    }
  }
})
</script>
