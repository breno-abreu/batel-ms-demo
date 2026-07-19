import type { Router } from 'vue-router'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { useAuthStore } from '@/stores/authStore'

export function setupAuthGuard(router: Router): void {
  router.beforeEach((to) => {
    const authStore = useAuthStore()

    if (IS_DEMO_MODE) {
      if (to.meta.guestOnly || to.name === 'login' || to.name === 'register') {
        return { name: 'home' }
      }

      return true
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return {
        name: 'login',
        query: { redirect: to.fullPath }
      }
    }

    if (to.meta.guestOnly && authStore.isAuthenticated) {
      return { name: 'home' }
    }

    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      return { name: 'unauthorized' }
    }

    const requiredPermissions = to.meta.requiredPermissions
    if (Array.isArray(requiredPermissions) && requiredPermissions.length > 0) {
      if (!authStore.hasAllPermissions(requiredPermissions)) {
        return { name: 'unauthorized' }
      }
    }

    const requiredAnyPermissions = to.meta.requiredAnyPermissions
    if (Array.isArray(requiredAnyPermissions) && requiredAnyPermissions.length > 0) {
      if (!authStore.hasAnyPermission(requiredAnyPermissions)) {
        return { name: 'unauthorized' }
      }
    }

    return true
  })
}
