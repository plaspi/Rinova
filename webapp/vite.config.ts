import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Rinova Energy',
        short_name: 'Rinova',
        description: 'Gestione Comunità Energetiche Rinnovabili',
        theme_color: '#064e3b',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        id: '/',
        start_url: '/',
        icons: [
          {
            src: 'manifest/android_chrome_192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'manifest/android_chrome_512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
        ]
      },
      // Service Worker (Caching)
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html', // Fondamentale per SPA
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
