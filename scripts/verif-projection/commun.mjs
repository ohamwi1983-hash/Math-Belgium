/*
 * Outils communs des vérifications Playwright du mode projection (NON importés par l'application).
 * Build de test : NODE_ENV=development npx vite build --config <copie locale de vite.config.ts, précache 16 Mio> --mode test --outDir <build>
 * Faux client connecté : `scripts/verif-espace/faux-supabase.js` + `donnees.mjs`.
 */
import { chromium } from 'playwright'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { demarrerServeur } from '../verif-espace/serveur.mjs'
import { donnees } from '../verif-espace/donnees.mjs'

const ICI = dirname(fileURLToPath(import.meta.url))
/** Serveur Vite de développement : 5431 ; build de test servi ici : 5432. */
export let PORT = 5431
export let BASE = `http://localhost:${PORT}`

export function compteur() {
  let ok = 0
  const echecs = []
  return {
    verifier(cond, quoi) {
      if (cond) ok++
      else {
        echecs.push(quoi)
        console.log(`  ✗ ${quoi}`)
      }
    },
    bilan() {
      console.log(`\n${ok} vérifications réussies, ${echecs.length} échec(s).`)
      for (const e of echecs) console.log(`  - ${e}`)
      return echecs.length
    },
  }
}

export async function navigateur() {
  try {
    return await chromium.launch()
  } catch {
    const { default: c } = await import('@sparticuz/chromium')
    return chromium.launch({ executablePath: await c.executablePath(), args: c.args.filter((a) => a !== '--single-process'), headless: true })
  }
}

/** Build de test servi en statique ; « dev » = serveur Vite de développement déjà lancé sur PORT (`npx vite --port 5431`). */
export async function serveur(build) {
  if (build === 'dev') return { close() {} }
  PORT = 5432
  BASE = `http://localhost:${PORT}`
  return demarrerServeur(build, PORT)
}

/** Contexte connecté (faux client), viewport et thème au choix ; erreurs de la console relevées. */
export async function contexte(browser, { largeur = 1280, hauteur = 720, sombre = false, toucher = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: largeur, height: hauteur }, colorScheme: sombre ? 'dark' : 'light', locale: 'fr-BE', timezoneId: 'Europe/Brussels', acceptDownloads: true, hasTouch: toucher })
  await ctx.addInitScript(`window.__MB_DONNEES__ = ${JSON.stringify(donnees())}; window.__MB_OPTIONS__ = {};`)
  await ctx.addInitScript({ path: join(ICI, '..', 'verif-espace', 'faux-supabase.js') })
  const erreurs = []
  const suivre = (page) => {
    page.on('console', (m) => {
      if (m.type() === 'error' && !/favicon|ERR_INVALID_URL|Failed to load resource|fonts\.g/.test(m.text())) erreurs.push(m.text())
    })
    page.on('pageerror', (e) => erreurs.push(String(e)))
  }
  ctx.on('page', suivre)
  const page = await ctx.newPage()
  return { ctx, page, erreurs }
}

/** Ouvre une projection et attend la première diapo. */
export async function projeter(page, chemin) {
  await page.goto(`${BASE}${chemin}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.projection-scene-diapo .diapo, .projection-scene-diapo .projection-blanc', { timeout: 40000 })
  await page.waitForTimeout(800)
}

/** Point d'écran (px réels) d'un point logique (1 280 × 720) de la scène. */
export async function ecran(page, [x, y], scene = '.projection-scene--principale') {
  const r = await page.locator(`${scene} .projection-scene-cadre`).first().boundingBox()
  const k = r.width / 1280
  return [r.x + x * k, r.y + y * k]
}

export async function glisser(page, de, a, { scene, pas = 12 } = {}) {
  const [x0, y0] = await ecran(page, de, scene)
  const [x1, y1] = await ecran(page, a, scene)
  await page.mouse.move(x0, y0)
  await page.mouse.down()
  for (let i = 1; i <= pas; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / pas, y0 + ((y1 - y0) * i) / pas)
  await page.mouse.up()
  await page.waitForTimeout(200)
}

export async function cliquer(page, p, scene) {
  const [x, y] = await ecran(page, p, scene)
  await page.mouse.click(x, y)
  await page.waitForTimeout(200)
}

/** Données conservées (IndexedDB) d'un chapitre. */
export function lireConserve(page, cle) {
  return page.evaluate(
    (cle) =>
      new Promise((ok) => {
        const r = indexedDB.open('math-belgium-projection', 1)
        r.onsuccess = () => {
          const t = r.result.transaction('annotations', 'readonly').objectStore('annotations').get(cle)
          t.onsuccess = () => ok(t.result ?? null)
          t.onerror = () => ok(null)
        }
        r.onerror = () => ok(null)
      }),
    cle,
  )
}

export async function capture(page, dossier, nom, el) {
  await page.waitForTimeout(350)
  if (el) await page.locator(el).first().screenshot({ path: join(dossier, `${nom}.png`) })
  else await page.screenshot({ path: join(dossier, `${nom}.png`) })
}

/** Aucun débordement : l'élément tient dans la fenêtre. */
export async function dansFenetre(page, sel) {
  return page.evaluate((sel) => {
    const els = [...document.querySelectorAll(sel)]
    return els.every((e) => {
      const r = e.getBoundingClientRect()
      return r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1
    })
  }, sel)
}

/** Plus petite cible (largeur / hauteur réelles) parmi les boutons d'un sélecteur. */
export async function pluspetiteCible(page, sel) {
  return page.evaluate((sel) => {
    let m = Infinity
    for (const e of document.querySelectorAll(sel)) {
      const r = e.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      m = Math.min(m, r.width, r.height)
    }
    return Math.round(m * 10) / 10
  }, sel)
}
