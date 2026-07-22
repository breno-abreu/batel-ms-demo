<template>
  <div
    class="app-shell"
    :class="{
      'app-shell--auth': !showNavbar,
      'app-shell--with-sidebar': showSidebar,
      'app-shell--mobile-unsupported': isMobileUnsupported
    }"
  >
    <AppSidebar v-if="showSidebar" />

    <div class="app-shell__main">
      <AppNavbar v-if="showNavbar" />

      <div
        class="app-body"
        :class="{ 'app-body--full': !showNavbar }"
      >
        <main class="app-main">
          <MobileUnsupportedView v-if="isMobileUnsupported" />
          <RouterView v-else />
        </main>
      </div>
    </div>

    <AppToastContainer />
    <AppConfirmDialog />
    <DemoNoticeModal :enabled="showDemoNotice" />
    <BirthdayGreetingModal :enabled="showBirthdayGreeting" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import AppConfirmDialog from '@/components/feedback/AppConfirmDialog.vue'
import BirthdayGreetingModal from '@/components/feedback/BirthdayGreetingModal.vue'
import DemoNoticeModal from '@/components/feedback/DemoNoticeModal.vue'
import AppNavbar from '@/components/navbar/AppNavbar.vue'
import AppSidebar from '@/components/navbar/AppSidebar.vue'
import AppToastContainer from '@/components/feedback/AppToastContainer.vue'
import MobileUnsupportedView from '@/views/errors/MobileUnsupportedView.vue'
import { isPublicSharePath } from '@/utils/urlUtils'

const MOBILE_VIEWPORT_QUERY = '(max-width: 720px)'

export default defineComponent({
  name: 'App',
  components: {
    AppConfirmDialog,
    AppNavbar,
    AppSidebar,
    AppToastContainer,
    BirthdayGreetingModal,
    DemoNoticeModal,
    MobileUnsupportedView,
    RouterView
  },
  data() {
    return {
      isNarrowViewport: typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia(MOBILE_VIEWPORT_QUERY).matches,
      mobileViewportQuery: null as MediaQueryList | null
    }
  },
  computed: {
    isPublicShareRoute(): boolean {
      if (this.$route.matched.some((record) => record.meta.publicShare === true)) {
        return true
      }

      // Fallback for the first paint / redirect hops before meta is available.
      if (isPublicSharePath(this.$route.path) || isPublicSharePath()) {
        return true
      }

      return false
    },
    isMobileUnsupported(): boolean {
      return this.isNarrowViewport && !this.isPublicShareRoute
    },
    showSidebar(): boolean {
      if (this.isMobileUnsupported || this.isPublicShareRoute) {
        return false
      }

      return this.$route.matched.some((record) => record.meta.appShell === true)
    },
    showNavbar(): boolean {
      if (this.isMobileUnsupported || this.isPublicShareRoute) {
        return false
      }

      return !this.$route.matched.some((record) => record.meta.hideNavbar === true)
    },
    showDemoNotice(): boolean {
      if (this.isMobileUnsupported || this.isPublicShareRoute) {
        return false
      }

      return this.$route.matched.some((record) => record.meta.appShell === true)
    },
    showBirthdayGreeting(): boolean {
      if (this.isMobileUnsupported || this.isPublicShareRoute) {
        return false
      }

      return this.$route.matched.some((record) => record.meta.appShell === true)
    }
  },
  mounted() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    this.mobileViewportQuery = window.matchMedia(MOBILE_VIEWPORT_QUERY)
    this.isNarrowViewport = this.mobileViewportQuery.matches
    this.mobileViewportQuery.addEventListener('change', this.handleViewportChange)
  },
  beforeUnmount() {
    this.mobileViewportQuery?.removeEventListener('change', this.handleViewportChange)
  },
  methods: {
    handleViewportChange(event: MediaQueryListEvent): void {
      this.isNarrowViewport = event.matches
    }
  }
})
</script>
