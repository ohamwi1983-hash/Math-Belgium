import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import 'katex/dist/katex.min.css'
// Polices d'IMPRESSION des chapitres, servies par le site lui-même (pas Google Fonts) : un
// `@font-face` de même origine est recopié et inliné par l'export « Télécharger ce chapitre »
// (`lib/export/buildHtml.ts`), ce qui n'est pas possible avec une feuille Google cross-origin.
// Sous-ensemble latin seulement (français, « − », tirets) ; le navigateur ne télécharge un fichier
// que lorsqu'un élément l'utilise réellement, donc rien de plus à l'écran.
// - Andika : impression normale (choix de l'utilisateur) ;
// - Atkinson Hyperlegible : impression aménagée (même police que les évaluations aménagées).
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-700.css'
import '@fontsource/andika/latin-400-italic.css'
import '@fontsource/andika/latin-700-italic.css'
import '@fontsource/atkinson-hyperlegible/latin-400.css'
import '@fontsource/atkinson-hyperlegible/latin-700.css'
import './index.css'
// Confort de lecture (panneau « Aa », thèmes, réglages) — après `index.css` : `.claude/rules/cote-eleve.md`.
import './lecture.css'
import App from './App.tsx'
import { appliquerReglages, reglagesCourants } from './lib/reglagesLecture'
import { surveillerFormulesDebordantes } from './lib/formulesDebordantes'

// Sans cet appel explicite, `vite-plugin-pwa` injecte un script d'enregistrement minimal
// (juste `serviceWorker.register(...)`, sans aucune détection/rechargement automatique sur mise à
// jour) — le contenu du site se mettant à jour régulièrement (voir historique de commits), un
// visiteur qui revient sur un onglet déjà ouvert resterait sinon bloqué sur l'ancien bundle en
// cache jusqu'à une fermeture/réouverture complète de l'onglet. `registerSW({ immediate: true })`
// active la vraie logique de `registerType: 'autoUpdate'` (vite.config.ts) : rechargement
// automatique dès qu'un nouveau service worker prend la main.
registerSW({ immediate: true })

// L'application a démarré : on retire la garde du filet de sécurité de index.html, pour qu'il
// puisse rejouer une récupération si un problème survient plus tard dans le même onglet.
try {
  sessionStorage.removeItem('recovery-reload')
} catch {
  // stockage indisponible (navigation privée stricte…) : sans conséquence
}

// Réglages de lecture de l'élève : déjà posés avant l'affichage par le script en ligne d'`index.html` ;
// réappliqués ici (couleur de la barre du navigateur, police OpenDyslexic chargée si elle est choisie).
appliquerReglages(reglagesCourants())
surveillerFormulesDebordantes()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
