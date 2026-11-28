// Mesure de lisibilité d'un chapitre (français simple) — logique PURE, sans Vite ni DOM.
// Utilisée par `scripts/controle-lisibilite.mjs` (contrôle au build + rapport) et par les scripts
// d'audit (avant / après). Voir `.claude/rules/content-authoring.md`, « Français simple et mots du cours ».

/** Champs d'un chapitre qui s'affichent comme du TEXTE À LIRE (les titres, étiquettes, tableaux de
 * données et légendes de photos ne sont pas mesurés). L'ordre des clés suit l'ordre de lecture. */
const CHAMPS_LUS = new Set([
  'lede', 'intro', 'sections', 'blocks', 'text', 'items', 'formula', 'steps', 'result', 'caption', 'illustration',
  'illustrations', 'essentiel', 'cartes', 'question', 'reponse', 'description', 'recap', 'checklist', 'forward',
])
/** Champs lus mais qui ne sont pas de la prose : vérifiés pour les mots de manuel, pas pour la longueur. */
const CHAMPS_COURTS = new Set(['kicker'])

/** Toutes les chaînes à lire d'un chapitre : `{ texte, chemin, champ, etape }` (etape = id de section,
 * `intro`, `recap` ou `entete`). */
export function textesDuChapitre(chapitre) {
  const out = []
  const marcher = (v, chemin, champ, etape) => {
    if (typeof v === 'string') {
      out.push({ texte: v, chemin, champ, etape, court: CHAMPS_COURTS.has(champ) })
      return
    }
    if (Array.isArray(v)) {
      v.forEach((x, i) => marcher(x, `${chemin}[${i}]`, champ, etape))
      return
    }
    if (!v || typeof v !== 'object') return
    // Un « items » d'illustrationGroup est une liste de figures : on y prend la légende seulement.
    for (const [k, x] of Object.entries(v)) {
      if (!CHAMPS_LUS.has(k) && !CHAMPS_COURTS.has(k)) continue
      if (k === 'image') continue
      marcher(x, chemin ? `${chemin}.${k}` : k, k, etape)
    }
  }
  marcher(chapitre.lede, 'lede', 'lede', 'entete')
  if (chapitre.intro) marcher(chapitre.intro.blocks, 'intro.blocks', 'blocks', 'intro')
  chapitre.sections.forEach((s, i) => {
    marcher(s.kicker, `sections[${i}].kicker`, 'kicker', s.id)
    marcher(s.essentiel, `sections[${i}].essentiel`, 'essentiel', s.id)
    marcher(s.cartes, `sections[${i}].cartes`, 'cartes', s.id)
    marcher(s.blocks, `sections[${i}].blocks`, 'blocks', s.id)
  })
  marcher(chapitre.recap, 'recap', 'recap', 'recap')
  return out
}

/** Texte simple d'une chaîne RichText : formule → « F » (un mot), gras → son texte, lien nommé → son
 * texte choisi ou « chapitre ». */
export function texteSimple(t) {
  return t
    .replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[[^\]]+\]\]/g, '« chapitre »')
    .replace(/\$[^$]+\$/g, ' F ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Phrases d'une chaîne : fin après . ! ? … suivis d'une espace puis d'une majuscule, d'un chiffre, d'un
 * guillemet, d'une parenthèse ou d'une formule. Une chaîne (paragraphe, élément de liste, étape
 * d'exemple, carte) n'est jamais collée à la suivante. */
export function phrases(t) {
  const s = texteSimple(t)
  if (!s) return []
  return s
    .split(/(?<=[.!?…])\s+(?=[A-ZÀ-ÖØ-Ý0-9«(F])/u)
    .map((x) => x.trim())
    .filter((x) => /[\p{L}\p{N}]/u.test(x))
}

/** Mots d'une phrase : un jeton qui contient une lettre compte pour un mot ; une suite de jetons SANS
 * lettre (données « 3, 5, 3, 7 », « 6 + 7 + 4 = 20 ») compte pour UN mot ; une formule = un mot. */
export function nombreMots(phrase) {
  let n = 0
  let suiteSansLettre = false
  for (const jeton of phrase.split(/\s+/)) {
    if (!jeton) continue
    if (/\p{L}/u.test(jeton) && jeton !== 'F') {
      n++
      suiteSansLettre = false
    } else if (/[\p{N}F]/u.test(jeton)) {
      if (!suiteSansLettre) n++
      suiteSansLettre = true
    }
  }
  return n
}

const sansAccents = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[’ʼ]/g, "'")

/** Occurrences d'une liste d'expressions (mots entiers, sans casse ni accents) dans un texte simple. */
export function chercher(texte, expressions) {
  const n = sansAccents(texte)
  const trouves = []
  for (const e of expressions) {
    const f = sansAccents(e).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+')
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${f}(?![\\p{L}\\p{N}])`, 'gu')
    const m = n.match(re)
    if (m) trouves.push({ expression: e, nombre: m.length })
  }
  return trouves
}

/**
 * Mesure d'un chapitre. `options` :
 * - `manuel` : `[{ mot, formes?, remplacer }]` (liste noire des mots de manuel) ;
 * - `vocabulaire` : `[{ mot, formes? }]` (mots du cours attendus au lexique) ;
 * - `exceptions` : `[{ debut, raison }]` (phrases longues admises : une énumération, une formule longue) ;
 * - `couvert(texteSimple)` : fonction qui dit si une forme est couverte par le lexique du chapitre
 *   (renvoie un Set des mots du vocabulaire trouvés hors lexique) — fournie par l'appelant.
 */
export function mesurer(chapitre, { manuel = [], vocabulaire = [], exceptions = [], lexiqueFormes = [] } = {}) {
  const textes = textesDuChapitre(chapitre)
  let mots = 0
  let nPhrases = 0
  let plus25 = 0
  let plus35 = 0
  const longues = []
  const manuelTrouves = []
  const vocabHorsLexique = []
  const lexiqueNorm = new Set(lexiqueFormes.map((f) => sansAccents(f)))
  const motCouvert = (v) => [v.mot, ...(v.formes ?? [])].some((f) => lexiqueNorm.has(sansAccents(f)))
  for (const t of textes) {
    const simple = texteSimple(t.texte)
    // Mots de manuel : partout (prose, sous-titres) ; admis s'ils sont expliqués au lexique.
    for (const m of manuel) {
      if (lexiqueNorm.has(sansAccents(m.mot))) continue
      const r = chercher(simple, [m.mot, ...(m.formes ?? [])])
      if (r.length) manuelTrouves.push({ mot: m.mot, remplacer: m.remplacer, etape: t.etape, chemin: t.chemin, extrait: simple.slice(0, 140) })
    }
    for (const v of vocabulaire) {
      if (motCouvert(v)) continue
      if (chercher(simple, [v.mot, ...(v.formes ?? [])]).length) vocabHorsLexique.push({ mot: v.mot, etape: t.etape, chemin: t.chemin })
    }
    if (t.court) continue
    for (const p of phrases(t.texte)) {
      const n = nombreMots(p)
      mots += n
      nPhrases++
      if (n > 25) {
        plus25++
        const exception = exceptions.find((e) => p.startsWith(e.debut))
        longues.push({ mots: n, phrase: p, etape: t.etape, chemin: t.chemin, exception: exception?.raison ?? null })
      }
      if (n > 35) plus35++
    }
  }
  return {
    mots,
    phrases: nPhrases,
    motsParPhrase: nPhrases ? mots / nPhrases : 0,
    pctPlus25: nPhrases ? (100 * plus25) / nPhrases : 0,
    pctPlus35: nPhrases ? (100 * plus35) / nPhrases : 0,
    longues,
    manuel: manuelTrouves,
    vocabulaireHorsLexique: vocabHorsLexique,
  }
}
