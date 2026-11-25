// Vérification au build — chapitres autonomes (décision du professeur du 25/11/2026 : chacun suit son
// ordre des chapitres). Échec du build si, dans le contenu des chapitres :
// - un lien nommé `[[niveau/slug#section]]` ne se résout pas (chapitre ou étape inconnus), est écrit
//   dans un champ en texte BRUT (label, kicker, badge, tag, titre…) ou à l'intérieur d'un `**gras**` ;
// - une entrée `utilise` d'une section cite une étape inconnue, son propre chapitre, ou un générateur
//   `jeBloque` absent des cartes « S'entraîner » de la section ;
// - un texte renvoie à un chapitre par son NUMÉRO (« au chapitre 2 », « ch. 3 ») ou par sa place
//   (« chapitre précédent / suivant / prochain ») — seul le nom du chapitre est permis.
// Mêmes contrôles (liens, numéros) sur les questions « Formule ».
// Même mécanisme que scripts/verifier-enonces-evaluation.mjs (`vite.ssrLoadModule`).
import { createServer } from 'vite'

/** Champs rendus en texte BRUT (jamais par `RichText`) : un lien nommé y resterait affiché tel quel. */
const CHAMPS_BRUTS = new Set(['label', 'kicker', 'badge', 'tag', 'titreCourt', 'partie', 'title', 'description', 'headers', 'level', 'id', 'slug', 'generatorId', 'cible'])
/** Renvoi par numéro ou par place : interdit dans le texte (les « § 3 » / « étape 3 » internes restent permis). */
const RENVOI_CHIFFRE = /\bchapitres?\s+(?:n°\s*)?\d|\bch\.\s?\d|\bchapitre\s+(?:précédent|suivant|prochain|d'avant|d’avant|d'après|d’après)|\b(?:précédent|prochain|dernier)\s+chapitre/i

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, entries: [] } })
let erreurs = 0
let liens = 0
let entreesUtilise = 0
const erreur = (m) => {
  erreurs++
  console.error(`✗ ${m}`)
}
try {
  const { LEVELS } = await vite.ssrLoadModule('/src/content/chaptersIndex.ts')
  const { resoudreReference, referencesDe } = await vite.ssrLoadModule('/src/lib/lienChapitre.ts')

  /** Parcourt toutes les chaînes d'une valeur (objet de contenu), avec le nom du champ qui les porte. */
  function* chaines(valeur, champ = '', chemin = '') {
    if (typeof valeur === 'string') yield { texte: valeur, champ, chemin }
    else if (Array.isArray(valeur)) for (let i = 0; i < valeur.length; i++) yield* chaines(valeur[i], champ, `${chemin}[${i}]`)
    else if (valeur && typeof valeur === 'object') for (const [k, v] of Object.entries(valeur)) yield* chaines(v, k, chemin ? `${chemin}.${k}` : k)
  }

  function controlerTexte({ texte, champ, chemin }, lieu) {
    if (RENVOI_CHIFFRE.test(texte)) erreur(`${lieu} ${chemin} — renvoi à un chapitre par son numéro ou sa place : « ${texte.match(RENVOI_CHIFFRE)[0]} » (nommer le chapitre, lien [[niveau/slug#section]])`)
    if (!texte.includes('[[')) return
    const refs = referencesDe(texte)
    if (refs.length === 0 || (texte.match(/\[\[/g) ?? []).length !== refs.length) erreur(`${lieu} ${chemin} — « [[ » mal formé : ${texte.slice(0, 80)}`)
    if (CHAMPS_BRUTS.has(champ)) erreur(`${lieu} ${chemin} — lien nommé dans un champ en texte brut (« ${champ} ») : nommer le chapitre en clair, sans lien`)
    if (/\*\*[^*]*\[\[[^*]*\*\*/.test(texte)) erreur(`${lieu} ${chemin} — lien nommé à l'intérieur d'un **gras** (jamais reparsé)`)
    for (const ref of refs) {
      liens++
      if (!resoudreReference(ref)) erreur(`${lieu} ${chemin} — lien cassé [[${ref}]]`)
    }
  }

  for (const level of LEVELS) {
    for (const chapitre of level.chapters) {
      const lieu = `${level.slug}/${chapitre.slug}`
      for (const c of chaines(chapitre)) {
        if (/^sections\[\d+\]\.utilise/.test(c.chemin) && (c.champ === 'cible' || c.champ === 'poids' || c.champ === 'jeBloque')) continue
        controlerTexte(c, lieu)
      }
      for (const section of chapitre.sections) {
        const generateurs = new Set(section.blocks.filter((b) => b.kind === 'entrainement').map((b) => b.generatorId))
        const vus = new Set()
        for (const u of section.utilise ?? []) {
          entreesUtilise++
          const ici = `${lieu} § ${section.id} — utilise « ${u.cible} »`
          const cible = resoudreReference(u.cible)
          if (!cible || !cible.section) erreur(`${ici} : étape inconnue (forme attendue niveau/slug#section)`)
          else if (cible.chapitre === chapitre) erreur(`${ici} : étape du même chapitre (réservé aux autres chapitres)`)
          if (u.poids !== 'indispensable' && u.poids !== 'utile') erreur(`${ici} : poids « ${u.poids} »`)
          if (vus.has(u.cible)) erreur(`${ici} : en double`)
          vus.add(u.cible)
          for (const g of u.jeBloque ?? []) if (!generateurs.has(g)) erreur(`${ici} : jeBloque « ${g} » n'a pas de carte « S'entraîner » dans l'étape`)
          if (u.rappel !== undefined && !u.rappel.trim()) erreur(`${ici} : rappel vide`)
        }
      }
    }
  }

  // Banque des questions « Formule » : textes montrés aux élèves.
  const { QUESTIONS_FORMULES } = await vite.ssrLoadModule('/src/lib/questionsFormules/index.ts')
  for (const c of chaines(QUESTIONS_FORMULES)) if (c.champ !== 'id') controlerTexte(c, 'questions « Formule »')
} finally {
  await vite.close()
}
if (erreurs > 0) {
  console.error(`\nverifier-liens-chapitres : ${erreurs} problème(s) (liens nommés, encadrés « utilise », renvois chiffrés).`)
  process.exit(1)
}
console.log(`verifier-liens-chapitres : OK (${liens} liens nommés, ${entreesUtilise} entrées « utilise »)`)
