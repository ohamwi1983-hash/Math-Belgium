/*
 * Vérification Playwright du chantier O de la projection (P1 exercice au tableau, P5 vidéo, P6 participation).
 * NON importé par l'application. Usage :
 *   NODE_ENV=development npx vite build --config <copie de vite.config.ts, limite du service worker à 16 Mio> --mode test --outDir <build>
 *   node scripts/verif-projection/outils-o.mjs <build> <dossier des captures> [p1,p5,p6]
 * Faux client : `scripts/verif-espace/faux-supabase.js` ; données : `scripts/verif-espace/donnees.mjs`.
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { demarrerServeur } from '../verif-espace/serveur.mjs'
import { C5A, MAINTENANT, donnees } from '../verif-espace/donnees.mjs'

const ICI = dirname(fileURLToPath(import.meta.url))
const BUILD = process.argv[2]
const CAPTURES = process.argv[3] || join(ICI, 'captures')
const QUOI = (process.argv[4] || 'p1,p5,p6').split(',')
const PORT = Number(process.env.PORT_VERIF) || 5437
const BASE = `http://localhost:${PORT}`
if (!BUILD) {
  console.error('Usage : node scripts/verif-projection/outils-o.mjs <build> [captures] [p1,p5,p6]')
  process.exit(1)
}

let ok = 0
const echecs = []
function verifier(cond, quoi) {
  if (cond) ok++
  else {
    echecs.push(quoi)
    console.log(`  ✗ ${quoi}`)
  }
}

async function navigateur() {
  const args = ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--auto-accept-this-tab-capture', '--auto-select-desktop-capture-source=Projection', '--enable-experimental-web-platform-features', '--autoplay-policy=no-user-gesture-required']
  try {
    return await chromium.launch({ args })
  } catch {
    const { default: c } = await import('@sparticuz/chromium')
    return chromium.launch({ executablePath: await c.executablePath(), args: [...c.args.filter((a) => a !== '--single-process'), ...args], headless: true })
  }
}

async function contexte(browser, { largeur = 1280, hauteur = 720, sombre = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: largeur, height: hauteur },
    colorScheme: sombre ? 'dark' : 'light',
    locale: 'fr-BE',
    timezoneId: 'Europe/Brussels',
    permissions: ['clipboard-read', 'clipboard-write', 'microphone'],
    acceptDownloads: true,
  })
  await ctx.addInitScript(`window.__MB_DONNEES__ = ${JSON.stringify(donnees())}; window.__MB_OPTIONS__ = {};`)
  await ctx.addInitScript({ path: join(ICI, '../verif-espace/faux-supabase.js') })
  const erreurs = []
  ctx.on('page', (p) => suivreErreurs(p, erreurs))
  const page = await ctx.newPage()
  return { ctx, page, erreurs }
}

function suivreErreurs(page, erreurs) {
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|ERR_INVALID_URL|Failed to load resource|ytimg/.test(m.text())) erreurs.push(`${page.url()} : ${m.text()}`)
  })
  page.on('pageerror', (e) => erreurs.push(`${page.url()} : ${String(e)}`))
}

const capture = (page, nom) => page.screenshot({ path: join(CAPTURES, `${nom}.png`) })
const attendre = (page, ms = 400) => page.waitForTimeout(ms)

/** Aucun élément visible de la projection ne sort de la fenêtre. */
async function debordement(page, quoi) {
  const r = await page.evaluate(() => {
    const w = innerWidth
    const h = innerHeight
    const hors = []
    for (const el of document.querySelectorAll('.projection-blanc-outils *, .exo-chercher, .projection-barre, .part-projete, .part-panneau *, .rec-dialogue *, .part-reglages *')) {
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) continue
      const st = getComputedStyle(el)
      if (st.visibility === 'hidden' || st.opacity === '0') continue
      // Dans un conteneur qui défile ou rogne (boîte, panneau) : c'est le conteneur qui doit tenir dans la fenêtre.
      let rogne = false
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const o = getComputedStyle(p)
        if (/(auto|scroll|hidden)/.test(o.overflow + o.overflowX + o.overflowY) && !p.matches('.projection, .projection-scene, .projection-scene-cadre')) {
          rogne = true
          break
        }
      }
      if (rogne) continue
      if (r.right > w + 1 || r.bottom > h + 1 || r.left < -1 || r.top < -1) hors.push(`${el.className || el.tagName} ${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}`)
    }
    return { hors: hors.slice(0, 5), sw: document.documentElement.scrollWidth, w }
  })
  verifier(r.hors.length === 0 && r.sw <= r.w, `${quoi} : rien hors de la fenêtre (${r.hors.join(' | ')})`)
}

/** Cibles d'au moins 44 px réels (boutons visibles d'une zone). */
async function cibles(page, selecteur, quoi) {
  const petits = await page.evaluate((sel) => {
    const res = []
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') continue
      if (r.width < 43.5 || r.height < 43.5) res.push(`${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)} ${Math.round(r.width)}×${Math.round(r.height)}`)
    }
    return res
  }, selecteur)
  verifier(petits.length === 0, `${quoi} : cibles ≥ 44 px (${petits.slice(0, 4).join(' ; ')})`)
}

const URL_P1 = '/6e-6h/fonctions-exponentielles/projeter?etapes=equations&inclure=essentiel,entrainement'

async function ouvrirProjection(page, url) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.projection-scene--principale .diapo, .prof-scene .diapo', { timeout: 30000 })
  await attendre(page, 800)
}

// ------------------------------------------------------------------------------------------ P1

async function p1(browser) {
  console.log('\n== P1 · exercice au tableau (un écran)')
  const { ctx, page, erreurs } = await contexte(browser)
  await ouvrirProjection(page, URL_P1)
  await page.keyboard.press('End')
  await page.waitForSelector('.diapo-entrainement-projeter', { timeout: 30000 })
  verifier(true, 'bouton « Projeter un exercice » sur la diapo S’entraîner (6gen9, générateur de ce site)')
  await page.mouse.move(600, 300)
  await capture(page, 'p1-01-diapo-sentrainer')
  const avantIndex = await page.locator('.projection-compteur').innerText()
  await page.locator('.diapo-entrainement-projeter').click()
  await page.waitForSelector('.exo-page .exo-surtitre', { timeout: 20000 })
  await attendre(page, 800)
  verifier((await page.locator('.projection-compteur').innerText()) === avantIndex, 'pas de nouvelle diapo dans la liste (compteur inchangé)')
  verifier((await page.locator('.exo-reponse').count()) === 0, 'un écran : aucune réponse affichée avant « Montrer la réponse »')
  const katex = await page.locator('.exo-page .katex-error').count()
  verifier(katex === 0, 'énoncé : 0 .katex-error')
  await page.mouse.move(600, 300)
  await capture(page, 'p1-02-enonce')
  await debordement(page, 'P1 énoncé 1 280 × 720')
  await cibles(page, '.exo-barre button, .exo-barre select', 'petite barre de l’exercice')
  // Laisser chercher 3 min
  await page.locator('.exo-barre button', { hasText: 'Laisser chercher' }).click()
  await page.locator('.exo-menu-chercher button', { hasText: '3 min' }).click()
  await attendre(page, 600)
  verifier(/^\s*[23]:\d\d/.test(await page.locator('.exo-chercher').innerText()), 'minuteur « Laisser chercher » affiché en haut à droite')
  // corrigé ligne par ligne : → puis Espace
  await page.keyboard.press('ArrowRight')
  await attendre(page, 300)
  await page.keyboard.press(' ')
  await attendre(page, 500)
  const etat = await page.evaluate(() => ({
    courantes: document.querySelectorAll('.exo-page .exo-ligne--courante').length,
    passees: document.querySelectorAll('.exo-page .exo-ligne--passee').length,
    futures: document.querySelectorAll('.exo-page .exo-ligne--future').length,
    bouton: [...document.querySelectorAll('.exo-barre button')].map((b) => b.textContent).find((t) => /Corrigé/.test(t)),
  }))
  verifier(etat.courantes === 1 && etat.passees === 1, `corrigé : ligne 2 en cours, ligne 1 montrée (${JSON.stringify(etat)})`)
  verifier(/Corrigé 2 \/ \d+/.test(etat.bouton || ''), `« Corrigé 2 / n » dans la petite barre (${etat.bouton})`)
  // stylo : un trait sur la page d'exercice
  await page.keyboard.press('s')
  await attendre(page, 200)
  const scene = await page.locator('.projection-scene--principale .projection-scene-cadre').boundingBox()
  await page.mouse.move(scene.x + scene.width * 0.55, scene.y + scene.height * 0.45)
  await page.mouse.down()
  for (let i = 0; i < 12; i++) await page.mouse.move(scene.x + scene.width * (0.55 + i * 0.015), scene.y + scene.height * (0.45 + (i % 2) * 0.02))
  await page.mouse.up()
  await page.keyboard.press('Escape')
  await attendre(page, 300)
  verifier((await page.locator('.exo-page').count()) === 1, 'Échap range d’abord le stylo (l’exercice reste)')
  await capture(page, 'p1-03-corrige-annote')
  // Montrer la réponse
  await page.mouse.move(600, 300)
  await page.locator('.exo-barre button', { hasText: 'Montrer la réponse' }).click()
  await attendre(page, 300)
  verifier((await page.locator('.exo-reponse').count()) === 1, '« Montrer la réponse » : réponse affichée')
  await capture(page, 'p1-04-reponse')
  // Un autre du même type : nouvelle page vierge, ‹ 2 / 2 ›
  const code1 = await page.evaluate(() => document.querySelector('.exo-page')?.getAttribute('data-page-exercice'))
  await page.locator('.exo-barre button', { hasText: 'Un autre du même type' }).click()
  await attendre(page, 600)
  const code2 = await page.evaluate(() => document.querySelector('.exo-page')?.getAttribute('data-page-exercice'))
  verifier(code1 && code2 && code1 !== code2, 'un autre exercice sur une nouvelle page')
  verifier(/2 \/ 2/.test(await page.locator('.exo-barre .pages-compteur').innerText()), '‹ 2 / 2 › dans la petite barre')
  verifier((await page.locator('.exo-pied').innerText()).startsWith('Exercice 2'), 'pied « Exercice 2 · … »')
  await capture(page, 'p1-05-autre-meme-type')
  // Échap : retour à la diapo ; recharger : tout revient
  await page.keyboard.press('Escape')
  await attendre(page, 300)
  verifier((await page.locator('.exo-page').count()) === 0, 'Échap referme l’exercice (retour à la diapo)')
  await attendre(page, 900)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.projection-scene--principale .diapo', { timeout: 30000 })
  await attendre(page, 800)
  await page.keyboard.press('End')
  await page.waitForSelector('.diapo-entrainement-projeter', { timeout: 30000 })
  const gardes = await page.evaluate(async () => {
    const r = indexedDB.open('math-belgium-projection', 1)
    const db = await new Promise((ok) => (r.onsuccess = () => ok(r.result)))
    const t = db.transaction('annotations').objectStore('annotations').get('6e-6h/fonctions-exponentielles')
    const d = await new Promise((ok) => (t.onsuccess = () => ok(t.result)))
    return { exercices: Object.values(d?.exercices ?? {}).flat().length, traits: (d?.pages ?? []).filter(([k]) => k.startsWith('x:')).length, cles: (d?.pages ?? []).map(([k]) => k) }
  })
  verifier(gardes.exercices === 2 && gardes.traits >= 1, `rechargement : 2 exercices et leurs traits gardés dans le navigateur (${JSON.stringify(gardes)})`)
  // Export PowerPoint et PDF : pages d'exercice après la diapo S'entraîner
  await page.mouse.move(600, 300)
  await page.locator('.projection-barre button[aria-label^="Télécharger"]').click()
  for (const [format, bouton] of [
    ['pptx', 'PowerPoint annoté'],
    ['pdf', 'PDF annoté'],
  ]) {
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.locator('.projection-palette--export button', { hasText: bouton }).click()])
    const chemin = join(CAPTURES, `p1-export.${format}`)
    await dl.saveAs(chemin)
    verifier(true, `export ${format} téléchargé (${await dl.suggestedFilename()})`)
  }
  verifier(erreurs.length === 0, `P1 un écran : 0 erreur console (${erreurs.slice(0, 3).join(' | ')})`)
  await ctx.close()

  // Deux écrans : vue du professeur + fenêtre des diapos
  console.log('\n== P1 · deux écrans')
  const d = await contexte(browser, { largeur: 1280, hauteur: 800 })
  await ouvrirProjection(d.page, `${URL_P1}&role=prof`)
  const diapos = await d.ctx.newPage()
  await ouvrirProjection(diapos, `${URL_P1}&role=diapos`)
  await diapos.locator('.projection-accueil button', { hasText: 'Continuer sans' }).click().catch(() => {})
  await d.page.bringToFront()
  await d.page.keyboard.press('End')
  await d.page.waitForSelector('.prof-scene .diapo-entrainement-projeter', { timeout: 30000 })
  await d.page.locator('.prof-scene .diapo-entrainement-projeter').click()
  await d.page.waitForSelector('.prof-exo-seul .prof-exo-lignes li', { timeout: 20000 })
  await diapos.waitForSelector('.exo-page .exo-surtitre', { timeout: 20000 })
  verifier((await d.page.locator('.prof-exo-reponse').innerText()).trim().length > 0, 'vue du professeur : réponse « Pour toi seul » dès le tirage')
  verifier((await diapos.locator('.prof-exo-seul, .exo-reponse').count()) === 0, 'fenêtre des diapos : ni réponse ni « Pour toi seul »')
  await d.page.locator('.prof-navigation button', { hasText: 'Ligne suivante' }).click()
  await d.page.locator('.prof-navigation button', { hasText: 'Ligne suivante' }).click()
  await attendre(diapos, 600)
  verifier((await diapos.locator('.exo-page .exo-ligne--courante').count()) === 1 && (await diapos.locator('.exo-page .exo-ligne--passee').count()) === 1, 'fenêtre des diapos : corrigé 2 / n reçu')
  verifier(/Ligne suivante \(3 \//.test(await d.page.locator('.prof-navigation .projection-bouton-plein').innerText()), '« Ligne suivante (3 / n) » chez le professeur')
  await capture(d.page, 'p1-06-vue-professeur')
  await capture(diapos, 'p1-07-fenetre-diapos')
  verifier(d.erreurs.length === 0, `P1 deux écrans : 0 erreur console (${d.erreurs.slice(0, 3).join(' | ')})`)
  await d.ctx.close()
  // Tailles d'écran : tablette, téléphone en paysage, grand écran ; thème sombre (interface)
  for (const [l, h, sombre] of [[1024, 768, false], [870, 400, false], [1920, 1080, true]]) {
    const t = await contexte(browser, { largeur: l, hauteur: h, sombre })
    await ouvrirProjection(t.page, URL_P1)
    await t.page.keyboard.press('End')
    await t.page.waitForSelector('.diapo-entrainement-projeter', { timeout: 30000 })
    await t.page.locator('.diapo-entrainement-projeter').click()
    await t.page.waitForSelector('.exo-page .exo-surtitre', { timeout: 20000 })
    await t.page.keyboard.press('ArrowRight')
    await attendre(t.page, 600)
    await t.page.mouse.move(l / 2, h / 2)
    await debordement(t.page, `P1 ${l} × ${h}`)
    await cibles(t.page, '.exo-barre button, .exo-barre select', `petite barre ${l} × ${h}`)
    await capture(t.page, `p1-08-${l}x${h}${sombre ? '-sombre' : ''}`)
    if (l === 1920) {
      await t.page.goto(`${BASE}${URL_P1}&role=prof`, { waitUntil: 'domcontentloaded' })
      await t.page.waitForSelector('.prof-scene .diapo', { timeout: 30000 })
      await t.page.keyboard.press('End')
      await t.page.waitForSelector('.prof-scene .diapo-entrainement-projeter', { timeout: 30000 })
      await t.page.locator('.prof-scene .diapo-entrainement-projeter').click()
      await t.page.waitForSelector('.prof-exo-seul .prof-exo-lignes li', { timeout: 20000 })
      await capture(t.page, 'p1-09-vue-professeur-sombre')
    }
    verifier(t.erreurs.length === 0, `P1 ${l} × ${h} : 0 erreur console (${t.erreurs.slice(0, 3).join(' | ')})`)
    await t.ctx.close()
  }
}

// ------------------------------------------------------------------------------------------ main

await mkdir(CAPTURES, { recursive: true })
const serveur = await demarrerServeur(BUILD, PORT)
const browser = await navigateur()
try {
  if (QUOI.includes('p1')) await p1(browser)
  const modP5 = QUOI.includes('p5') ? await import('./outils-o-p5.mjs').catch(() => null) : null
  if (modP5) await modP5.p5({ browser, contexte, ouvrirProjection, verifier, capture, attendre, debordement, cibles, CAPTURES })
  const modP6 = QUOI.includes('p6') ? await import('./outils-o-p6.mjs').catch(() => null) : null
  if (modP6) await modP6.p6({ browser, contexte, ouvrirProjection, verifier, capture, attendre, debordement, cibles, CAPTURES, C5A })
} finally {
  await browser.close()
  serveur.close()
}
console.log(`\n${ok} vérifications réussies, ${echecs.length} échec(s).`)
await writeFile(join(CAPTURES, 'resultat.txt'), `${ok} ok, ${echecs.length} échecs\n${echecs.join('\n')}\n`)
process.exit(echecs.length ? 1 : 0)
