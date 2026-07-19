<template>
  <aside class="app-sidebar">
    <div class="app-sidebar__header">
      <div class="app-sidebar__brand">
        <RouterLink
          class="app-sidebar__brand-name"
          :to="{ name: 'home' }"
          aria-label="Ir para Início"
        >
          Bless
        </RouterLink>
      </div>
    </div>

    <nav class="app-sidebar__nav" aria-label="Navegação principal">
      <section
        v-for="group in navigationGroups"
        :key="group.id"
        class="app-sidebar__group"
      >
        <button
          type="button"
          class="app-sidebar__group-toggle"
          :aria-expanded="isGroupExpanded(group.id) ? 'true' : 'false'"
          :aria-controls="`sidebar-group-${group.id}`"
          @click="toggleGroup(group.id)"
        >
          <span class="app-sidebar__group-label">{{ group.label }}</span>
          <ChevronDownIcon
            class="app-sidebar__group-chevron"
            :class="{ 'app-sidebar__group-chevron--expanded': isGroupExpanded(group.id) }"
            :size="16"
            aria-hidden="true"
          />
        </button>

        <div
          :id="`sidebar-group-${group.id}`"
          class="app-sidebar__group-items"
          :class="{ 'app-sidebar__group-items--expanded': isGroupExpanded(group.id) }"
        >
          <div class="app-sidebar__group-items-inner">
            <RouterLink
              v-for="item in group.items"
              :key="item.name"
              class="app-sidebar__link"
              :class="{ 'router-link-active': isNavItemActive(item) }"
              :to="{ name: item.name }"
            >
              <component :is="item.icon" class="app-sidebar__link-icon" :size="18" aria-hidden="true" />
              <span class="app-sidebar__link-label">{{ item.label }}</span>
            </RouterLink>
          </div>
        </div>
      </section>
    </nav>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronDownIcon } from '@lucide/vue'
import {
  getSidebarNavGroups,
  type SidebarNavItem
} from '@/navigation/sidebarNavItems'

export default defineComponent({
  name: 'AppSidebar',
  components: {
    ChevronDownIcon,
    RouterLink
  },
  data() {
    return {
      expandedGroupIds: [] as string[]
    }
  },
  computed: {
    navigationGroups() {
      return getSidebarNavGroups()
    }
  },
  watch: {
    '$route.name'() {
      this.syncExpandedGroupsWithRoute()
    },
    navigationGroups: {
      handler() {
        this.syncExpandedGroupsWithRoute()
      },
      deep: true
    }
  },
  mounted() {
    this.syncExpandedGroupsWithRoute()
  },
  methods: {
    isNavItemActive(item: SidebarNavItem): boolean {
      const routeName = typeof this.$route.name === 'string' ? this.$route.name : null

      if (!routeName) {
        return false
      }

      if (item.activeRouteNames?.length) {
        return item.activeRouteNames.includes(routeName)
      }

      return item.name === routeName
    },

    isGroupExpanded(groupId: string): boolean {
      return this.expandedGroupIds.includes(groupId)
    },

    toggleGroup(groupId: string): void {
      if (this.isGroupExpanded(groupId)) {
        this.expandedGroupIds = this.expandedGroupIds.filter((id) => id !== groupId)
        return
      }

      this.expandedGroupIds = [...this.expandedGroupIds, groupId]
    },

    syncExpandedGroupsWithRoute(): void {
      const routeName = typeof this.$route.name === 'string' ? this.$route.name : null

      if (!routeName) {
        return
      }

      const activeGroup = this.navigationGroups.find((group) =>
        group.items.some((item) => this.isNavItemActive(item))
      )

      if (activeGroup && !this.isGroupExpanded(activeGroup.id)) {
        this.expandedGroupIds = [...this.expandedGroupIds, activeGroup.id]
      }
    }
  }
})
</script>
