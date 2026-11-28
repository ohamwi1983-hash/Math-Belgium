// Contrôle de lisibilité (français simple) — voir `.claude/rules/content-authoring.md`, « Français simple
// et mots du cours ».
//   npm run controle:lisibilite                 contrôle les chapitres déclarés (scripts/lisibilite/
//                                               chapitres-francais-simple.json) ; échec = build bloqué
//   npm run controle:lisibilite -- --rapport    + rapport de TOUS les chapitres (jamais bloquant)
//   npm run controle:lisibilite -- --json f.json   rapport complet en JSON (pour la suite du chantier)
//   npm run controle:lisibilite -- --plus 20 4e/statistique-descriptive   phrases de plus de 20 mots d'un
//                                               chapitre (aide à la réécriture : viser 20 mots au plus)
// Pour un chapitre déclaré, échec si : une phrase dépasse 25 mots sans exception écrite (énumération,
// formule longue), un mot de manuel de la liste noire est employé sans être expliqué au lexique, un mot
// du cours d'un thème du chapitre est employé sans être au lexique, ou un mot du lexique n'est jamais
// repéré dans le texte (forme mal écrite). Même mécanisme que scripts/verifier-liens-chapitres.mjs.
import { readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'vite'
import { mesurer, nombreMots, phrases, textesDuChapitre, texteSimple } from './lisibilite/mesure.mjs'

const lireJson = (f) => JSON.parse(readFileSync(new URL(`./lisibilite/${f}`, import.meta.url), 'utf8'))
const declares = lireJson('chapitres-francais-simple.json').chapitres
const manuel = lireJson('mots-de-manuel.json').mots
const vocabulaire = lireJson('vocabulaire-cours.json')

const args = process.argv.slice(2)
const rapport = args.includes('--rapport')
const jsonIdx = args.indexOf('--json')
const fichierJson = jsonIdx >= 0 ? args[jsonIdx + 1] : null
const plusIdx = args.indexOf('--plus')
const plus = plusIdx >= 0 ? { seuil: Number(args[plusIdx + 1]), chapitre: args[plusIdx + 2] } : null

const vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, entries: [] } })
let LEVELS, mots
try {
  ;({ LEVELS } = await vite.ssrLoadModule('/src/content/chaptersIndex.ts'))
  mots = await vite.ssrLoadModule('/src/lib/motsDuCours.ts')
} finally {
  await vite.close()
}

const arrondi = (x) => Math.round(x * 10) / 10
let erreurs = 0
const erreur = (m) => {
  erreurs++
  console.error(`✗ ${m}`)
}
const tous = []

for (const level of LEVELS) {
  for (const ch of level.chapters) {
    const ref = `${level.slug}/${ch.slug}`
    const decl = declares.find((d) => d.chapitre === ref)
    if (plus && plus.chapitre === ref) {
      for (const t of textesDuChapitre(ch)) {
        if (t.court) continue
        for (const p of phrases(t.texte)) if (nombreMots(p) > plus.seuil) console.log(`  ${nombreMots(p)} mots · ${t.chemin} · ${p}`)
      }
    }
    const lexiqueFormes = (ch.lexique ?? []).flatMap((m) => mots.formesDe(m))
    const vocab = decl ? decl.themes.flatMap((t) => vocabulaire[t] ?? []) : Object.entries(vocabulaire).filter(([k]) => !k.startsWith('_')).flatMap(([, v]) => v)
    const m = mesurer(ch, { manuel, vocabulaire: vocab, exceptions: decl?.exceptions ?? [], lexiqueFormes })
    tous.push({ chapitre: ref, declare: !!decl, ...m })
    if (!decl) continue

    for (const t of decl.themes) if (!vocabulaire[t]) erreur(`${ref} — thème inconnu « ${t} » (scripts/lisibilite/vocabulaire-cours.json)`)
    for (const p of m.longues) if (!p.exception) erreur(`${ref} ${p.chemin} — phrase de ${p.mots} mots (> 25) : « ${p.phrase} »`)
    for (const x of m.manuel) erreur(`${ref} ${x.chemin} — mot de manuel « ${x.mot} » (écrire : ${x.remplacer}) : « ${x.extrait} »`)
    const vus = new Set()
    for (const x of m.vocabulaireHorsLexique) {
      const cle = `${x.mot}|${x.etape}`
      if (vus.has(cle)) continue
      vus.add(cle)
      erreur(`${ref} — mot du cours « ${x.mot} » employé (étape ${x.etape}) sans être au lexique`)
    }
    // Chaque mot du lexique doit être repéré au moins une fois dans le texte (sinon une forme est mal écrite).
    if (ch.lexique?.length) {
      const lc = mots.compilerLexique(ch.lexique)
      const trouves = new Set()
      // Gras compris (un mot défini en gras compte : seules les formules et les liens sont retirés).
      const sansFormules = (x) => x.replace(/\$[^$]+\$|\[\[[^\]]+\]\]/g, ' ').replace(/\*\*/g, '')
      for (const t of textesDuChapitre(ch)) for (const o of mots.occurrences(lc, sansFormules(t.texte))) trouves.add(o.mot)
      ch.lexique.forEach((l, i) => {
        if (!trouves.has(i)) erreur(`${ref} — mot du lexique « ${l.mot} » jamais repéré dans le texte (formes à revoir)`)
        if (l.etape && !ch.sections.some((s) => s.id === l.etape)) erreur(`${ref} — lexique « ${l.mot} » : étape inconnue « ${l.etape} »`)
        const phr = texteSimple(l.definition).split(/(?<=[.!?])\s+/).filter(Boolean)
        if (phr.length > 2) erreur(`${ref} — lexique « ${l.mot} » : définition de ${phr.length} phrases (2 au plus)`)
      })
    } else erreur(`${ref} — chapitre déclaré en français simple sans lexique`)
    console.log(
      `${ref} (français simple) : ${m.mots} mots, ${m.phrases} phrases, ${arrondi(m.motsParPhrase)} mots par phrase, ` +
        `${arrondi(m.pctPlus25)} % > 25 mots (${m.longues.filter((p) => p.exception).length} admises), ${arrondi(m.pctPlus35)} % > 35, ` +
        `${m.manuel.length} mot(s) de manuel, ${(ch.lexique ?? []).length} mots au lexique`,
    )
  }
}

if (rapport) {
  console.log('\nRapport (tous les chapitres, non bloquant) :')
  console.log('chapitre | mots | mots/phrase | % > 25 | % > 35 | mots de manuel | mots du cours hors lexique')
  for (const c of tous) {
    console.log(
      `${c.declare ? '*' : ' '} ${c.chapitre} | ${c.mots} | ${arrondi(c.motsParPhrase)} | ${arrondi(c.pctPlus25)} | ${arrondi(c.pctPlus35)} | ${c.manuel.length} | ${new Set(c.vocabulaireHorsLexique.map((v) => v.mot)).size}`,
    )
  }
}
if (fichierJson) writeFileSync(fichierJson, JSON.stringify(tous, null, 1))

if (erreurs) {
  console.error(`${erreurs} problème(s) de lisibilité dans les chapitres en français simple.`)
  process.exit(1)
}
console.log('Lisibilité : chapitres en français simple conformes.')
process.exit(0)
