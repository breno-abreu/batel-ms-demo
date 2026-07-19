import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    requiresAdmin?: boolean
    publicShare?: boolean
    hideNavbar?: boolean
    selfProfile?: boolean
    requiredPermissions?: string[]
    requiredAnyPermissions?: string[]
  }
}

export {}
