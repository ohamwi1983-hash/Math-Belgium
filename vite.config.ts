import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Chapitres de maths — FWB',
        short_name: 'Maths FWB',
        description: 'Chapitres de cours de mathématiques interactifs pour la FWB (4e, 5e, 6e).',
        lang: 'fr',
        theme_color: '#b65c1f',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Contenu de cours mis à jour régulièrement (voir l'historique de commits) — `autoUpdate`
        // ci-dessus fait réactiver le nouveau service worker sans prompt manuel, et les assets
        // bâtis par Vite sont tous suffixés par un hash de contenu, donc un déploiement n'entre
        // jamais en collision avec le cache précédent.
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
