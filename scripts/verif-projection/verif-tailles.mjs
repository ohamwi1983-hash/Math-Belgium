/*
 * Tailles d'écran et thème sombre : menu Gabarit, petit clavier, éditeur de la droite, traceur à onglets, copier.
 * 1 280 × 720, 1 920 × 1 080, tablette 1 024 × 768, téléphone paysage 870 × 400 ; thème sombre (1 280 × 720).
 * NON importé par l'application. Usage : node scripts/verif-projection/verif-tailles.mjs <build|dev> <captures>
 */
import { mkdir } from 'node:fs/promises'
import { capture, compteur, contexte, dansFenetre, glisser, navigateur, pluspetiteCible, projeter, serveur } from './commun.mjs'

const [, , BUILD, CAPTURES = 'captures-tailles'] = process.argv
await mkdir(CAPTURES, { recursive: true })
const { verifier, bilan } = compteur()
const srv = await serveur(BUILD)
const browser = await navigateur()
const TAILLES = [
  [1280, 720, false],
  [1920, 1080, false],
  [1024, 768, false],
  [870, 400, false],
  [1280, 720, true],
]
for (const [l, h, sombre] of TAILLES) {
  const nom = `${l}x${h}${sombre ? '-sombre' : ''}`
  const { ctx, page, erreurs } = await contexte(browser, { largeur: l, hauteur: h, sombre })
  try {
    await projeter(page, '/4e/fonction-second-degre/projeter?etapes=etudier')
    const debordement = async (quoi) => {
      const r = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, w: innerWidth, sh: document.documentElement.scrollHeight, h: innerHeight }))
      verifier(r.s <= r.w && r.sh <= r.h, `${nom} : ${quoi} — aucun débordement de la page (${r.s}×${r.sh} / ${r.w}×${r.h})`)
    }
    await page.keyboard.press('b')
    await page.waitForTimeout(300)
    await page.locator('.blanc-gabarit').click()
    await page.waitForTimeout(250)
    verifier(await dansFenetre(page, '.menu-gabarit'), `${nom} : menu Gabarit dans la fenêtre`)
    verifier((await pluspetiteCible(page, '.menu-gabarit button')) >= 44, `${nom} : cibles du menu ≥ 44 px`)
    const fond = await page.locator('.menu-gabarit').evaluate((e) => getComputedStyle(e).backgroundColor)
    verifier(fond === 'rgb(255, 255, 255)', `${nom} : menu clair (${fond})`)
    await capture(page, CAPTURES, `T-${nom}-menu`)
    // Le bouton « Poser » doit être atteignable (défilement interne au besoin).
    await page.getByRole('button', { name: 'Poser sur la page' }).scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Poser sur la page' }).click()
    await page.waitForTimeout(300)
    await page.locator('.gabarit-case[data-case="l2"]').click()
    await page.waitForTimeout(250)
    verifier(await dansFenetre(page, '.gabarit-clavier'), `${nom} : petit clavier dans la fenêtre`)
    verifier((await pluspetiteCible(page, '.clavier-touche')) >= 44, `${nom} : touches ≥ 44 px`)
    verifier(await dansFenetre(page, '.objet-barre'), `${nom} : petite barre du gabarit dans la fenêtre`)
    verifier((await pluspetiteCible(page, '.objet-bouton')) >= 44, `${nom} : boutons du gabarit ≥ 44 px`)
    const rc = await page.locator('.gabarit-case[data-case="l2"]').boundingBox()
    const rk = await page.locator('.gabarit-clavier').boundingBox()
    // Sur un écran bas, le clavier (touches de 44 px réels) ne peut pas toujours éviter le gabarit : il se pose du côté
    // opposé à la case touchée, qui reste visible pour l'essentiel (au plus un quart recouvert).
    const recouvre = Math.max(0, Math.min(rc.x + rc.width, rk.x + rk.width) - Math.max(rc.x, rk.x)) * Math.max(0, Math.min(rc.y + rc.height, rk.y + rk.height) - Math.max(rc.y, rk.y))
    verifier(recouvre <= 0.25 * rc.width * rc.height, `${nom} : le clavier ne cache pas la case touchée (${Math.round((100 * recouvre) / (rc.width * rc.height))} % recouvert)`)
    await capture(page, CAPTURES, `T-${nom}-clavier`)
    await debordement('clavier')
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    // Droite graduée : éditeur.
    await page.getByRole('button', { name: 'Nouvelle page' }).click()
    await page.locator('.blanc-gabarit').click()
    await page.getByRole('radio', { name: /Droite graduée/ }).click()
    await page.getByRole('button', { name: 'Poser sur la page' }).scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Poser sur la page' }).click()
    await page.waitForTimeout(300)
    verifier(await dansFenetre(page, '.droite-editeur'), `${nom} : éditeur de la droite dans la fenêtre`)
    verifier((await pluspetiteCible(page, '.droite-editeur button, .droite-editeur input')) >= 44, `${nom} : cibles de l’éditeur ≥ 44 px`)
    await page.keyboard.press('Escape')
    // Traceur à onglets.
    await page.getByRole('button', { name: 'Nouvelle page' }).click()
    await page.locator('.blanc-fond').click()
    await page.getByRole('menuitemradio', { name: /Repère/ }).click()
    await page.waitForTimeout(300)
    await page.locator('.traceur-saisie').first().fill('a(x-1)^2+k')
    await page.getByRole('button', { name: 'Tracer' }).click()
    await page.waitForTimeout(400)
    verifier(await dansFenetre(page, '.projection-palette--traceur'), `${nom} : traceur (paramètres) dans la fenêtre`)
    verifier((await pluspetiteCible(page, '.projection-palette--traceur button, .param-curseur')) >= 44, `${nom} : cibles du traceur ≥ 44 px`)
    await capture(page, CAPTURES, `T-${nom}-traceur-parametres`)
    for (const onglet of ['Points', 'Tangente', 'Aire']) {
      await page.locator('.traceur-onglet', { hasText: onglet }).click()
      await page.waitForTimeout(200)
      verifier(await dansFenetre(page, '.projection-palette--traceur'), `${nom} : onglet ${onglet} dans la fenêtre`)
    }
    await page.getByText(/Aire sous/).first().click()
    await page.waitForTimeout(200)
    await capture(page, CAPTURES, `T-${nom}-traceur-aire`)
    await debordement('traceur')
    // Copier sur une diapo.
    await page.keyboard.press('b')
    await page.waitForTimeout(300)
    await page.keyboard.press('x')
    await glisser(page, [200, 200], [600, 330])
    verifier(await dansFenetre(page, '.copie-barre'), `${nom} : barre de copie dans la fenêtre`)
    await capture(page, CAPTURES, `T-${nom}-copier`)
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
  } catch (e) {
    console.error(e)
    verifier(false, `${nom} : exception ${e.message}`)
    await page.screenshot({ path: `${CAPTURES}/erreur-${nom}.png` }).catch(() => {})
  }
  verifier(erreurs.length === 0, `${nom} : 0 erreur console (${erreurs.slice(0, 3).join(' | ')})`)
  await ctx.close()
}
await browser.close()
srv.close()
process.exit(bilan() ? 1 : 0)
