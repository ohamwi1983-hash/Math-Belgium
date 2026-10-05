/**
 * Table centrale des générateurs rapatriés depuis plateforme-maths — SEULE source de vérité
 * (plus de `GENERATEURS_MIGRES` séparée à garder synchronisée côté `generatorLink.ts`). Ajouter un
 * générateur migré = ajouter une entrée ici, rien d'autre à câbler :
 * - `src/lib/generatorLink.ts` (lien interne vs externe) la lit directement ;
 * - `src/routes/EntrainementPage.tsx` (route générique `/entrainement/:chantier/:generatorId`) la
 *   lit pour charger le bon composant (lazy) et construire le fil d'Ariane.
 *
 * Module de DONNÉES pur (pas de JSX/React ici) : `importComponent` est un thunk `() => import(...)`
 * non encore résolu — `EntrainementPage` l'enveloppe dans `React.lazy` au moment du rendu, donc
 * importer ce fichier (ex. depuis `generatorLink.ts`, hors contexte React) ne déclenche jamais le
 * téléchargement du code d'un générateur, seulement la consultation de sa fiche.
 *
 * `chantier` vaut toujours `ChapterContent.levelSlug` ('4e', '5e-4h', '6e-6h'), jamais réécrit.
 * Code source : `src/entrainement/{chantier}/`, miroir de la structure relative d'origine de
 * plateforme-maths (voir le commentaire de tête d'`AppMethodeRapide.tsx` pour pourquoi).
 */
import type { ComponentType } from 'react'

export interface EntrainementEntry {
  chantier: string
  chapitreSlug: string
  chapitreTitle: string
  importComponent: () => Promise<{ default: ComponentType }>
}

export const LEVEL_LABELS: Record<string, string> = {
  '4e': '4e',
  '5e-4h': '5e (4h)',
  '6e-6h': '6e (6h)',
}

interface ChapitreInfo {
  chantier: string
  chapitreSlug: string
  chapitreTitle: string
}

function entree(chapitre: ChapitreInfo, importComponent: EntrainementEntry['importComponent']): EntrainementEntry {
  return { ...chapitre, importComponent }
}

const CH_4E_FONCTION_SECOND_DEGRE: ChapitreInfo = { chantier: '4e', chapitreSlug: 'fonction-second-degre', chapitreTitle: 'La fonction du second degré' }
const CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE: ChapitreInfo = { chantier: '4e', chapitreSlug: 'equations-inequations-second-degre', chapitreTitle: 'Équations et inéquations du second degré' }
const CH_5E_FONCTIONS_COMPOSEES: ChapitreInfo = { chantier: '5e-4h', chapitreSlug: 'fonctions-composees', chapitreTitle: 'Fonctions : rappels et compléments' }
const CH_5E_TRIGONOMETRIE: ChapitreInfo = { chantier: '5e-4h', chapitreSlug: 'trigonometrie', chapitreTitle: 'Trigonométrie' }
const CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'fonctions-reciproques-cyclometriques', chapitreTitle: 'Fonctions réciproques & cyclométriques' }
const CH_6E_FONCTIONS_EXPONENTIELLES: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'fonctions-exponentielles', chapitreTitle: 'Fonctions exponentielles' }

export const ENTRAINEMENT_REGISTRY: Record<string, EntrainementEntry> = {
  // --- 4e, chapitre 1 : La fonction du second degré ---
  gen7: entree(CH_4E_FONCTION_SECOND_DEGRE, () => import('./4e/AppAnalyseFonction').then((m) => ({ default: m.AppAnalyseFonction }))),
  gen8: entree(CH_4E_FONCTION_SECOND_DEGRE, () => import('./4e/AppTransformationsGraphiques').then((m) => ({ default: m.AppTransformationsGraphiques }))),
  gen9: entree(CH_4E_FONCTION_SECOND_DEGRE, () => import('./4e/AppFormeCanoniqueTransformations').then((m) => ({ default: m.AppFormeCanoniqueTransformations }))),
  gen55: entree(CH_4E_FONCTION_SECOND_DEGRE, () => import('./4e/AppOptimisation').then((m) => ({ default: m.AppOptimisation }))),
  gen57: entree(CH_4E_FONCTION_SECOND_DEGRE, () => import('./4e/AppEquationInequationSecondDegre').then((m) => ({ default: m.AppEquationInequationSecondDegre }))),
  gen60: entree(CH_4E_FONCTION_SECOND_DEGRE, () => import('./4e/AppQuizFonctionSecondDegre').then((m) => ({ default: m.AppQuizFonctionSecondDegre }))),

  // --- 4e, chapitre 2 : Équations et inéquations du second degré ---
  gen1: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppMethodeRapide').then((m) => ({ default: m.AppMethodeRapide }))),
  gen2: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppInequation').then((m) => ({ default: m.AppInequation }))),
  gen3: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppSimplification').then((m) => ({ default: m.AppSimplification }))),
  gen4: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppEquationRationnelle').then((m) => ({ default: m.AppEquationRationnelle }))),
  gen5: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppSignesProduit').then((m) => ({ default: m.AppSignesProduit }))),
  gen6: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppInequationRationnelle').then((m) => ({ default: m.AppInequationRationnelle }))),
  gen61: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppQuizEquationsSecondDegre').then((m) => ({ default: m.AppQuizEquationsSecondDegre }))),

  // --- 5e, chapitre 1 : Fonctions : rappels et compléments ---
  '5gen1': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen1').then((m) => ({ default: m.App5gen1 }))),
  '5gen2': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen2').then((m) => ({ default: m.App5gen2 }))),
  '5gen3': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen3').then((m) => ({ default: m.App5gen3 }))),
  '5gen4': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen4').then((m) => ({ default: m.App5gen4 }))),
  '5gen5': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen5').then((m) => ({ default: m.App5gen5 }))),
  '5gen39': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen39').then((m) => ({ default: m.App5gen39 }))),

  // --- 5e, chapitre 2 : Trigonométrie ---
  '5gen6': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen6').then((m) => ({ default: m.App5gen6 }))),
  '5gen7': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen7').then((m) => ({ default: m.App5gen7 }))),
  '5gen8': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen8').then((m) => ({ default: m.App5gen8 }))),
  '5gen9': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen9').then((m) => ({ default: m.App5gen9 }))),
  '5gen10': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen10').then((m) => ({ default: m.App5gen10 }))),
  '5gen11': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen11').then((m) => ({ default: m.App5gen11 }))),
  '5gen12': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen12').then((m) => ({ default: m.App5gen12 }))),
  '5gen13': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen13').then((m) => ({ default: m.App5gen13 }))),
  '5gen40': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen40').then((m) => ({ default: m.App5gen40 }))),

  // --- 6e, chapitre 1 : Fonctions réciproques & cyclométriques ---
  '6gen1': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen1').then((m) => ({ default: m.App6gen1 }))),
  '6gen2': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen2').then((m) => ({ default: m.App6gen2 }))),
  '6gen3': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen3').then((m) => ({ default: m.App6gen3 }))),
  '6gen4': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen4').then((m) => ({ default: m.App6gen4 }))),
  '6gen5': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen5').then((m) => ({ default: m.App6gen5 }))),

  // --- 6e, chapitre 2 : Fonctions exponentielles ---
  '6gen6': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen6').then((m) => ({ default: m.App6gen6 }))),
  '6gen7': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen7').then((m) => ({ default: m.App6gen7 }))),
  '6gen8': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen8').then((m) => ({ default: m.App6gen8 }))),
  '6gen9': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen9').then((m) => ({ default: m.App6gen9 }))),
  '6gen10': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen10').then((m) => ({ default: m.App6gen10 }))),
  '6gen11': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen11').then((m) => ({ default: m.App6gen11 }))),
  '6gen12': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen12').then((m) => ({ default: m.App6gen12 }))),
  '6gen65': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen65').then((m) => ({ default: m.App6gen65 }))),
}
