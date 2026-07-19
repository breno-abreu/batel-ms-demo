import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Rotas do app com sidebar/navbar (não relacionado a autenticação). */
    appShell?: boolean
    publicShare?: boolean
    hideNavbar?: boolean
    selfProfile?: boolean
  }
}

export {}
