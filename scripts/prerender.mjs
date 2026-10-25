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
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { preview } from 'vite'
import { chromium } from 'playwright'
import { getRoutes } from './routes.mjs'

const routes = await getRoutes()

const server = await preview({ preview: { port: 4174, strictPort: false } })
const baseUrl = server.resolvedUrls.local[0]

const browser = await chromium.launch()
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

await browser.close()
await server.close()

console.log(`Pré-rendu statique : ${routes.length} pages`)
