import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { pdfExportPlugin } from './scripts/vite-pdf-plugin.mjs'

export default defineConfig(({ command }) => ({
  plugins: [vue(), ...(command === 'serve' ? [pdfExportPlugin()] : [])],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
    open: true
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 2000
  }
}))
