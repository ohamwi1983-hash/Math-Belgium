/*
 * Deux écrans (vue du professeur + fenêtre des diapos, même navigateur) : gabarits, traceur enrichi (animation partagée),
 * points, copier / coller, repères. NON importé par l'application.
 * Usage : node scripts/verif-projection/verif-deux-ecrans.mjs <build|dev> <dossier des captures>
 */
import { mkdir } from 'node:fs/promises'
import { BASE, capture, compteur, contexte, ecran, navigateur, pluspetiteCible, serveur } from './commun.mjs'

const [, , BUILD, CAPTURES = 'captures-deux-ecrans'] = process.argv
await mkdir(CAPTURES, { recursive: true })
const { verifier, bilan } = compteur()
const srv = await serveur(BUILD)
const browser = await navigateur()
const { ctx, page: prof, erreurs } = await contexte(browser, { largeur: 1280, hauteur: 720 })
const URL = '/6e-6h/coniques/projeter?etapes=excentricite'
try {
  await prof.goto(`${BASE}${URL}&role=prof`, { waitUntil: 'domcontentloaded' })
  await prof.waitForSelector('.prof-scene .diapo', { timeout: 40000 })
  const classe = await ctx.newPage()
  await classe.setViewportSize({ width: 1280, height: 720 })
  await classe.goto(`${BASE}${URL}&role=diapos`, { waitUntil: 'domcontentloaded' })
  await classe.waitForSelector('.projection-scene-diapo .diapo', { timeout: 40000 })
  await classe.getByRole('button', { name: 'Continuer sans' }).click()
  await prof.waitForTimeout(800)
  await prof.getByRole('button', { name: /Suivant/ }).click()
  await prof.waitForTimeout(500)
  verifier((await classe.locator('.projection-scene-diapo .diapo--essentiel').count()) === 1, 'Deux écrans : diapo suivie au tableau')

  // Copier depuis la vue du professeur.
  await prof.locator('.prof-stylo').getByRole('button', { name: 'Copier un morceau de la diapo' }).click()
  const S = '.prof-scene'
  const [x0, y0] = await ecran(prof, [110, 455], S)
  const [x1, y1] = await ecran(prof, [430, 532], S)
  await prof.mouse.move(x0, y0)
  await prof.mouse.down()
  await prof.mouse.move(x1, y1, { steps: 8 })
  await prof.mouse.up()
  verifier((await pluspetiteCible(prof, '.copie-bouton')) >= 44, 'Deux écrans : boutons de copie ≥ 44 px réels dans la vue réduite')
  verifier((await classe.locator('.copie-calque').count()) === 0, 'Deux écrans : rien de la sélection au tableau')
  await capture(prof, CAPTURES, 'D-1-prof-copier')
  await prof.getByRole('button', { name: /Coller sur une page blanche/ }).click()
  await prof.waitForTimeout(900)
  verifier((await classe.locator('.objet-pose .morceau .katex').count()) > 0, 'Deux écrans : morceau collé reçu au tableau (page blanche ouverte)')
  verifier((await classe.locator('.objet-cadre').count()) === 0, 'Deux écrans : la sélection reste chez le professeur')
  verifier((await classe.locator('.repere-rattache').count()) === 0, 'Deux écrans : pas de rappel « Page blanche de… » au tableau')

  // Gabarit posé et rempli depuis la vue du professeur.
  await prof.getByRole('button', { name: 'Nouvelle page' }).click()
  await prof.locator('.blanc-gabarit').click()
  await prof.getByRole('radio', { name: /Tableau de signes/ }).click()
  await prof.getByRole('button', { name: 'Poser sur la page' }).click()
  await prof.waitForTimeout(400)
  await prof.locator('.prof-scene .gabarit-case[data-case="v1"]').click()
  await prof.locator('.clavier-champ').type('-3')
  await prof.locator('.prof-scene .gabarit-case[data-case="s1-0"]').click()
  await prof.getByRole('button', { name: 'signe moins' }).click()
  verifier((await pluspetiteCible(prof, '.clavier-touche')) >= 44, 'Deux écrans : touches du petit clavier ≥ 44 px réels (vue réduite)')
  await prof.waitForTimeout(500)
  verifier((await classe.locator('.gabarit-case[data-case="v1"] .katex').count()) === 1, 'Deux écrans : case remplie reçue au tableau')
  verifier((await classe.locator('.gabarit-clavier').count()) === 0, 'Deux écrans : le petit clavier reste chez le professeur')
  await capture(prof, CAPTURES, 'D-2-prof-gabarit')
  await capture(classe, CAPTURES, 'D-3-classe-gabarit')
  await prof.keyboard.press('Escape')
  await prof.keyboard.press('Escape')

  // Traceur : paramètre animé, vu au tableau en même temps.
  await prof.getByRole('button', { name: 'Nouvelle page' }).click()
  await prof.locator('.prof-scene-zone .blanc-fond').click()
  await prof.getByRole('menuitemradio', { name: /Repère/ }).click()
  await prof.waitForTimeout(300)
  await prof.locator('.traceur-saisie').first().fill('a x^2 - 2')
  await prof.getByRole('button', { name: 'Tracer' }).click()
  await prof.waitForTimeout(300)
  await prof.getByRole('button', { name: /^Animer a/ }).click()
  await classe.waitForTimeout(1500)
  const t1 = await classe.locator('.traceur-calque--enrichi .traceur-boite').first().getAttribute('data-tex')
  await classe.waitForTimeout(800)
  const t2 = await classe.locator('.traceur-calque--enrichi .traceur-boite').first().getAttribute('data-tex')
  verifier(!!t1 && t1 !== t2, `Deux écrans : l’animation tourne au tableau (${t1} → ${t2})`)
  const tp = await prof.locator('.traceur-calque--enrichi .traceur-boite').first().getAttribute('data-tex')
  verifier(!!tp, 'Deux écrans : … et chez le professeur')
  await capture(classe, CAPTURES, 'D-4-classe-animation')
  await prof.getByRole('button', { name: /^Arrêter l’animation de a/ }).click()
  await prof.waitForTimeout(400)
  const v1 = await classe.locator('.traceur-calque--enrichi .traceur-boite').first().getAttribute('data-tex')
  await classe.waitForTimeout(500)
  const v2 = await classe.locator('.traceur-calque--enrichi .traceur-boite').first().getAttribute('data-tex')
  verifier(v1 === v2, 'Deux écrans : ⏸ arrête aussi au tableau')

  // Points et tangente.
  await prof.locator('.traceur-onglet', { hasText: 'Tangente' }).click()
  await prof.getByText(/Tangente à/).first().click()
  await prof.waitForTimeout(400)
  verifier((await classe.locator('.traceur-calque--enrichi .traceur-boite[data-tex*="pente"]').count()) === 1, 'Deux écrans : tangente reçue au tableau')
  await prof.locator('.traceur-onglet', { hasText: 'Points' }).click()
  await prof.locator('.onglet-points .traceur-saisie').fill('A(1 ; 2)')
  await prof.locator('.onglet-points .traceur-saisie').press('Enter')
  await prof.waitForTimeout(400)
  verifier((await classe.locator('.traceur-nom-point').count()) === 1, 'Deux écrans : point reçu au tableau')
  await capture(classe, CAPTURES, 'D-5-classe-traceur')

  // Retour à la diapo : repère « n pages blanches » chez le professeur seulement ; pastille sur « Écran blanc ».
  await prof.getByRole('button', { name: /Rallumer/ }).click()
  await prof.waitForTimeout(500)
  verifier((await prof.locator('.prof-scene .repere-blanches').count()) === 1, 'Deux écrans : « n pages blanches › » chez le professeur')
  verifier((await classe.locator('.repere-blanches').count()) === 0, 'Deux écrans : jamais sur l’écran de la classe')
  verifier((await prof.locator('.prof-actions .projection-outil-pastille').textContent()) === '3', 'Deux écrans : pastille « 3 » sur le bouton Écran blanc de la vue du professeur')
  await capture(prof, CAPTURES, 'D-6-prof-repere')
} catch (e) {
  console.error(e)
  verifier(false, `Exception : ${e.message}`)
  await prof.screenshot({ path: `${CAPTURES}/erreur-deux-ecrans.png` }).catch(() => {})
}
verifier(erreurs.length === 0, `0 erreur console (${erreurs.slice(0, 4).join(' | ')})`)
await ctx.close()
await browser.close()
srv.close()
process.exit(bilan() ? 1 : 0)
