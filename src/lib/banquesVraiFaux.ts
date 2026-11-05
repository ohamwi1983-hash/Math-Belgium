import type { FragmentConsigne } from '../entrainement/export/genererFeuilleExercices'

/**
 * Banques vrai/faux LOCALES (générateurs `quiz*` déjà portés dans `src/entrainement/`), par
 * chapitre — permet de générer les questions vrai/faux d'une évaluation/feuille d'exercices sans
 * passer par plateforme-maths (qui exécuterait ses propres banques, potentiellement différentes).
 *
 * Toutes les banques ont la même forme (`Record<thème, { enonce, reponse, justification }[]>`) ;
 * seules les banques de 6e (logarithmes, exponentielles, …) écrivent `enonce`/`justification` en
 * fragments texte/LaTeX, les autres en chaîne `RichText` (`$…$`) — normalisées ici en fragments.
 *
 * Import dynamique par chapitre : une banque pèse plusieurs centaines d'affirmations, inutile de
 * les embarquer toutes dans le bundle du panneau.
 *
 * Chapitre absent de cette table (ex. « Fonctions réciproques et cyclométriques », dont la banque
 * 6gen64 n'existe pas encore ici) ou thème absent de la banque chargée : l'appelant retombe sur
 * plateforme-maths (`peutGenererLocalement`).
 */

export interface AffirmationVraiFaux {
  enonce: FragmentConsigne[]
  reponse: boolean
  justification: FragmentConsigne[]
}

type QuestionBrute = { enonce: string | FragmentConsigne[]; reponse: boolean; justification: string | FragmentConsigne[] }
type BanqueBrute = Record<string, QuestionBrute[]>

const CHARGEURS: Record<string, () => Promise<BanqueBrute>> = {
  // 4e
  'fonction-second-degre': () => import('../entrainement/4e/generateurs/quizFonctionSecondDegre/banque').then((m) => m.BANQUE_QUIZ_FONCTION_SECOND_DEGRE),
  'equations-inequations-second-degre': () => import('../entrainement/4e/generateurs/quizEquationsSecondDegre/banque').then((m) => m.BANQUE_QUIZ_EQUATIONS_SECOND_DEGRE),
  'caracteristiques-fonctions-reference': () => import('../entrainement/4e/generateurs/quizFonctionsReference/banque').then((m) => m.BANQUE_QUIZ_FONCTIONS_REFERENCE),
  'statistique-descriptive': () => import('../entrainement/4e/generateurs/quizStatistiqueDescriptive/banque').then((m) => m.BANQUE_QUIZ_STATISTIQUE_DESCRIPTIVE),
  'cercle-trigonometrique-triangles': () => import('../entrainement/4e/generateurs/quizCercleTriangles/banque').then((m) => m.BANQUE_QUIZ_CERCLE_TRIANGLES),
  'calcul-vectoriel': () => import('../entrainement/4e/generateurs/quizCalculVectoriel/banque').then((m) => m.BANQUE_QUIZ_CALCUL_VECTORIEL),
  'geometrie-analytique-plane': () => import('../entrainement/4e/generateurs/quizGeometrieAnalytique/banque').then((m) => m.BANQUE_QUIZ_GEOMETRIE_ANALYTIQUE),
  'geometrie-dans-espace': () => import('../entrainement/4e/generateurs/quizGeometrieEspace/banque').then((m) => m.BANQUE_QUIZ_GEOMETRIE_ESPACE),
  // 5e (4h)
  'fonctions-composees': () => import('../entrainement/5e-4h/generateurs5e/quizFonctions5e/banque').then((m) => m.BANQUE_QUIZ_FONCTIONS_5E),
  trigonometrie: () => import('../entrainement/5e-4h/generateurs5e/quizTrigonometrie5e/banque').then((m) => m.BANQUE_QUIZ_TRIGONOMETRIE_5E),
  suites: () => import('../entrainement/5e-4h/generateurs5e/quizSuites5e/banque').then((m) => m.BANQUE_QUIZ_SUITES_5E),
  'limites-asymptotes': () => import('../entrainement/5e-4h/generateurs5e/quizLimites5e/banque').then((m) => m.BANQUE_QUIZ_LIMITES_5E),
  'derivees-applications': () => import('../entrainement/5e-4h/generateurs5e/quizDerivees5e/banque').then((m) => m.BANQUE_QUIZ_DERIVEES_5E),
  // 6e (6h)
  'fonctions-exponentielles': () => import('../entrainement/6e-6h/generateurs6e/quizFonctionsExponentielles/banque').then((m) => m.BANQUE_QUIZ_FONCTIONS_EXPONENTIELLES),
  'fonctions-logarithmes': () => import('../entrainement/6e-6h/generateurs6e/quizFonctionsLogarithmes/banque').then((m) => m.BANQUE_QUIZ_FONCTIONS_LOGARITHMES),
  'primitives-integrales': () => import('../entrainement/6e-6h/generateurs6e/quizIntegralesPrimitives/banque').then((m) => m.BANQUE_QUIZ_INTEGRALES_PRIMITIVES),
  'nombres-complexes': () => import('../entrainement/6e-6h/generateurs6e/quizNombresComplexes/banque').then((m) => m.BANQUE_QUIZ_NOMBRES_COMPLEXES),
  probabilites: () => import('../entrainement/6e-6h/generateurs6e/quizProbabilites/banque').then((m) => m.BANQUE_QUIZ_PROBABILITES),
  'analyse-combinatoire': () => import('../entrainement/6e-6h/generateurs6e/quizCombinatoire/banque').then((m) => m.BANQUE_QUIZ_COMBINATOIRE),
  'variables-aleatoires': () => import('../entrainement/6e-6h/generateurs6e/quizVariablesAleatoires/banque').then((m) => m.BANQUE_QUIZ_VARIABLES_ALEATOIRES),
  'lieux-geometriques': () => import('../entrainement/6e-6h/generateurs6e/quizLieuxGeometriques/banque').then((m) => m.BANQUE_QUIZ_LIEUX_GEOMETRIQUES),
  coniques: () => import('../entrainement/6e-6h/generateurs6e/quizConiques/banque').then((m) => m.BANQUE_QUIZ_CONIQUES),
}

/** Même découpage que `parseRichText` (evaluationPayload.ts) : `$…$` → latex, `**gras**` aplati. */
function versFragments(valeur: string | FragmentConsigne[]): FragmentConsigne[] {
  if (Array.isArray(valeur)) return valeur
  const morceaux = valeur.replace(/\*\*(.*?)\*\*/g, '$1').split(/\$([^$]+)\$/g)
  const fragments: FragmentConsigne[] = []
  morceaux.forEach((v, i) => {
    if (v !== '') fragments.push(i % 2 === 1 ? { type: 'latex', valeur: v } : { type: 'texte', valeur: v })
  })
  return fragments
}

const cache = new Map<string, Promise<BanqueBrute | null>>()

function charger(chapitreSlug: string): Promise<BanqueBrute | null> {
  const chargeur = CHARGEURS[chapitreSlug]
  if (!chargeur) return Promise.resolve(null)
  let p = cache.get(chapitreSlug)
  if (!p) {
    p = chargeur().catch(() => null)
    cache.set(chapitreSlug, p)
  }
  return p
}

export function chapitreAUneBanqueVraiFauxLocale(chapitreSlug: string): boolean {
  return chapitreSlug in CHARGEURS
}

/** Affirmations d'un thème, normalisées — `null` si le chapitre ou le thème n'existe pas localement. */
export async function chargerThemeVraiFaux(chapitreSlug: string, theme: string): Promise<AffirmationVraiFaux[] | null> {
  const banque = await charger(chapitreSlug)
  const questions = banque?.[theme]
  if (!questions || questions.length === 0) return null
  return questions.map((q) => ({ enonce: versFragments(q.enonce), reponse: q.reponse, justification: versFragments(q.justification) }))
}
