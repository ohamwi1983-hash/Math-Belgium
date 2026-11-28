/*
 * Sonde : ouvre une adresse du build de test avec le faux client et affiche le texte d'un sélecteur (aide au
 * débogage des vérifications). NON importé par l'application.
 * Usage : node scripts/verif-espace/sonde.mjs <build> <chemin> <sélecteur> [capture.png] [mobile]
 */
import { chromium, devices } from 'playwright'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { demarrerServeur } from './serveur.mjs'
import { MAINTENANT, donnees } from './donnees.mjs'

const ICI = dirname(fileURLToPath(import.meta.url))
const [, , build, chemin, sel, cap, mobile] = process.argv
let browser
try {
  browser = await chromium.launch()
} catch {
  const { default: c } = await import('@sparticuz/chromium')
  browser = await chromium.launch({ executablePath: await c.executablePath(), args: c.args.filter((a) => a !== '--single-process'), headless: true })
}
const serveur = await demarrerServeur(build, 5421)
const ctx = await browser.newContext(mobile ? { ...devices['iPhone 13'] } : { viewport: { width: 1280, height: 900 }, locale: 'fr-BE', timezoneId: 'Europe/Brussels' })
await ctx.addInitScript(`window.__MB_DONNEES__ = ${JSON.stringify(donnees())}; window.__MB_OPTIONS__ = {};`)
await ctx.addInitScript({ path: join(ICI, 'faux-supabase.js') })
const page = await ctx.newPage()
await page.clock.setFixedTime(new Date(MAINTENANT))
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()))
page.on('pageerror', (e) => console.log('PAGEERROR', String(e)))
await page.goto(`http://localhost:5421${chemin}`)
await page.waitForTimeout(4000)
console.log((await page.locator(sel).allInnerTexts()).join('\n-----\n'))
if (cap) await page.screenshot({ path: cap, fullPage: true })
await browser.close()
serveur.close()
