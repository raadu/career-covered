import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'url'
import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from workspace root or apps/web directory
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:3000';

  return {
    plugins: [
      react(), 
      ...(env.DISABLE_CLOUDFLARE ? [] : [cloudflare()]),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'robots.txt', 'sitemap.xml'],
        manifest: {
          name: 'Career Covered - Create Free Cover Letters',
          short_name: 'CareerCovered',
          description: '100% free AI cover letter generator. Create professional cover letters in 2 seconds.',
          theme_color: '#2563eb',
          background_color: '#f8fafc',
          display: 'standalone',
          icons: [
            {
              src: 'favicon.svg',
              sizes: '192x192',
              type: 'image/svg+xml'
            },
            {
              src: 'favicon.svg',
              sizes: '512x512',
              type: 'image/svg+xml'
            }
          ]
        }
      })
    ],
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
    },
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
        },
        '/auth': {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
  };
})