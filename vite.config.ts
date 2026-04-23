import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      'components': fileURLToPath(new URL('./src/components', import.meta.url)),
      'hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      'layout': fileURLToPath(new URL('./src/layout', import.meta.url)),
      'store': fileURLToPath(new URL('./src/store', import.meta.url)),
      'utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      'views': fileURLToPath(new URL('./src/views', import.meta.url))
    }

  }
})
