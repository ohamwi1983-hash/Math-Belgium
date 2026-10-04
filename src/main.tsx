import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import 'katex/dist/katex.min.css'
import './index.css'
import App from './App.tsx'

// Sans cet appel explicite, `vite-plugin-pwa` injecte un script d'enregistrement minimal
// (juste `serviceWorker.register(...)`, sans aucune détection/rechargement automatique sur mise à
// jour) — le contenu du site se mettant à jour régulièrement (voir historique de commits), un
// visiteur qui revient sur un onglet déjà ouvert resterait sinon bloqué sur l'ancien bundle en
// cache jusqu'à une fermeture/réouverture complète de l'onglet. `registerSW({ immediate: true })`
// active la vraie logique de `registerType: 'autoUpdate'` (vite.config.ts) : rechargement
// automatique dès qu'un nouveau service worker prend la main.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
