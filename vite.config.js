import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      _fixtures: fileURLToPath(new URL('./fixtures', import.meta.url)),
      _utils: fileURLToPath(new URL('./utils', import.meta.url)),
      '@': fileURLToPath(new URL('./client', import.meta.url)),
      '~components': fileURLToPath(new URL('./client/components', import.meta.url)),
      '~stores': fileURLToPath(new URL('./client/stores', import.meta.url)),
      '~views': fileURLToPath(new URL('./client/views', import.meta.url))
    }
  },
  server: {
    proxy: {
      // Proxy API requests to Express server
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
