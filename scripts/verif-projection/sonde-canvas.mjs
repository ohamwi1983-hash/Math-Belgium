/* Sonde : clearRect d'un canvas dans le Chromium de test (NON importée par l'application). */
import { navigateur } from './commun.mjs'
const browser = await navigateur()
const page = await browser.newPage()
await page.setContent('<canvas id="c" width="1280" height="720" style="position:absolute;left:0;top:0;width:1280px;height:720px"></canvas>')
const r = await page.evaluate(async () => {
  const c = document.getElementById('c')
  const x = c.getContext('2d')
  const peindre = (n) => {
    x.setTransform(1, 0, 0, 1, 0, 0)
    x.clearRect(0, 0, c.width, c.height)
    x.setTransform(1, 0, 0, 1, 0, 0)
    x.beginPath()
    x.moveTo(140, 520)
    for (let i = 1; i <= n; i++) x.lineTo(140 + (560 * i) / 12, 520 + (20 * i) / 12)
    x.strokeStyle = '#b23a3a'
    x.lineWidth = 5
    x.stroke()
  }
  const compter = () => {
    const d = x.getImageData(0, 0, c.width, c.height).data
    let n = 0
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++
    return n
  }
  for (let i = 1; i <= 12; i++) {
    peindre(i)
    await new Promise((r) => requestAnimationFrame(r))
  }
  const plein = compter()
  await new Promise((r) => setTimeout(r, 300))
  peindre(0)
  const apres = compter()
  await new Promise((r) => setTimeout(r, 300))
  return { plein, apres, plus_tard: compter() }
})
console.log(r)
await browser.close()
