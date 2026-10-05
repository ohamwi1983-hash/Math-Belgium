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
const CH_5E_SUITES: ChapitreInfo = { chantier: '5e-4h', chapitreSlug: 'suites', chapitreTitle: 'Suites' }
const CH_5E_LIMITES_ASYMPTOTES: ChapitreInfo = { chantier: '5e-4h', chapitreSlug: 'limites-asymptotes', chapitreTitle: 'Limites et asymptotes' }
const CH_5E_DERIVEES_APPLICATIONS: ChapitreInfo = { chantier: '5e-4h', chapitreSlug: 'derivees-applications', chapitreTitle: 'Dérivées et applications' }
const CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'fonctions-reciproques-cyclometriques', chapitreTitle: 'Fonctions réciproques & cyclométriques' }
const CH_6E_FONCTIONS_EXPONENTIELLES: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'fonctions-exponentielles', chapitreTitle: 'Fonctions exponentielles' }
const CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE: ChapitreInfo = { chantier: '4e', chapitreSlug: 'caracteristiques-fonctions-reference', chapitreTitle: "Caractéristiques d'une fonction et fonctions de référence" }
const CH_4E_STATISTIQUE_DESCRIPTIVE: ChapitreInfo = { chantier: '4e', chapitreSlug: 'statistique-descriptive', chapitreTitle: 'Statistique descriptive à une variable' }
const CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES: ChapitreInfo = { chantier: '4e', chapitreSlug: 'cercle-trigonometrique-triangles', chapitreTitle: 'Cercle trigonométrique & triangles quelconques' }
const CH_4E_CALCUL_VECTORIEL: ChapitreInfo = { chantier: '4e', chapitreSlug: 'calcul-vectoriel', chapitreTitle: 'Calcul vectoriel' }
const CH_4E_GEOMETRIE_ANALYTIQUE_PLANE: ChapitreInfo = { chantier: '4e', chapitreSlug: 'geometrie-analytique-plane', chapitreTitle: 'Géométrie analytique plane' }
const CH_4E_GEOMETRIE_DANS_ESPACE: ChapitreInfo = { chantier: '4e', chapitreSlug: 'geometrie-dans-espace', chapitreTitle: "Géométrie dans l'espace" }

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

  // --- 4e, chapitre 3 : Caractéristiques d'une fonction et fonctions de référence ---
  gen10: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppFonctionsReference').then((m) => ({ default: m.AppFonctionsReference }))),
  gen11: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppFormeCanoniqueFonctionsReference').then((m) => ({ default: m.AppFormeCanoniqueFonctionsReference }))),
  gen12: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppCaracteristiquesFonction').then((m) => ({ default: m.AppCaracteristiquesFonction }))),
  gen13: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppCaracteristiquesAlgebriques').then((m) => ({ default: m.AppCaracteristiquesAlgebriques }))),
  gen62: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppQuizFonctionsReference').then((m) => ({ default: m.AppQuizFonctionsReference }))),

  // --- 4e, chapitre 5 : Cercle trigonométrique & triangles quelconques ---
  gen14: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppCercleTrigonometrique').then((m) => ({ default: m.AppCercleTrigonometrique }))),
  gen15: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppValeursRemarquables').then((m) => ({ default: m.AppValeursRemarquables }))),
  gen16: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppUnSansLautre').then((m) => ({ default: m.AppUnSansLautre }))),
  gen17: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppAnglesAssocies').then((m) => ({ default: m.AppAnglesAssocies }))),
  gen18: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppQuelAngle').then((m) => ({ default: m.AppQuelAngle }))),
  gen19: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppTriangleQuelconque').then((m) => ({ default: m.AppTriangleQuelconque }))),
  gen58: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppTriangleLies').then((m) => ({ default: m.AppTriangleLies }))),
  gen63: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppQuizCercleTriangles').then((m) => ({ default: m.AppQuizCercleTriangles }))),

  // --- 4e, chapitre 4 : Statistique descriptive à une variable ---
  gen30: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppTableauFrequences').then((m) => ({ default: m.AppTableauFrequences }))),
  gen31: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppHistogramme').then((m) => ({ default: m.AppHistogramme }))),
  gen32: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppMoyennePonderee').then((m) => ({ default: m.AppMoyennePonderee }))),
  gen33: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppMediane').then((m) => ({ default: m.AppMediane }))),
  gen34: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppDispersion').then((m) => ({ default: m.AppDispersion }))),
  gen35: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppExerciceSynthese').then((m) => ({ default: m.AppExerciceSynthese }))),
  gen36: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppBoiteMoustaches').then((m) => ({ default: m.AppBoiteMoustaches }))),
  gen37: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppBienaymeTchebychev').then((m) => ({ default: m.AppBienaymeTchebychev }))),
  gen38: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppComparaisonSeries').then((m) => ({ default: m.AppComparaisonSeries }))),
  gen59: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppQuizStatistiqueDescriptive').then((m) => ({ default: m.AppQuizStatistiqueDescriptive }))),

  // --- 4e, chapitre 6 : Calcul vectoriel ---
  gen20: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppPointVectoriel').then((m) => ({ default: m.AppPointVectoriel }))),
  gen21: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppRelationVectorielle').then((m) => ({ default: m.AppRelationVectorielle }))),
  gen22: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppCombinaisonVecteurs').then((m) => ({ default: m.AppCombinaisonVecteurs }))),
  gen23: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppConstructionVectorielle').then((m) => ({ default: m.AppConstructionVectorielle }))),
  gen24: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppColinearite').then((m) => ({ default: m.AppColinearite }))),
  gen25: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppOrthogonalite').then((m) => ({ default: m.AppOrthogonalite }))),
  gen26: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppNormeDistance').then((m) => ({ default: m.AppNormeDistance }))),
  gen27: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppReductionVectorielle').then((m) => ({ default: m.AppReductionVectorielle }))),
  gen28: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppComparaisonVecteurs').then((m) => ({ default: m.AppComparaisonVecteurs }))),
  gen29: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppApplicationPhysique').then((m) => ({ default: m.AppApplicationPhysique }))),
  gen64: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppQuizCalculVectoriel').then((m) => ({ default: m.AppQuizCalculVectoriel }))),

  // --- 4e, chapitre 7 : Géométrie analytique plane ---
  gen42: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppEquationDroite').then((m) => ({ default: m.AppEquationDroite }))),
  gen43: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppLectureGraphiqueDroite').then((m) => ({ default: m.AppLectureGraphiqueDroite }))),
  gen44: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppConstructionDroite').then((m) => ({ default: m.AppConstructionDroite }))),
  gen45: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppRelationsDroites').then((m) => ({ default: m.AppRelationsDroites }))),
  gen46: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppCaracteristiquesDroite').then((m) => ({ default: m.AppCaracteristiquesDroite }))),
  gen47: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppDistanceDroite').then((m) => ({ default: m.AppDistanceDroite }))),
  gen48: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppIntersectionDroites').then((m) => ({ default: m.AppIntersectionDroites }))),
  gen49: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppEquationCercle').then((m) => ({ default: m.AppEquationCercle }))),
  gen50: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppEquationCercleDeveloppee').then((m) => ({ default: m.AppEquationCercleDeveloppee }))),
  gen51: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppEquationParabole').then((m) => ({ default: m.AppEquationParabole }))),
  gen52: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppEquationParaboleDeveloppee').then((m) => ({ default: m.AppEquationParaboleDeveloppee }))),
  gen53: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppConstructionParabole').then((m) => ({ default: m.AppConstructionParabole }))),
  gen54: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppLieuxGeometriques').then((m) => ({ default: m.AppLieuxGeometriques }))),
  gen65: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppQuizGeometrieAnalytique').then((m) => ({ default: m.AppQuizGeometrieAnalytique }))),

  // --- 4e, chapitre 8 : Géométrie dans l'espace ---
  gen39: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppPositionDroitePlan').then((m) => ({ default: m.AppPositionDroitePlan }))),
  gen40: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppSectionPlaneSolide').then((m) => ({ default: m.AppSectionPlaneSolide }))),
  gen41: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppOmbreSoleil').then((m) => ({ default: m.AppOmbreSoleil }))),
  gen66: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppQuizGeometrieEspace').then((m) => ({ default: m.AppQuizGeometrieEspace }))),

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

  // --- 5e, chapitre 3 : Suites ---
  '5gen14': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen14').then((m) => ({ default: m.App5gen14 }))),
  '5gen15': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen15').then((m) => ({ default: m.App5gen15 }))),
  '5gen16': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen16').then((m) => ({ default: m.App5gen16 }))),
  '5gen17': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen17').then((m) => ({ default: m.App5gen17 }))),
  '5gen18': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen18').then((m) => ({ default: m.App5gen18 }))),
  '5gen19': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen19').then((m) => ({ default: m.App5gen19 }))),
  '5gen41': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen41').then((m) => ({ default: m.App5gen41 }))),

  // --- 5e, chapitre 4 : Limites et asymptotes ---
  '5gen20': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen20').then((m) => ({ default: m.App5gen20 }))),
  '5gen21': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen21').then((m) => ({ default: m.App5gen21 }))),
  '5gen22': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen22').then((m) => ({ default: m.App5gen22 }))),
  '5gen23': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen23').then((m) => ({ default: m.App5gen23 }))),
  '5gen24': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen24').then((m) => ({ default: m.App5gen24 }))),
  '5gen42': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen42').then((m) => ({ default: m.App5gen42 }))),

  // --- 5e, chapitre 5 : Dérivées et applications ---
  '5gen25': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen25').then((m) => ({ default: m.App5gen25 }))),
  '5gen26': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen26').then((m) => ({ default: m.App5gen26 }))),
  '5gen27': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen27').then((m) => ({ default: m.App5gen27 }))),
  '5gen28': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen28').then((m) => ({ default: m.App5gen28 }))),
  '5gen29': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen29').then((m) => ({ default: m.App5gen29 }))),
  '5gen30': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen30').then((m) => ({ default: m.App5gen30 }))),
  '5gen31': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen31').then((m) => ({ default: m.App5gen31 }))),
  '5gen32': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen32').then((m) => ({ default: m.App5gen32 }))),
  '5gen33': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen33').then((m) => ({ default: m.App5gen33 }))),
  '5gen34': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen34').then((m) => ({ default: m.App5gen34 }))),
  '5gen35': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen35').then((m) => ({ default: m.App5gen35 }))),
  '5gen43': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen43').then((m) => ({ default: m.App5gen43 }))),

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
