import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { pdfExportPlugin } from './scripts/vite-pdf-plugin.mjs'

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    ...(command === 'serve' ? [pdfExportPlugin()] : [])
  ],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
    open: true
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/html2pdf') || id.includes('html2canvas') || id.includes('jspdf')) {
            return 'pdf-export'
          }
          if (id.includes('node_modules/element-plus')) {
            return 'element-plus'
          }
        }
      }
    }
  }
}))
