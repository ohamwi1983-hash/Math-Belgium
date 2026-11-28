/*
 * Vérification Playwright de « Évaluations et devoirs annoncés » (fiche, modification, suppression, côté élèves).
 * NON importé par l'application. Usage :
 *   NODE_ENV=development npx vite build --mode test --outDir <build>
 *   node scripts/verif-espace/verif.mjs <build> [dossier des captures]
 * Faux client : `faux-supabase.js` ; données : `donnees.mjs` (heure figée au vendredi 27/11/2026 10 h).
 */
import { chromium, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { demarrerServeur } from './serveur.mjs'
import { C4C, C5A, C6B, CODE_6B, EV_5A, MAINTENANT, S_DEVOIR, donnees } from './donnees.mjs'

const ICI = dirname(fileURLToPath(import.meta.url))
const BUILD = process.argv[2]
const CAPTURES = process.argv[3] || join(ICI, 'captures')
const PORT = 5420
const BASE = `http://localhost:${PORT}`
if (!BUILD) {
  console.error('Usage : node scripts/verif-espace/verif.mjs <build> [captures]')
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
  try {
    return await chromium.launch()
  } catch {
    const { default: c } = await import('@sparticuz/chromium')
    return chromium.launch({ executablePath: await c.executablePath(), args: c.args.filter((a) => a !== '--single-process'), headless: true })
  }
}

async function contexte(browser, { mobile = false, sombre = false, options = {} } = {}) {
  const ctx = await browser.newContext({
    ...(mobile ? { ...devices['iPhone 13'], defaultBrowserType: undefined } : { viewport: { width: 1280, height: 900 } }),
    colorScheme: sombre ? 'dark' : 'light',
    locale: 'fr-BE',
    timezoneId: 'Europe/Brussels',
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  await ctx.addInitScript(`window.__MB_DONNEES__ = ${JSON.stringify(donnees())}; window.__MB_OPTIONS__ = ${JSON.stringify(options)};`)
  await ctx.addInitScript({ path: join(ICI, 'faux-supabase.js') })
  const page = await ctx.newPage()
  await page.clock.setFixedTime(new Date(MAINTENANT))
  const erreurs = []
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|ERR_INVALID_URL|Failed to load resource/.test(m.text())) erreurs.push(m.text())
  })
  page.on('pageerror', (e) => erreurs.push(String(e)))
  return { ctx, page, erreurs }
}

async function aller(page, chemin, attendre) {
  await page.goto(`${BASE}${chemin}`, { waitUntil: 'domcontentloaded' })
  if (attendre) await page.waitForSelector(attendre, { timeout: 20000 })
  await page.waitForTimeout(600)
}

async function largeurOk(page, quoi) {
  const r = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, w: window.innerWidth }))
  verifier(r.s <= r.w, `${quoi} : scrollWidth ${r.s} = largeur ${r.w}`)
}

const db = (page) => page.evaluate(() => window.__MB_FAUX_DB__())
const presse = (page) => page.evaluate(() => navigator.clipboard.readText())
async function capture(page, nom, el, ecran = false) {
  if (!el && !ecran) await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  if (ecran) return page.screenshot({ path: join(CAPTURES, `${nom}.png`) })
  if (el) await page.locator(el).first().screenshot({ path: join(CAPTURES, `${nom}.png`) })
  else await page.screenshot({ path: join(CAPTURES, `${nom}.png`), fullPage: true })
}

/* ------------------------------------------------------------------------------------------ scénario */

async function parcoursComplet(browser, { mobile, sombre }) {
  const nomCombo = `${mobile ? 'telephone' : 'ordinateur'}-${sombre ? 'sombre' : 'clair'}`
  console.log(`\n== Parcours complet (${nomCombo})`)
  const { ctx, page, erreurs } = await contexte(browser, { mobile, sombre })

  // 1. Écran d'annonce : deux chapitres, points numérotés, « vue … », exercices sous leur point.
  await aller(page, `/carnet/annoncer?classe=${C6B}`, '.annonce-bloc-chap')
  const blocs = await page.locator('.annonce-bloc-chap').allInnerTexts()
  verifier(blocs.length === 2, 'deux chapitres ouverts d’office (précédent + en cours)')
  verifier(/Fonctions exponentielles[\s\S]*chapitre précédent/.test(blocs[0] ?? ''), 'bloc 1 = Fonctions exponentielles · chapitre précédent')
  verifier(/Fonctions logarithmes[\s\S]*chapitre en cours/.test(blocs[1] ?? ''), 'bloc 2 = Fonctions logarithmes · chapitre en cours')
  verifier(!/[Éé]tape/.test(blocs.join('\n')), 'jamais le mot « étape » dans les points')
  verifier(/vue lundi 23\/11 \(il y a 4 jours\)/.test(blocs[0] ?? ''), '« vue lundi 23/11 (il y a 4 jours) »')
  verifier(/vue lundi 16\/11 \(il y a 11 jours\)/.test(blocs[0] ?? ''), '« vue lundi 16/11 (il y a 11 jours) »')
  verifier(/commencée mercredi 25\/11 \(il y a 2 jours\)/.test(blocs[1] ?? ''), '« commencée mercredi 25/11 (il y a 2 jours) »')
  verifier(/vue hier/.test(blocs[1] ?? ''), '« vue hier »')
  verifier(/pas encore vue/.test(blocs[1] ?? ''), '« pas encore vue »')
  const coches = await page.evaluate(() => [...document.querySelectorAll('.annonce-bloc-chap')].map((b) => [...b.querySelectorAll('.annonce-point > .annonce-case')].map((l) => `${l.textContent.trim().slice(0, 3)}:${l.querySelector('input').checked}`)))
  verifier(coches[0]?.some((x) => x.startsWith('7.') && x.endsWith('true')) && coches[0]?.some((x) => x.startsWith('6.') && x.endsWith('false')), 'chapitre précédent : point 7 coché (≤ 7 jours), point 6 non')
  verifier(coches[1]?.some((x) => x.startsWith('1.') && x.endsWith('true')) && coches[1]?.some((x) => x.startsWith('2.') && x.endsWith('true')), 'chapitre en cours : points vus / commencés cochés')
  verifier((await page.locator('.annonce-exos .annonce-code', { hasText: '6gen147' }).count()) === 1, '6gen147 rangé sous son point')
  verifier((await page.locator('.annonce-comp.pris').count()) === 3, 'trois compétences cochées d’office')
  if (!mobile && !sombre) await capture(page, '01-annonce-ordinateur')
  if (mobile && !sombre) {
    // Téléphone : des captures de l'écran (une capture « pleine page » recopie les barres fixes au milieu).
    await capture(page, '02-annonce-telephone', null, true)
    await page.locator('.annonce-bloc-chap').nth(1).scrollIntoViewIfNeeded()
    await capture(page, '02b-annonce-telephone-points', null, true)
    await page.locator('button', { hasText: /^Annoncer$/ }).first().scrollIntoViewIfNeeded()
    await capture(page, '02c-annonce-telephone-publier', null, true)
    await page.evaluate(() => window.scrollTo(0, 0))
  }

  // 2. Date, Transférer décoché, un exercice retiré.
  await page.locator('.annonce-puce', { hasText: 'ven. 4/12' }).first().click()
  await page.locator('.annonce-comp', { hasText: 'Transférer' }).click()
  verifier((await page.locator('.annonce-exos .be-comp-3').count()) === 0, 'Transférer décoché : plus aucun exercice de compétence 3')
  await page.locator('.annonce-exo', { hasText: '6gen86' }).click()
  verifier((await page.locator('.annonce-exo.retire', { hasText: '6gen86' }).count()) === 1, '6gen86 retiré (barré)')
  const apercu = await page.locator('.annonce-apercu').innerText()
  verifier(/Interro vendredi 4\/12 · 3e heure/.test(apercu), `aperçu : « Interro vendredi 4/12 · 3e heure » (${apercu.split('\n')[1]})`)
  verifier(apercu.includes('6gen147') && apercu.includes('6gen13') && !apercu.includes('6gen86') && !apercu.includes('6gen12 ') && !apercu.includes('6gen150'), 'aperçu : exercices retenus seulement')
  verifier(/Connaître/.test(apercu) && apercu.includes('6gen65') && apercu.includes('6gen66'), 'aperçu : ligne Connaître avec 6gen65 et 6gen66')
  verifier(!/Transférer/.test(await page.locator('.annonce-apercu .be-comps').innerText()), 'aperçu : Transférer absent des compétences')
  await page.locator('.annonce-publier .annonce-case', { hasText: 'Copier le texte' }).click()
  const texteVu = await page.locator('.annonce-texte pre').textContent({ timeout: 2000 }).catch(() => '')
  await page.locator('button', { hasText: /^Annoncer$/ }).click()
  await page.waitForURL(/\/carnet\/classe\//, { timeout: 15000 })
  await page.waitForTimeout(1500)
  const copie1 = await presse(page)
  verifier(copie1.includes('6gen147') && copie1.includes('Je prépare mon interro : https://math-belgium.vercel.app/suivi/plan?'), 'texte copié : codes + lien du plan')
  verifier(copie1 === texteVu || texteVu === '', 'texte copié = texte montré dans « Voir le texte copié »')
  let base = await db(page)
  const evs = base.evenements.filter((e) => e.classe_id === C6B && e.type === 'interrogation')
  verifier(evs.length === 1 && evs[0].du === '2026-12-04' && evs[0].heure_debut === 3 && evs[0].intitule === '', 'événement créé (4/12, 3e heure, intitulé vide = Interro)')
  const ev = evs[0]
  verifier(ev?.chapitre === '6e-6h/fonctions-exponentielles', 'événement : premier chapitre dans « chapitre »')
  const sup = base.seances.find((s) => s.evaluation_evenement === ev?.id)
  verifier(!!sup && sup.parties.length === 0, 'séance d’annonce sans matière vue')
  verifier(JSON.stringify(sup?.evaluation_parties) === JSON.stringify(['problemes', 'fonctions-logarithmes#proprietes', 'fonctions-logarithmes#equations']), `parties : ${JSON.stringify(sup?.evaluation_parties)}`)
  verifier(sup?.evaluation_generateurs.includes('6gen65') && !sup?.evaluation_generateurs.includes('6gen86') && !sup?.evaluation_generateurs.includes('6gen12'), 'générateurs retenus (quiz Connaître compris, retirés et Transférer absents)')
  verifier(JSON.stringify(sup?.evaluation_competences) === '[1,2]', `compétences enregistrées (0013) : ${JSON.stringify(sup?.evaluation_competences)}`)
  const page6B = base.pages_classe.find((p) => p.classe_id === C6B)
  const pub = page6B?.contenu?.interros?.[0]
  verifier(pub?.chapitres?.length === 2 && pub?.id === ev?.id && pub?.nom === 'Interro', 'page des élèves republiée (2 chapitres, id, nom)')

  // 3. Fiche depuis Ma semaine (étiquette = bouton à part).
  await aller(page, '/carnet/semaine', '.carnet-vue-semaine')
  await page.locator('button[aria-label="Semaine suivante"]').click()
  await page.waitForTimeout(500)
  if (mobile) {
    const onglet = page.locator('.carnet-jour-onglet', { hasText: /4/ }).last()
    if (await onglet.count()) await onglet.click()
  }
  const etiquette = page.locator('.agenda-etiquette-eval', { hasText: /xponentielles/ }).first()
  verifier((await etiquette.count()) > 0, 'Ma semaine : étiquette de l’évaluation')
  const imbrique = await page.evaluate(() => [...document.querySelectorAll('.agenda-etiquette-eval')].some((b) => b.parentElement?.closest('button')))
  verifier(!imbrique, 'étiquette jamais dans un bouton')
  if (mobile) {
    const h = await etiquette.evaluate((b) => b.getBoundingClientRect().height)
    verifier(h >= 44, `étiquette ≥ 44 px sur téléphone (${Math.round(h)})`)
  }
  const fond = await etiquette.evaluate((b) => getComputedStyle(b).backgroundColor)
  await etiquette.click()
  await page.waitForSelector('.carnet-panneau.feuille')
  const fiche = await page.locator('.carnet-panneau').innerText()
  verifier(/Interro · 6e B/i.test(fiche) && /Vendredi 4\/12 · 3e heure · dans 7 jours/.test(fiche), 'fiche : nom, classe, date, heure, dans 7 jours')
  verifier(/J−7 : à préparer/.test(fiche), 'fiche : rappel J−7')
  verifier(fiche.includes('6gen147') && fiche.includes('6gen14') && !fiche.includes('6gen86'), 'fiche : exercices retenus')
  verifier(/Connaître[\s\S]*Appliquer/.test(fiche) && !/Transférer/.test(fiche.split('Contenu')[0]), 'fiche : compétences retenues')
  verifier(!/[Éé]tape/.test(fiche), 'fiche : jamais « étape »')
  verifier(/annoncée/i.test(fiche) && /vendredi 27\/11/.test(fiche), 'fiche : annoncée le vendredi 27/11')
  verifier(fond !== '', `étiquette couleur ${fond}`)
  if (!mobile && !sombre) {
    await capture(page, '03-fiche-ordinateur', null, true)
    await page.locator('.carnet-panneau button', { hasText: /Supprimer l/ }).first().scrollIntoViewIfNeeded()
    await capture(page, '03b-fiche-ordinateur-bas', null, true)
    await page.locator('.carnet-panneau .fi-tete, .carnet-panneau h2').first().scrollIntoViewIfNeeded()
  }
  if (mobile && sombre) await capture(page, '04-fiche-telephone-sombre', null, true)
  await page.locator('.carnet-panneau button', { hasText: 'Copier le texte' }).click()
  await page.waitForTimeout(500)
  verifier((await presse(page)) === copie1, 'fiche : « Copier le texte » = texte de l’annonce')
  const prep = await page.locator('.carnet-panneau a', { hasText: 'Préparer l’évaluation' }).getAttribute('href')
  verifier(/fonctions-exponentielles:problemes/.test(decodeURIComponent(prep ?? '')) && /fonctions-logarithmes:proprietes,equations/.test(decodeURIComponent(prep ?? '')), 'Préparer l’évaluation : les deux chapitres dans ?matiere=')
  await page.keyboard.press('Escape')
  await largeurOk(page, 'Ma semaine')

  // 4. Les autres portes vers la même fiche.
  const portes = [
    ['/espace', `a[href*="fiche=${ev.id}"]`, 'tableau de bord « À venir »'],
    ['/carnet', `a[href*="fiche=${ev.id}"]`, 'carte de la classe (Mes classes)'],
  ]
  for (const [chemin, sel, quoi] of portes) {
    await aller(page, chemin, sel)
    await page.locator(sel).first().click()
    const vu = await page.waitForSelector('.carnet-panneau.feuille', { timeout: 15000 }).then(() => true, () => false)
    verifier(vu, `fiche ouverte depuis ${quoi}`)
    await page.keyboard.press('Escape')
  }
  await aller(page, `/carnet/classe/${C6B}`, '.carnet-vue-classe')
  await page.locator('.agenda-a-venir-ligne', { hasText: 'Interro' }).first().click()
  verifier(await page.waitForSelector('.carnet-panneau.feuille', { timeout: 8000 }).then(() => true, () => false), 'fiche ouverte depuis la page de la classe')
  await page.keyboard.press('Escape')
  await aller(page, '/carnet/semaine', '.carnet-vue-semaine')
  await page.locator('button[aria-label="Semaine suivante"]').click()
  await page.locator('.agenda-a-venir-ligne', { hasText: 'Interro' }).first().click()
  verifier(await page.waitForSelector('.carnet-panneau.feuille', { timeout: 8000 }).then(() => true, () => false), 'fiche ouverte depuis « Événements de la semaine »')
  await page.keyboard.press('Escape')
  await aller(page, `/carnet/agenda?classe=${C6B}`, 'input[type="date"]')
  const dates = page.locator('input[type="date"]')
  await dates.nth(0).fill('2026-11-30')
  await dates.nth(1).fill('2026-12-11')
  await page.waitForTimeout(400)
  const ligneAgenda = page.locator('.agenda-a-venir-ligne', { hasText: 'Interro' }).first()
  if (await ligneAgenda.count()) {
    await ligneAgenda.click()
    verifier(await page.waitForSelector('.carnet-panneau.feuille', { timeout: 8000 }).then(() => true, () => false), 'fiche ouverte depuis l’Agenda')
    await page.keyboard.press('Escape')
  } else verifier(false, 'Agenda : ligne de l’interro')

  // 5. Côté élèves : page de classe, carte « Ma classe », plan.
  await aller(page, `/classe?code=${CODE_6B}`, '.be')
  const eleve = await page.locator('.cl-evaluation').first().innerText()
  verifier(/Interro vendredi 4\/12 · 3e heure/.test(eleve) && /dans 7 jours/.test(eleve), 'page des élèves : titre, heure, dans 7 jours')
  verifier(eleve.includes('6gen147') && eleve.includes('6gen66') && !eleve.includes('6gen86'), 'page des élèves : mêmes codes')
  verifier(!/[Éé]tape/.test(eleve), 'page des élèves : jamais « étape »')
  const liens = await page.locator('.cl-evaluation a.be-code').count()
  verifier(liens >= 5, `codes = liens vers les générateurs (${liens})`)
  const plan = await page.locator('.cl-evaluation a.be-bouton').getAttribute('href')
  verifier(/etapes=fonctions-exponentielles%23problemes,fonctions-logarithmes%23proprietes,fonctions-logarithmes%23equations/.test(plan ?? '') && /id=/.test(plan ?? ''), `lien du plan multi-chapitres (${plan})`)
  await largeurOk(page, 'page des élèves')
  if (mobile && !sombre) {
    await page.addStyleTag({ content: '.ge-barre { visibility: hidden !important; }' })
    await capture(page, '05-page-eleves-telephone')
    await page.addStyleTag({ content: '.ge-barre { visibility: visible !important; }' })
  }
  if (!mobile && !sombre) await capture(page, '05b-page-eleves-ordinateur')
  await page.evaluate(() => { localStorage.setItem('accueil:annee', '6e-6h'); localStorage.setItem('accueil:visite', '1') })
  await aller(page, '/', '.ge-classe')
  const carte = await page.locator('.ge-classe').innerText()
  verifier(/Interro vendredi 4\/12/.test(carte) && /Voir le contenu/.test(carte), 'carte « Ma classe » repliée : date + nom + « Voir le contenu »')
  await page.locator('.ge-classe-contenu summary').click()
  verifier((await page.locator('.ge-classe .be-code', { hasText: '6gen147' }).count()) === 1, 'carte « Ma classe » dépliée : contenu')
  if (mobile && !sombre) {
    // Capture d'un élément plus haut que l'écran : la barre fixe du bas serait recopiée au milieu.
    await page.addStyleTag({ content: '.ge-barre { visibility: hidden !important; }' })
    await capture(page, '06-carte-ma-classe', '.ge-classe')
    await page.addStyleTag({ content: '.ge-barre { visibility: visible !important; }' })
  }
  await largeurOk(page, 'accueil')
  await page.locator('.ge-classe a', { hasText: 'Je prépare mon interro' }).click()
  await page.waitForSelector('.plan-entete')
  const tete = await page.locator('.plan-entete').innerText()
  verifier(/Interro/.test(tete) && /exponentielles/i.test(tete) && /logarithmes/i.test(tete), 'plan prérempli avec les deux chapitres')
  await page.locator('button', { hasText: 'Faire mon plan' }).click()
  await page.waitForTimeout(400)
  const planGarde = await page.evaluate(() => JSON.parse(localStorage.getItem('suivi:plan:v1') || 'null'))
  verifier(planGarde?.annonceId === ev.id && planGarde?.etapes?.length === 3 && planGarde?.gens?.includes('6gen147'), 'plan gardé : annonce, 3 points, exercices')

  // 6. Modifier : date + un point ajouté.
  await aller(page, `/carnet/classe/${C6B}?fiche=${ev.id}`, '.carnet-panneau.feuille')
  await page.locator('.carnet-panneau button', { hasText: 'Modifier' }).click()
  await page.waitForSelector('.annonce-bandeau-modif')
  verifier(/Tu modifies l’interro du vendredi 4\/12 \(6e B\)/.test(await page.locator('.annonce-bandeau-modif').innerText()), 'bandeau « Tu modifies l’interro du vendredi 4/12 (6e B) »')
  await page.locator('.annonce-puce', { hasText: 'autre date' }).click()
  await page.locator('#' + (await page.locator('input[type="date"]').first().getAttribute('id'))).fill('2026-12-08')
  await page.waitForTimeout(300)
  const choixHeure = page.locator('.annonce-autre select')
  if (await choixHeure.count()) await choixHeure.selectOption({ index: 1 })
  verifier((await page.locator('.annonce-puce.ancienne s').count()) === 1, 'ancienne date barrée')
  verifier(/date changée/.test(await page.locator('.annonce-carte').innerText()), '« date changée — avant : … »')
  await page.locator('.annonce-bloc-chap', { hasText: 'Fonctions logarithmes' }).locator('.annonce-point > .annonce-case', { hasText: /^3\./ }).click()
  verifier((await page.locator('.annonce-marque.ajoute').count()) >= 1, 'marque « ajouté(e) »')
  verifier(/Fonctions logarithmes[\s\S]*chapitre en cours/.test(await page.locator('.annonce-bloc-chap').nth(1).innerText()), 'modification : rôles des chapitres gardés (la séance d’annonce ne change pas le chapitre en cours)')
  const recap = await page.locator('.annonce-changements').innerText()
  verifier(/Date[\s\S]*ven\. 4\/12 · 3e h → mar\. 8\/12 · 1re h/.test(recap), `récapitulatif : date (${recap.replace(/\n/g, ' | ')})`)
  verifier(/Points[\s\S]*\+ 3\./.test(recap), 'récapitulatif : point ajouté')
  const msg = await page.locator('.annonce-message').innerText()
  verifier(/Changement pour l’interro de mathématiques \(6e B\) : elle est déplacée au mardi 8\/12, 1re heure\./.test(msg), `message : ${msg}`)
  if (!mobile && !sombre) await capture(page, '07-modification')
  await page.locator('button', { hasText: 'Enregistrer les modifications' }).click()
  await page.waitForSelector('.carnet-panneau.feuille', { timeout: 15000 })
  await page.waitForTimeout(1200)
  verifier((await presse(page)) === msg, 'message copié = message montré')
  base = await db(page)
  const evs2 = base.evenements.filter((e) => e.classe_id === C6B && e.type === 'interrogation')
  verifier(evs2.length === 1 && evs2[0].id === ev.id && evs2[0].du === '2026-12-08' && evs2[0].heure_debut === 1, 'même événement mis à jour (8/12, 1re heure)')
  const sup2 = base.seances.find((s) => s.evaluation_evenement === ev.id)
  verifier(sup2?.id === sup?.id && sup2?.evaluation_parties.includes('fonctions-logarithmes#inequations'), 'même séance d’annonce, point ajouté')
  verifier(/Mardi 8\/12 · 1re heure/.test(await page.locator('.carnet-panneau').innerText()), 'la fiche se rouvre avec le nouveau contenu')
  await page.keyboard.press('Escape')
  await aller(page, '/carnet/semaine', '.carnet-vue-semaine')
  await page.locator('button[aria-label="Semaine suivante"]').click()
  await page.locator('button[aria-label="Semaine suivante"]').click()
  if (mobile) {
    const onglet = page.locator('.carnet-jour-onglet', { hasText: /8/ }).first()
    if (await onglet.count()) await onglet.click()
  }
  verifier((await page.locator('.agenda-etiquette-eval').count()) >= 1, 'étiquette déplacée dans la case du mardi 8/12')

  // 7. Côté élève : « date changée », « Ton interro a changé ».
  await aller(page, '/classe', '.be')
  verifier(/date changée[\s\S]*avant : ven\. 4\/12/.test(await page.locator('.cl-evaluation').first().innerText()), 'page des élèves : « date changée — avant : ven. 4/12 »')
  await aller(page, '/', '.ge-classe')
  verifier(/date changée/.test(await page.locator('.ge-classe').innerText()), 'carte « Ma classe » : « date changée »')
  await aller(page, '/suivi/plan', '.plan-entete')
  await page.waitForSelector('.plan-avis', { timeout: 5000 }).catch(() => undefined)
  verifier(/Ton interro a changé/.test(await page.locator('main').innerText()), 'plan : « Ton interro a changé »')
  await page.locator('.plan-avis button', { hasText: 'Mettre mon plan à jour' }).click()
  const planMaj = await page.evaluate(() => JSON.parse(localStorage.getItem('suivi:plan:v1') || 'null'))
  verifier(planMaj?.interro === '2026-12-08' && planMaj?.etapes?.length === 4, 'plan mis à jour (8/12, 4 points)')

  // 8. Supprimer.
  await aller(page, `/carnet/classe/${C6B}?fiche=${ev.id}`, '.carnet-panneau.feuille')
  await page.locator('.carnet-panneau button', { hasText: 'Supprimer l’évaluation' }).click()
  await page.waitForSelector('.fi-confirmer')
  const conf = await page.locator('.fi-confirmer').innerText()
  verifier(/Supprimer l’interro du mardi 8\/12 \(6e B\) \?/.test(conf), 'confirmation : « Supprimer l’interro du mardi 8/12 (6e B) ? »')
  verifier(/L’interro de mathématiques du mardi 8\/12 \(6e B\) est annulée\./.test(conf), 'confirmation : message pour les élèves')
  if (!mobile && !sombre) await capture(page, '08-confirmation-suppression', '.carnet-panneau')
  if (mobile && !sombre) await capture(page, '08b-confirmation-telephone', null, true)
  await page.keyboard.press('Escape')
  verifier((await page.locator('.fi-confirmer').count()) === 0 && (await page.locator('.carnet-panneau').count()) === 1, 'Échap : « Garder », la fiche reste ouverte')
  await page.locator('.carnet-panneau button', { hasText: 'Supprimer l’évaluation' }).click()
  await page.locator('.fi-confirmer button', { hasText: 'Supprimer l’interro' }).click()
  await page.waitForTimeout(1500)
  base = await db(page)
  verifier(!base.evenements.some((e) => e.id === ev.id), 'événement supprimé')
  verifier(!base.seances.some((s) => s.id === sup?.id), 'séance d’annonce vide supprimée')
  verifier(base.seances.filter((s) => s.classe_id === C6B && s.parties.length > 0).length === 5, 'matière vue intacte (5 séances)')
  verifier(!(base.pages_classe.find((p) => p.classe_id === C6B)?.contenu?.interros ?? []).length, 'page des élèves : plus d’évaluation')
  verifier((await presse(page)) === 'L’interro de mathématiques du mardi 8/12 (6e B) est annulée.', 'message de suppression copié')
  await aller(page, '/classe', '.cl-titre')
  await aller(page, '/suivi/plan', '.plan-entete')
  await page.waitForSelector('.plan-avis', { timeout: 5000 }).catch(() => undefined)
  verifier(/Cette interro a été retirée par ton professeur/.test(await page.locator('main').innerText()), 'plan : « Cette interro a été retirée par ton professeur »')
  verifier((await page.locator('.plan-avis button', { hasText: 'Effacer mon plan' }).count()) === 1, 'plan : garder / effacer')

  // 9. Devoir : fiche, modifier, supprimer.
  await aller(page, `/carnet/classe/${C4C}?devoir=${S_DEVOIR}`, '.carnet-panneau.feuille')
  const fd = await page.locator('.carnet-panneau').innerText()
  verifier(/Devoir · 4e C/i.test(fd) && /Devoir pour le mercredi 2\/12/.test(fd) && fd.includes('gen7') && fd.includes('Exercices 4 et 5 page 32'), 'fiche du devoir : consigne, pour le, exercice')
  if (!mobile && !sombre) await capture(page, '09-fiche-devoir', '.carnet-panneau')
  await page.locator('.carnet-panneau button', { hasText: 'Modifier' }).click()
  await page.waitForSelector('.annonce-bandeau-modif')
  await page.locator('textarea').fill('Exercices 4, 5 et 6 page 32')
  await page.waitForTimeout(300)
  verifier(/Consigne/.test(await page.locator('.annonce-changements').innerText()), 'devoir : récapitulatif « Consigne »')
  await page.locator('button', { hasText: 'Enregistrer les modifications' }).click()
  await page.waitForSelector('.carnet-panneau.feuille', { timeout: 15000 })
  base = await db(page)
  verifier(base.seances.find((s) => s.id === S_DEVOIR)?.devoir === 'Exercices 4, 5 et 6 page 32', 'devoir modifié (même séance)')
  await page.locator('.carnet-panneau button', { hasText: 'Supprimer le devoir' }).click()
  await page.locator('.fi-confirmer button', { hasText: 'Supprimer le devoir' }).click()
  await page.waitForTimeout(1200)
  base = await db(page)
  verifier(!base.seances.some((s) => s.id === S_DEVOIR), 'devoir supprimé (séance vide supprimée)')
  verifier(base.seances.some((s) => s.classe_id === C4C && s.parties.length > 0), 'matière vue de la 4e C intacte')

  // 10. Ancienne annonce (format d'avant) : relue, modifiable.
  await aller(page, `/carnet/classe/${C5A}?fiche=${EV_5A}`, '.carnet-panneau.feuille')
  const fa = await page.locator('.carnet-panneau').innerText()
  verifier(/Interro · 5e A/i.test(fa) && /1\. /.test(fa) && /2\. /.test(fa), 'ancienne annonce relue (nom, points 1 et 2)')
  await page.locator('.carnet-panneau button', { hasText: 'Modifier' }).click()
  await page.waitForSelector('.annonce-bandeau-modif')
  await page.locator('.annonce-puce', { hasText: /^Contrôle$/ }).click()
  await page.locator('button', { hasText: 'Enregistrer les modifications' }).click()
  await page.waitForSelector('.carnet-panneau.feuille', { timeout: 15000 })
  base = await db(page)
  verifier(base.evenements.find((e) => e.id === EV_5A)?.intitule === 'Contrôle', 'ancienne annonce : nom « Contrôle » enregistré')
  verifier(/Contrôle · 5e A/i.test(await page.locator('.carnet-panneau').innerText()), 'fiche : « Contrôle »')

  // 11. Panneau des évaluations prérempli avec deux chapitres (lien « Préparer » d'une annonce multi-chapitres).
  if (prep) {
    await aller(page, prep, '.admin-eval-carnet')
    verifier(/Matière vue/.test(await page.locator('.admin-eval-carnet').innerText()), 'panneau des évaluations : bandeau « Matière vue »')
  }

  verifier(erreurs.length === 0, `0 erreur console (${erreurs.slice(0, 3).join(' | ')})`)
  await ctx.close()
}

/* Sans 0013 : compétences déduites, note au professeur seulement. */
async function sans0013(browser) {
  console.log('\n== Sans 0013')
  const { ctx, page, erreurs } = await contexte(browser, { options: { sans0013: true } })
  await aller(page, `/carnet/annoncer?classe=${C6B}`, '.annonce-bloc-chap')
  verifier((await page.locator('.annonce-note-0013').count()) === 1, 'note « applique la migration 0013 »')
  await page.locator('.annonce-puce', { hasText: 'ven. 4/12' }).first().click()
  await page.locator('button', { hasText: /^Annoncer$/ }).click()
  await page.waitForURL(/\/carnet\/classe\//, { timeout: 15000 })
  await page.waitForTimeout(1000)
  const base = await db(page)
  const ev = base.evenements.find((e) => e.classe_id === C6B)
  verifier(!!ev && base.seances.some((s) => s.evaluation_evenement === ev.id), 'annonce enregistrée sans 0013')
  const ecrit = await page.evaluate(() => window.__MB_JOURNAL__.some((j) => JSON.stringify(j.valeurs ?? {}).includes('evaluation_competences')))
  verifier(!ecrit, 'colonne 0013 jamais écrite')
  verifier(erreurs.length === 0, `0 erreur console (${erreurs.slice(0, 2).join(' | ')})`)
  await ctx.close()
}

const browser = await navigateur()
const serveur = await demarrerServeur(BUILD, PORT)
await mkdir(CAPTURES, { recursive: true })
try {
  for (const mobile of [false, true]) for (const sombre of [false, true]) await parcoursComplet(browser, { mobile, sombre })
  await sans0013(browser)
} catch (e) {
  echecs.push(`exception : ${e.message.split('\n')[0]}`)
  console.error(e)
} finally {
  await browser.close()
  serveur.close()
}
console.log(`\n${ok} vérifications réussies, ${echecs.length} échec(s).`)
if (echecs.length) {
  for (const e of echecs) console.log(` - ${e}`)
  process.exit(1)
}
