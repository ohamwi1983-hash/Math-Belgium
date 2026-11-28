/*
 * P5 · enregistrer la projection en vidéo — module de `outils-o.mjs` (NON importé par l'application).
 * Chromium sans écran : micro factice (`--use-fake-device-for-media-stream`, un bip régulier), partage de CET onglet
 * accepté d'office (`--auto-accept-this-tab-capture`).
 */
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const URL = '/6e-6h/fonctions-exponentielles/projeter?etapes=limites,derivee,graphique&inclure=essentiel'

export async function p5({ browser, contexte, ouvrirProjection, verifier, capture, attendre, debordement, cibles, CAPTURES }) {
  console.log('\n== P5 · enregistrer en vidéo (un écran)')
  const { ctx, page, erreurs } = await contexte(browser)
  await ouvrirProjection(page, URL)
  const capacites = await page.evaluate(() => ({ element: 'RestrictionTarget' in window, region: 'CropTarget' in window, recorder: typeof MediaRecorder !== 'undefined', vp9: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') }))
  console.log('  capacités du navigateur de test :', JSON.stringify(capacites))
  await page.mouse.move(600, 300)
  await page.locator('.projection-barre .rec-bouton').click()
  await page.waitForSelector('.rec-dialogue')
  await page.waitForSelector('.rec-micro', { timeout: 10000 })
  verifier((await page.locator('.rec-micro').count()) >= 1, 'liste des micros de l’appareil (micro factice)')
  verifier((await page.locator('.rec-micro.on').count()) === 1, 'un micro proposé d’office')
  let barres = 0
  for (let k = 0; k < 30 && barres === 0; k++) {
    await attendre(page, 100)
    barres = await page.locator('.rec-vu i.g, .rec-vu i.j, .rec-vu i.r').count()
  }
  verifier(barres > 0, `niveau sonore en direct (${barres} barres allumées)`)
  verifier(/n’est envoyé à aucun serveur/.test(await page.locator('.rec-sous').innerText()), '« Rien n’est envoyé à aucun serveur »')
  verifier(/jamais la liste des élèves ni les points/.test(await page.locator('.rec-liste').innerText()), 'ce qui est enregistré, en clair (jamais la liste des élèves ni les points)')
  verifier(/partager cet onglet/.test(await page.locator('.rec-dialogue').innerText()), 'le partage d’onglet est expliqué avant')
  await page.locator('.rec-tester').click()
  await page.waitForSelector('.rec-test audio', { timeout: 9000 })
  verifier(true, 'Tester (5 s) : enregistré puis réécoutable')
  await capture(page, 'p5-01-reglages')
  await debordement(page, 'P5 boîte 1 280 × 720')
  await cibles(page, '.rec-dialogue button, .rec-micro', 'boîte « Enregistrer »')
  if (!capacites.element && !capacites.region) {
    verifier(await page.locator('.rec-commencer').isDisabled(), 'navigateur sans capture de la diapo : « Commencer » désactivé, vue à deux écrans proposée')
    await page.locator('.rec-actions button', { hasText: 'Annuler' }).click()
    await ctx.close()
    return
  }
  await page.locator('.rec-commencer').click()
  await page.waitForSelector('.rec-barre', { timeout: 15000 })
  // Couper le silence du début : attend la voix (bip du micro factice), puis enregistre.
  await page.waitForFunction(() => /\d:\d\d/.test(document.querySelector('.rec-temps')?.textContent || ''), null, { timeout: 15000 })
  verifier(true, 'enregistrement lancé (après la voix détectée)')
  await capture(page, 'p5-02-pendant-barre')
  // Trois étapes de 11 s : trois chapitres YouTube.
  for (let etape = 0; etape < 3; etape++) {
    await page.waitForTimeout(11500)
    if (etape < 2) {
      const avant = await page.locator('.projection-fil').innerText()
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('ArrowRight')
        await page.waitForTimeout(80)
        if ((await page.locator('.projection-fil').innerText()) !== avant) break
      }
    }
  }
  // Pause / reprise
  await page.mouse.move(600, 300)
  await page.locator('.rec-barre button[aria-label^="Mettre"]').click()
  await attendre(page, 1500)
  verifier((await page.locator('.rec-barre.pause').count()) === 1, 'Pause : chrono gris')
  await page.locator('.rec-barre button[aria-label^="Reprendre"]').click()
  // Barre masquée : rappel en haut à droite
  await page.mouse.move(600, 300)
  await page.waitForTimeout(3600)
  verifier((await page.locator('.rec-rappel').count()) === 1, 'barre masquée : petit rappel (point rouge + chrono)')
  await capture(page, 'p5-03-pendant-rappel')
  await page.mouse.move(600, 320)
  await page.locator('.rec-barre button[aria-label^="Arrêter"]').click()
  await page.locator('.rec-confirmer button', { hasText: 'Arrêter' }).click()
  await page.waitForSelector('.rec-pret', { timeout: 20000 })
  await attendre(page, 800)
  const desc = await page.locator('.rec-youtube textarea').inputValue()
  const chapitres = desc.split('\n').filter((l) => /^\d\d:\d\d /.test(l))
  verifier(chapitres.length >= 3 && chapitres[0].startsWith('00:00'), `chapitres horodatés d’après les étapes (${chapitres.join(' | ')})`)
  verifier(/Le cours complet : math-belgium\.vercel\.app\/6e-6h\/fonctions-exponentielles/.test(desc), 'lien vers le cours complet')
  verifier((await page.locator('.rec-youtube input').inputValue()).startsWith('Fonctions exponentielles — '), 'titre proposé « chapitre — étapes »')
  verifier(/RGPD/.test(await page.locator('.rec-rappel-rgpd').innerText()), 'rappel RGPD toujours affiché')
  verifier((await page.locator('.rec-repere').count()) >= 3, 'aperçu : un repère par changement d’étape sur la ligne du temps')
  await capture(page, 'p5-04-video-prete')
  await debordement(page, 'P5 « Ta vidéo est prête » 1 280 × 720')
  // Une image de la vidéo, pour la relire : la diapo seule (ni barre, ni point rouge)
  const image = await page.evaluate(async () => {
    const v = document.querySelector('.rec-video')
    await new Promise((ok) => (v.readyState >= 1 ? ok() : v.addEventListener('loadedmetadata', ok, { once: true })))
    v.currentTime = 4
    await new Promise((ok) => v.addEventListener('seeked', ok, { once: true }))
    const c = document.createElement('canvas')
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    return { url: c.toDataURL('image/png'), l: v.videoWidth, h: v.videoHeight }
  })
  await writeFile(join(CAPTURES, 'p5-05-image-de-la-video.png'), Buffer.from(image.url.split(',')[1], 'base64'))
  const dureeLue = await page.evaluate(() => document.querySelector('.rec-video').duration)
  verifier(Number.isFinite(dureeLue) && dureeLue > 30, `durée écrite dans le WebM : le lecteur la connaît (${dureeLue} s)`)
  verifier(image.l > 0 && Math.abs(image.l / image.h - 16 / 9) < 0.05, `vidéo au format de la diapo (${image.l} × ${image.h})`)
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('.rec-telecharger').click()])
  const nom = dl.suggestedFilename()
  const chemin = join(CAPTURES, 'p5-video.webm')
  await dl.saveAs(chemin)
  const octets = await readFile(chemin)
  verifier(/^Fonctions exponentielles - \d{4}-\d\d-\d\d\.webm$/.test(nom), `fichier « ${nom} »`)
  verifier(octets.length > 10000 && octets.readUInt32BE(0) === 0x1a45dfa3, `WebM valide (${octets.length} octets)`)
  verifier(erreurs.length === 0, `P5 un écran : 0 erreur console (${erreurs.slice(0, 3).join(' | ')})`)
  await ctx.close()

  console.log('\n== P5 · deux écrans')
  const d = await contexte(browser, { largeur: 1280, hauteur: 800 })
  await ouvrirProjection(d.page, `${URL}&role=prof`)
  const diapos = await d.ctx.newPage()
  await ouvrirProjection(diapos, `${URL}&role=diapos`)
  verifier((await diapos.title()).startsWith('Diapos — '), `fenêtre des diapos reconnaissable dans la fenêtre de partage (« ${await diapos.title()} »)`)
  await d.page.bringToFront()
  await d.page.locator('.prof-actions .rec-bouton').click()
  await d.page.waitForSelector('.rec-dialogue')
  verifier(/la fenêtre des diapos/.test(await d.page.locator('.rec-dialogue').innerText()), 'deux écrans : « choisis la fenêtre des diapos » (la vue du professeur n’est jamais filmée)')
  await capture(d.page, 'p5-06-deux-ecrans-reglages')
  await d.page.locator('.rec-actions button', { hasText: 'Annuler' }).click()
  // Pendant l'enregistrement de la vue du professeur, la fenêtre des diapos cache ses barres et les points.
  await d.page.evaluate(() => new BroadcastChannel('math-belgium-enregistrement:6e-6h/fonctions-exponentielles').postMessage({ type: 'enregistrement', actif: true }))
  await attendre(diapos, 400)
  verifier((await diapos.locator('.projection--diapos.en-enregistrement').count()) === 1 && !(await diapos.locator('.projection-barre').isVisible()), 'fenêtre des diapos filmée : barre cachée')
  await d.page.evaluate(() => new BroadcastChannel('math-belgium-enregistrement:6e-6h/fonctions-exponentielles').postMessage({ type: 'enregistrement', actif: false }))
  verifier(d.erreurs.length === 0, `P5 deux écrans : 0 erreur console (${d.erreurs.slice(0, 3).join(' | ')})`)
  await d.ctx.close()
}
