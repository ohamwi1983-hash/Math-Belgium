// Pré-rendu statique après build : visite chaque route réelle du site (voir scripts/routes.mjs)
// avec un vrai navigateur headless (Playwright) et remplace dist/{route}/index.html par le DOM
// final obtenu après montage de l'application.
//
// Un SSR Node pur (`react-dom/server`) est impossible ici : les illustrations (Mafs, via
// ResizeObserver) et les widgets interactifs (Web Components Shadow DOM, voir
// `.claude/rules/interactive-widgets.md`) ont besoin d'un vrai environnement navigateur pour
// s'initialiser sans planter — un vrai Chromium headless les fait fonctionner exactement comme
// pour un visiteur réel, sans rien à mocker.
//
// Le "flash" de remplacement au premier chargement (`createRoot().render()` ne fait jamais
// d'hydratation : il écrase et reconstruit) est le compromis standard de cette technique — sans
// incidence visuelle puisque le contenu pré-rendu est strictement identique au premier rendu
// client (données de contenu déterministes, aucune randomisation avant interaction de l'élève).
//
// Échec capturé plutôt que propagé (`process.exitCode` jamais mis à 1 ici) : un Chromium headless
// a besoin de bibliothèques système que l'image de build de Vercel ne fournit pas forcément —
// vécu en pratique (déploiement resté bloqué silencieusement sur l'avant-dernière version
// fonctionnelle pendant plusieurs commits, sitemap généré mais pages jamais pré-rendues). Le
// pré-rendu est un gain SEO, pas une condition pour déployer le site : s'il échoue, le build doit
// quand même aboutir (JS/CSS/contenu à jour) avec juste une page `dist/index.html`/
// `dist/{route}/index.html` non pré-rendue (la méta client `useDocumentMeta` prend toujours le
// relais une fois le JS chargé), plutôt que de ne RIEN déployer.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { preview } from 'vite'
import { chromium } from 'playwright'
import { getRoutes } from './routes.mjs'

// `server`/`browser` déclarés hors du `try` : sur un échec en cours de route (ex. Chromium qui ne
// démarre pas), le `finally` doit quand même pouvoir les refermer — sans ça, le serveur de preview
// garde le process Node ouvert indéfiniment, et le script ne rendrait jamais la main (le build
// resterait bloqué au lieu d'échouer vite ou de continuer).
let server
let browser
try {
  const routes = await getRoutes()

  server = await preview({ preview: { port: 4174, strictPort: false } })
  const baseUrl = server.resolvedUrls.local[0]

  browser = await chromium.launch()
  const page = await browser.newPage()

  for (const route of routes) {
    await page.goto(new URL(route.slice(1), baseUrl).toString(), { waitUntil: 'networkidle' })
    // Marge de sécurité : les illustrations Mafs se dimensionnent via ResizeObserver, un cycle
    // après le premier rendu React — `networkidle` seul ne garantit pas que ce second passage a
    // déjà eu lieu.
    await page.waitForTimeout(300)

    const html = '<!doctype html>\n' + (await page.evaluate(() => document.documentElement.outerHTML))
    const outPath = route === '/' ? 'dist/index.html' : `dist${route}/index.html`
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, html)
  }

  console.log(`Pré-rendu statique : ${routes.length} pages`)
} catch (err) {
  console.warn('⚠ Pré-rendu statique ignoré (le build continue sans SSG) :', err?.message ?? err)
} finally {
  await browser?.close().catch(() => {})
  await server?.close().catch(() => {})
}
