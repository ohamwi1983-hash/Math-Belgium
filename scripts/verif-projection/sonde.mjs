/* Sonde de mise au point (NON importée par l'application) : node scripts/verif-projection/sonde.mjs <build> */
import { contexte, navigateur, projeter, serveur, glisser } from './commun.mjs'
const srv = await serveur(process.argv[2])
const browser = await navigateur()
const { page, erreurs } = await contexte(browser)
page.on('console', (m) => { if (m.text().startsWith('DBG')) console.log(m.text().slice(0, 300)) })
await projeter(page, '/6e-6h/coniques/projeter?etapes=excentricite')
await page.keyboard.press('ArrowRight')
await page.waitForTimeout(400)
await page.keyboard.press('x')
await glisser(page, [110, 460], [430, 530])
await page.getByRole('button', { name: /Coller sur une page blanche/ }).click()
await page.waitForTimeout(1000)
await page.keyboard.press('s')
await glisser(page, [140, 520], [700, 540])
await page.keyboard.press('s')
await page.waitForTimeout(900)
const { lireConserve } = await import('./commun.mjs')
const d = await lireConserve(page, '6e-6h/coniques')
console.log(JSON.stringify(d.pages.map(([k, l]) => [k, l.map((e) => e.genre ?? 'trait')])))
const compter = () => page.evaluate(() => { const c = document.querySelectorAll('canvas.projection-annotations')[2]; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) { n++; const p = (i - 3) / 4, x = p % c.width, y = Math.floor(p / c.width); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) } return [n, x0, x1, y0, y1, c.isConnected, c.width].join(' ') })
console.log('avant b', await compter())
console.log('--- b ---')
await page.keyboard.press('b')
console.log('juste après b', await compter())
await page.waitForTimeout(900)
console.log('900 ms après b', await compter())
const d2 = await lireConserve(page, '6e-6h/coniques')
console.log(JSON.stringify(d2.pages.map(([k, l]) => [k, l.map((e) => e.genre ?? 'trait')])))
await page.screenshot({ path: '/tmp/claude-0/-home-user-Math-Belgium/66a25a49-cb49-5a35-985a-94043bdae42d/scratchpad/projection-outils-E/dbg/retour.png' })
console.log(
  await page.evaluate(() =>
    [...document.querySelectorAll('canvas')].map((c) => {
      const x = c.getContext('2d')
      const d = x.getImageData(0, 0, c.width, c.height).data
      let n = 0
      for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++
      return `${c.className} ${c.width}x${c.height} opaques=${n} parent=${c.parentElement.className}`
    }),
  ),
)
const opaques = () =>
  page.evaluate(() => {
    const c = document.querySelectorAll('canvas.projection-annotations')[2]
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
    let n = 0
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++
    return n
  })
await page.keyboard.press('ArrowRight')
await page.waitForTimeout(300)
console.log('diapo 3', await opaques())
await page.keyboard.press('ArrowLeft')
await page.waitForTimeout(300)
console.log('diapo 2 de nouveau', await opaques())
await page.reload()
await page.waitForSelector('.projection-scene-diapo .diapo')
await page.waitForTimeout(800)
await page.keyboard.press('ArrowRight')
await page.waitForTimeout(500)
console.log('après rechargement', await opaques())
console.log(erreurs)
await browser.close()
srv.close()
