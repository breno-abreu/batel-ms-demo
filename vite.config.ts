import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

/** Base do GitHub Pages (project site). Em `npm run dev` usa `/`. */
const githubPagesBase = '/batel-ms-demo/'

function spaFallback404() {
  return {
    name: 'spa-fallback-404',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist')
      const indexHtml = resolve(distDir, 'index.html')
      const notFoundHtml = resolve(distDir, '404.html')

      if (existsSync(indexHtml)) {
        copyFileSync(indexHtml, notFoundHtml)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? githubPagesBase : '/',
  plugins: [vue(), tailwindcss(), spaFallback404()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
}))
