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
const CH_5E_STATISTIQUE_DEUX_VARIABLES: ChapitreInfo = { chantier: '5e-4h', chapitreSlug: 'statistique-deux-variables', chapitreTitle: 'Statistique à deux variables' }
const CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'fonctions-reciproques-cyclometriques', chapitreTitle: 'Fonctions réciproques & cyclométriques' }
const CH_6E_FONCTIONS_EXPONENTIELLES: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'fonctions-exponentielles', chapitreTitle: 'Fonctions exponentielles' }
const CH_6E_FONCTIONS_LOGARITHMES: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'fonctions-logarithmes', chapitreTitle: 'Fonctions logarithmes' }
const CH_6E_ANALYSE_COMBINATOIRE: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'analyse-combinatoire', chapitreTitle: 'Analyse combinatoire' }
const CH_6E_VARIABLES_ALEATOIRES: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'variables-aleatoires', chapitreTitle: 'Variables aléatoires et lois de probabilités' }
const CH_6E_PRIMITIVES_INTEGRALES: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'primitives-integrales', chapitreTitle: 'Intégrales et primitives' }
const CH_6E_NOMBRES_COMPLEXES: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'nombres-complexes', chapitreTitle: 'Nombres complexes' }
const CH_6E_PROBABILITES: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'probabilites', chapitreTitle: 'Les probabilités' }
const CH_6E_LIEUX_GEOMETRIQUES: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'lieux-geometriques', chapitreTitle: 'Lieux géométriques' }
const CH_6E_CONIQUES: ChapitreInfo = { chantier: '6e-6h', chapitreSlug: 'coniques', chapitreTitle: 'Les coniques' }
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
  gen57: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppEquationInequationSecondDegre').then((m) => ({ default: m.AppEquationInequationSecondDegre }))),
  gen60: entree(CH_4E_FONCTION_SECOND_DEGRE, () => import('./4e/AppQuizFonctionSecondDegre').then((m) => ({ default: m.AppQuizFonctionSecondDegre }))),
  gen123: entree(CH_4E_FONCTION_SECOND_DEGRE, () => import('./4e/AppLectureParabole').then((m) => ({ default: m.AppLectureParabole }))),
  gen124: entree(CH_4E_FONCTION_SECOND_DEGRE, () => import('./4e/AppDifferencesSecondes').then((m) => ({ default: m.AppDifferencesSecondes }))),
  gen125: entree(CH_4E_FONCTION_SECOND_DEGRE, () => import('./4e/AppEquationParabolePoints').then((m) => ({ default: m.AppEquationParabolePoints }))),
  gen126: entree(CH_4E_FONCTION_SECOND_DEGRE, () => import('./4e/AppTroisEcritures').then((m) => ({ default: m.AppTroisEcritures }))),
  gen127: entree(CH_4E_FONCTION_SECOND_DEGRE, () => import('./4e/AppDetectiveFonction').then((m) => ({ default: m.AppDetectiveFonction }))),
  gen128: entree(CH_4E_FONCTION_SECOND_DEGRE, () => import('./4e/AppAssocierParaboles').then((m) => ({ default: m.AppAssocierParaboles }))),

  // --- 4e, chapitre 2 : Équations et inéquations du second degré ---
  gen1: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppMethodeRapide').then((m) => ({ default: m.AppMethodeRapide }))),
  gen2: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppInequation').then((m) => ({ default: m.AppInequation }))),
  gen3: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppSimplification').then((m) => ({ default: m.AppSimplification }))),
  gen4: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppEquationRationnelle').then((m) => ({ default: m.AppEquationRationnelle }))),
  gen5: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppSignesProduit').then((m) => ({ default: m.AppSignesProduit }))),
  gen6: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppInequationRationnelle').then((m) => ({ default: m.AppInequationRationnelle }))),
  gen61: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppQuizEquationsSecondDegre').then((m) => ({ default: m.AppQuizEquationsSecondDegre }))),
  gen121: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppDetectiveSecondDegre').then((m) => ({ default: m.AppDetectiveSecondDegre }))),
  gen113: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppMethodeNombreSolutions').then((m) => ({ default: m.AppMethodeNombreSolutions }))),
  gen117: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppLectureInequationGraphique').then((m) => ({ default: m.AppLectureInequationGraphique }))),
  gen114: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppSigneRacines').then((m) => ({ default: m.AppSigneRacines }))),

  // --- 4e, chapitre 3 : Caractéristiques d'une fonction et fonctions de référence ---
  gen10: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppFonctionsReference').then((m) => ({ default: m.AppFonctionsReference }))),
  gen11: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppFormeCanoniqueFonctionsReference').then((m) => ({ default: m.AppFormeCanoniqueFonctionsReference }))),
  gen12: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppCaracteristiquesFonction').then((m) => ({ default: m.AppCaracteristiquesFonction }))),
  gen13: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppCaracteristiquesAlgebriques').then((m) => ({ default: m.AppCaracteristiquesAlgebriques }))),
  gen68: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppProblemesFonctionsReference').then((m) => ({ default: m.AppProblemesFonctionsReference }))),
  gen69: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppChoisirModele').then((m) => ({ default: m.AppChoisirModele }))),
  gen70: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppGraphiqueContexte').then((m) => ({ default: m.AppGraphiqueContexte }))),
  gen71: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppPortraitRobotFonction').then((m) => ({ default: m.AppPortraitRobotFonction }))),
  gen72: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppTransformationsEnsembles').then((m) => ({ default: m.AppTransformationsEnsembles }))),
  gen73: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppResoudreTriangle').then((m) => ({ default: m.AppResoudreTriangle }))),
  gen122: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppLectureCercle').then((m) => ({ default: m.AppLectureCercle }))),
  gen76: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppValeurExacte').then((m) => ({ default: m.AppValeurExacte }))),
  gen80: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppComposerForces').then((m) => ({ default: m.AppComposerForces }))),
  gen75: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppAireTriangleSinus').then((m) => ({ default: m.AppAireTriangleSinus }))),
  gen81: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppDetectiveErreurs').then((m) => ({ default: m.AppDetectiveErreurs }))),
  gen77: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppTexteTriangle').then((m) => ({ default: m.AppTexteTriangle }))),
  gen78: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppEquationsTransformer').then((m) => ({ default: m.AppEquationsTransformer }))),
  gen62: entree(CH_4E_CARACTERISTIQUES_FONCTIONS_REFERENCE, () => import('./4e/AppQuizFonctionsReference').then((m) => ({ default: m.AppQuizFonctionsReference }))),

  // --- 4e, chapitre 5 : Cercle trigonométrique & triangles quelconques ---
  gen14: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppCercleTrigonometrique').then((m) => ({ default: m.AppCercleTrigonometrique }))),
  gen15: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppValeursRemarquables').then((m) => ({ default: m.AppValeursRemarquables }))),
  gen16: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppUnSansLautre').then((m) => ({ default: m.AppUnSansLautre }))),
  gen17: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppAnglesAssocies').then((m) => ({ default: m.AppAnglesAssocies }))),
  gen18: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppQuelAngle').then((m) => ({ default: m.AppQuelAngle }))),
  gen19: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppTriangleQuelconque').then((m) => ({ default: m.AppTriangleQuelconque }))),
  gen58: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppTriangleLies').then((m) => ({ default: m.AppTriangleLies }))),
  gen74: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppCasAmbigu').then((m) => ({ default: m.AppCasAmbigu }))),
  gen79: entree(CH_4E_CERCLE_TRIGONOMETRIQUE_TRIANGLES, () => import('./4e/AppRotationsContexte').then((m) => ({ default: m.AppRotationsContexte }))),
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
  gen108: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppTransformationDonnees').then((m) => ({ default: m.AppTransformationDonnees }))),
  gen111: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppDiagrammesTrompeurs').then((m) => ({ default: m.AppDiagrammesTrompeurs }))),
  gen109: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppValeurManquante').then((m) => ({ default: m.AppValeurManquante }))),
  gen110: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppValeurAberrante').then((m) => ({ default: m.AppValeurAberrante }))),
  gen112: entree(CH_4E_STATISTIQUE_DESCRIPTIVE, () => import('./4e/AppDetectiveStatistique').then((m) => ({ default: m.AppDetectiveStatistique }))),

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
  gen84: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppNatureQuadrilatere').then((m) => ({ default: m.AppNatureQuadrilatere }))),
  gen86: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppDeplacementsSuccessifs').then((m) => ({ default: m.AppDeplacementsSuccessifs }))),
  gen91: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppDetectiveVecteurs').then((m) => ({ default: m.AppDetectiveVecteurs }))),
  gen87: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppTraverserRiviere').then((m) => ({ default: m.AppTraverserRiviere }))),
  gen90: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppEquilibreForces').then((m) => ({ default: m.AppEquilibreForces }))),
  gen82: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppDecompositionVecteur').then((m) => ({ default: m.AppDecompositionVecteur }))),
  gen89: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppViserCible').then((m) => ({ default: m.AppViserCible }))),
  gen88: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppChantierTerrains').then((m) => ({ default: m.AppChantierTerrains }))),
  gen85: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppDemontrerVecteurs').then((m) => ({ default: m.AppDemontrerVecteurs }))),
  gen83: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppConstruireSomme').then((m) => ({ default: m.AppConstruireSomme }))),
  gen129: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppVecteursDirecteurs').then((m) => ({ default: m.AppVecteursDirecteurs }))),
  gen130: entree(CH_4E_CALCUL_VECTORIEL, () => import('./4e/AppChaslesSansFigure').then((m) => ({ default: m.AppChaslesSansFigure }))),

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
  gen92: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppDroiteCercle').then((m) => ({ default: m.AppDroiteCercle }))),
  gen93: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppCercleConditions').then((m) => ({ default: m.AppCercleConditions }))),
  gen94: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppDroitesRemarquables').then((m) => ({ default: m.AppDroitesRemarquables }))),
  gen95: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppDroitesParametre').then((m) => ({ default: m.AppDroitesParametre }))),
  gen96: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppProjeteSymetrique').then((m) => ({ default: m.AppProjeteSymetrique }))),
  gen97: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppTrajectoiresRencontre').then((m) => ({ default: m.AppTrajectoiresRencontre }))),
  gen98: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppIntersectionCercles').then((m) => ({ default: m.AppIntersectionCercles }))),
  gen99: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppDetectiveAnalytique').then((m) => ({ default: m.AppDetectiveAnalytique }))),
  gen131: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppTraduireLieu').then((m) => ({ default: m.AppTraduireLieu }))),
  gen132: entree(CH_4E_GEOMETRIE_ANALYTIQUE_PLANE, () => import('./4e/AppLireDroite').then((m) => ({ default: m.AppLireDroite }))),

  // --- 4e, chapitre 8 : Géométrie dans l'espace ---
  gen39: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppPositionDroitePlan').then((m) => ({ default: m.AppPositionDroitePlan }))),
  gen40: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppSectionPlaneSolide').then((m) => ({ default: m.AppSectionPlaneSolide }))),
  gen41: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppOmbreSoleil').then((m) => ({ default: m.AppOmbreSoleil }))),
  gen66: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppQuizGeometrieEspace').then((m) => ({ default: m.AppQuizGeometrieEspace }))),
  gen100: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppPositionsDeuxDroites').then((m) => ({ default: m.AppPositionsDeuxDroites }))),
  gen101: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppPositionsPlans').then((m) => ({ default: m.AppPositionsPlans }))),
  gen103: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppDemontrerParallelisme').then((m) => ({ default: m.AppDemontrerParallelisme }))),
  gen102: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppPointPercee').then((m) => ({ default: m.AppPointPercee }))),
  gen105: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppPointDeFuite').then((m) => ({ default: m.AppPointDeFuite }))),
  gen104: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppPerspectiveCavaliere').then((m) => ({ default: m.AppPerspectiveCavaliere }))),
  gen107: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppDetectiveEspace').then((m) => ({ default: m.AppDetectiveEspace }))),
  gen106: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppOmbreLampe').then((m) => ({ default: m.AppOmbreLampe }))),
  gen133: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppLireSolidePerspective').then((m) => ({ default: m.AppLireSolidePerspective }))),
  gen134: entree(CH_4E_GEOMETRIE_DANS_ESPACE, () => import('./4e/AppIntersectionPlansParallelisme').then((m) => ({ default: m.AppIntersectionPlansParallelisme }))),
  gen67: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppRelationsRacines').then((m) => ({ default: m.AppRelationsRacines }))),
  gen119: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppProblemesFraction').then((m) => ({ default: m.AppProblemesFraction }))),
  gen120: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppConstruireInequation').then((m) => ({ default: m.AppConstruireInequation }))),
  gen115: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppEquationParametre').then((m) => ({ default: m.AppEquationParametre }))),
  gen118: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppParaboleDroite').then((m) => ({ default: m.AppParaboleDroite }))),
  gen116: entree(CH_4E_EQUATIONS_INEQUATIONS_SECOND_DEGRE, () => import('./4e/AppBicarree').then((m) => ({ default: m.AppBicarree }))),

  // --- 5e, chapitre 1 : Fonctions : rappels et compléments ---
  '5gen1': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen1').then((m) => ({ default: m.App5gen1 }))),
  '5gen2': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen2').then((m) => ({ default: m.App5gen2 }))),
  '5gen3': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen3').then((m) => ({ default: m.App5gen3 }))),
  '5gen4': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen4').then((m) => ({ default: m.App5gen4 }))),
  '5gen5': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen5').then((m) => ({ default: m.App5gen5 }))),
  '5gen61': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen61').then((m) => ({ default: m.App5gen61 }))),
  '5gen62': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen62').then((m) => ({ default: m.App5gen62 }))),
  '5gen63': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen63').then((m) => ({ default: m.App5gen63 }))),
  '5gen60': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen60').then((m) => ({ default: m.App5gen60 }))),
  '5gen59': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen59').then((m) => ({ default: m.App5gen59 }))),
  '5gen58': entree(CH_5E_FONCTIONS_COMPOSEES, () => import('./5e-4h/App5gen58').then((m) => ({ default: m.App5gen58 }))),
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
  '5gen54': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen54').then((m) => ({ default: m.App5gen54 }))),
  '5gen55': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen55').then((m) => ({ default: m.App5gen55 }))),
  '5gen56': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen56').then((m) => ({ default: m.App5gen56 }))),
  '5gen57': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen57').then((m) => ({ default: m.App5gen57 }))),
  '5gen40': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen40').then((m) => ({ default: m.App5gen40 }))),
  '5gen50': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen50').then((m) => ({ default: m.App5gen50 }))),
  '5gen51': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen51').then((m) => ({ default: m.App5gen51 }))),
  '5gen52': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen52').then((m) => ({ default: m.App5gen52 }))),
  '5gen53': entree(CH_5E_TRIGONOMETRIE, () => import('./5e-4h/App5gen53').then((m) => ({ default: m.App5gen53 }))),

  // --- 5e, chapitre 3 : Suites ---
  '5gen14': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen14').then((m) => ({ default: m.App5gen14 }))),
  '5gen15': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen15').then((m) => ({ default: m.App5gen15 }))),
  '5gen16': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen16').then((m) => ({ default: m.App5gen16 }))),
  '5gen17': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen17').then((m) => ({ default: m.App5gen17 }))),
  '5gen18': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen18').then((m) => ({ default: m.App5gen18 }))),
  '5gen19': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen19').then((m) => ({ default: m.App5gen19 }))),
  '5gen41': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen41').then((m) => ({ default: m.App5gen41 }))),
  '5gen44': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen44').then((m) => ({ default: m.App5gen44 }))),
  '5gen45': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen45').then((m) => ({ default: m.App5gen45 }))),
  '5gen46': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen46').then((m) => ({ default: m.App5gen46 }))),
  '5gen47': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen47').then((m) => ({ default: m.App5gen47 }))),
  '5gen48': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen48').then((m) => ({ default: m.App5gen48 }))),
  '5gen49': entree(CH_5E_SUITES, () => import('./5e-4h/App5gen49').then((m) => ({ default: m.App5gen49 }))),

  // --- 5e, chapitre 4 : Limites et asymptotes ---
  '5gen20': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen20').then((m) => ({ default: m.App5gen20 }))),
  '5gen21': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen21').then((m) => ({ default: m.App5gen21 }))),
  '5gen22': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen22').then((m) => ({ default: m.App5gen22 }))),
  '5gen23': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen23').then((m) => ({ default: m.App5gen23 }))),
  '5gen24': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen24').then((m) => ({ default: m.App5gen24 }))),
  '5gen64': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen64').then((m) => ({ default: m.App5gen64 }))),
  '5gen65': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen65').then((m) => ({ default: m.App5gen65 }))),
  '5gen66': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen66').then((m) => ({ default: m.App5gen66 }))),
  '5gen67': entree(CH_5E_LIMITES_ASYMPTOTES, () => import('./5e-4h/App5gen67').then((m) => ({ default: m.App5gen67 }))),
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
  '5gen71': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen71').then((m) => ({ default: m.App5gen71 }))),
  '5gen72': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen72').then((m) => ({ default: m.App5gen72 }))),
  '5gen73': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen73').then((m) => ({ default: m.App5gen73 }))),
  '5gen74': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen74').then((m) => ({ default: m.App5gen74 }))),
  '5gen75': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen75').then((m) => ({ default: m.App5gen75 }))),
  '5gen43': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen43').then((m) => ({ default: m.App5gen43 }))),
  // --- 5e, chapitre 6 : Statistique à deux variables ---
  '5gen82': entree(CH_5E_STATISTIQUE_DEUX_VARIABLES, () => import('./5e-4h/App5gen82').then((m) => ({ default: m.App5gen82 }))),
  '5gen68': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen68').then((m) => ({ default: m.App5gen68 }))),
  '5gen69': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen69').then((m) => ({ default: m.App5gen69 }))),
  '5gen70': entree(CH_5E_DERIVEES_APPLICATIONS, () => import('./5e-4h/App5gen70').then((m) => ({ default: m.App5gen70 }))),

  // --- 5e, chapitre 6 : Statistique à deux variables (lot H1) ---
  '5gen76': entree(CH_5E_STATISTIQUE_DEUX_VARIABLES, () => import('./5e-4h/App5gen76').then((m) => ({ default: m.App5gen76 }))),
  '5gen77': entree(CH_5E_STATISTIQUE_DEUX_VARIABLES, () => import('./5e-4h/App5gen77').then((m) => ({ default: m.App5gen77 }))),
  '5gen36': entree(CH_5E_STATISTIQUE_DEUX_VARIABLES, () => import('./5e-4h/App5gen36').then((m) => ({ default: m.App5gen36 }))),
  '5gen37': entree(CH_5E_STATISTIQUE_DEUX_VARIABLES, () => import('./5e-4h/App5gen37').then((m) => ({ default: m.App5gen37 }))),
  '5gen38': entree(CH_5E_STATISTIQUE_DEUX_VARIABLES, () => import('./5e-4h/App5gen38').then((m) => ({ default: m.App5gen38 }))),

  // --- 6e, chapitre 1 : Fonctions réciproques & cyclométriques ---
  '6gen1': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen1').then((m) => ({ default: m.App6gen1 }))),
  '6gen2': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen2').then((m) => ({ default: m.App6gen2 }))),
  '6gen3': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen3').then((m) => ({ default: m.App6gen3 }))),
  '6gen4': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen4').then((m) => ({ default: m.App6gen4 }))),
  '6gen5': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen5').then((m) => ({ default: m.App6gen5 }))),
  '6gen152': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen152').then((m) => ({ default: m.App6gen152 }))),
  '6gen153': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen153').then((m) => ({ default: m.App6gen153 }))),
  '6gen154': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen154').then((m) => ({ default: m.App6gen154 }))),
  '6gen155': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen155').then((m) => ({ default: m.App6gen155 }))),
  '6gen64': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen64').then((m) => ({ default: m.App6gen64 }))),
  '6gen156': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen156').then((m) => ({ default: m.App6gen156 }))),
  '6gen157': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen157').then((m) => ({ default: m.App6gen157 }))),
  '6gen158': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen158').then((m) => ({ default: m.App6gen158 }))),
  '6gen159': entree(CH_6E_FONCTIONS_RECIPROQUES_CYCLOMETRIQUES, () => import('./6e-6h/App6gen159').then((m) => ({ default: m.App6gen159 }))),

  // --- 6e, chapitre 2 : Fonctions exponentielles ---
  '6gen6': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen6').then((m) => ({ default: m.App6gen6 }))),
  '6gen7': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen7').then((m) => ({ default: m.App6gen7 }))),
  '6gen8': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen8').then((m) => ({ default: m.App6gen8 }))),
  '6gen9': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen9').then((m) => ({ default: m.App6gen9 }))),
  '6gen10': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen10').then((m) => ({ default: m.App6gen10 }))),
  '6gen11': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen11').then((m) => ({ default: m.App6gen11 }))),
  '6gen12': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen12').then((m) => ({ default: m.App6gen12 }))),
  '6gen65': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen65').then((m) => ({ default: m.App6gen65 }))),
  '6gen148': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen148').then((m) => ({ default: m.App6gen148 }))),
  '6gen149': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen149').then((m) => ({ default: m.App6gen149 }))),
  '6gen150': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen150').then((m) => ({ default: m.App6gen150 }))),
  '6gen151': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen151').then((m) => ({ default: m.App6gen151 }))),
  '6gen144': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen144').then((m) => ({ default: m.App6gen144 }))),
  '6gen147': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen147').then((m) => ({ default: m.App6gen147 }))),
  '6gen145': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen145').then((m) => ({ default: m.App6gen145 }))),
  '6gen146': entree(CH_6E_FONCTIONS_EXPONENTIELLES, () => import('./6e-6h/App6gen146').then((m) => ({ default: m.App6gen146 }))),

  // --- 6e, chapitre 3 : Fonctions logarithmes ---
  '6gen13': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen13').then((m) => ({ default: m.App6gen13 }))),
  '6gen20': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen20').then((m) => ({ default: m.App6gen20 }))),
  '6gen18': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen18').then((m) => ({ default: m.App6gen18 }))),
  '6gen19': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen19').then((m) => ({ default: m.App6gen19 }))),
  '6gen14': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen14').then((m) => ({ default: m.App6gen14 }))),
  '6gen17': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen17').then((m) => ({ default: m.App6gen17 }))),
  '6gen22': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen22').then((m) => ({ default: m.App6gen22 }))),
  '6gen21': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen21').then((m) => ({ default: m.App6gen21 }))),
  '6gen15': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen15').then((m) => ({ default: m.App6gen15 }))),
  '6gen16': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen16').then((m) => ({ default: m.App6gen16 }))),
  '6gen66': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen66').then((m) => ({ default: m.App6gen66 }))),
  '6gen90': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen90').then((m) => ({ default: m.App6gen90 }))),
  '6gen85': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen85').then((m) => ({ default: m.App6gen85 }))),
  '6gen91': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen91').then((m) => ({ default: m.App6gen91 }))),
  '6gen88': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen88').then((m) => ({ default: m.App6gen88 }))),
  '6gen86': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen86').then((m) => ({ default: m.App6gen86 }))),
  '6gen92': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen92').then((m) => ({ default: m.App6gen92 }))),
  '6gen89': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen89').then((m) => ({ default: m.App6gen89 }))),
  '6gen87': entree(CH_6E_FONCTIONS_LOGARITHMES, () => import('./6e-6h/App6gen87').then((m) => ({ default: m.App6gen87 }))),

  // --- 6e, chapitre 7 : Analyse combinatoire ---
  '6gen43': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen43').then((m) => ({ default: m.App6gen43 }))),
  '6gen44': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen44').then((m) => ({ default: m.App6gen44 }))),
  '6gen45': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen45').then((m) => ({ default: m.App6gen45 }))),
  '6gen46': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen46').then((m) => ({ default: m.App6gen46 }))),
  '6gen47': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen47').then((m) => ({ default: m.App6gen47 }))),
  '6gen48': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen48').then((m) => ({ default: m.App6gen48 }))),
  '6gen70': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen70').then((m) => ({ default: m.App6gen70 }))),
  '6gen100': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen100').then((m) => ({ default: m.App6gen100 }))),
  '6gen101': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen101').then((m) => ({ default: m.App6gen101 }))),
  '6gen102': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen102').then((m) => ({ default: m.App6gen102 }))),
  '6gen103': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen103').then((m) => ({ default: m.App6gen103 }))),
  '6gen104': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen104').then((m) => ({ default: m.App6gen104 }))),
  '6gen105': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen105').then((m) => ({ default: m.App6gen105 }))),
  '6gen106': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen106').then((m) => ({ default: m.App6gen106 }))),
  '6gen107': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen107').then((m) => ({ default: m.App6gen107 }))),
  '6gen108': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen108').then((m) => ({ default: m.App6gen108 }))),
  '6gen109': entree(CH_6E_ANALYSE_COMBINATOIRE, () => import('./6e-6h/App6gen109').then((m) => ({ default: m.App6gen109 }))),

  // --- 6e, chapitre 8 : Variables aléatoires et lois de probabilités ---
  '6gen49': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen49').then((m) => ({ default: m.App6gen49 }))),
  '6gen50': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen50').then((m) => ({ default: m.App6gen50 }))),
  '6gen51': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen51').then((m) => ({ default: m.App6gen51 }))),
  '6gen52': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen52').then((m) => ({ default: m.App6gen52 }))),
  '6gen53': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen53').then((m) => ({ default: m.App6gen53 }))),
  '6gen116': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen116').then((m) => ({ default: m.App6gen116 }))),
  '6gen117': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen117').then((m) => ({ default: m.App6gen117 }))),
  '6gen118': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen118').then((m) => ({ default: m.App6gen118 }))),
  '6gen119': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen119').then((m) => ({ default: m.App6gen119 }))),
  '6gen120': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen120').then((m) => ({ default: m.App6gen120 }))),
  '6gen121': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen121').then((m) => ({ default: m.App6gen121 }))),
  '6gen122': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen122').then((m) => ({ default: m.App6gen122 }))),
  '6gen71': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen71').then((m) => ({ default: m.App6gen71 }))),
  '6gen110': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen110').then((m) => ({ default: m.App6gen110 }))),
  '6gen111': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen111').then((m) => ({ default: m.App6gen111 }))),
  '6gen112': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen112').then((m) => ({ default: m.App6gen112 }))),
  '6gen113': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen113').then((m) => ({ default: m.App6gen113 }))),
  '6gen114': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen114').then((m) => ({ default: m.App6gen114 }))),
  '6gen115': entree(CH_6E_VARIABLES_ALEATOIRES, () => import('./6e-6h/App6gen115').then((m) => ({ default: m.App6gen115 }))),
  '6gen23': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen23').then((m) => ({ default: m.App6gen23 }))),
  '6gen24': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen24').then((m) => ({ default: m.App6gen24 }))),
  '6gen25': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen25').then((m) => ({ default: m.App6gen25 }))),
  '6gen26': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen26').then((m) => ({ default: m.App6gen26 }))),
  '6gen27': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen27').then((m) => ({ default: m.App6gen27 }))),
  '6gen28': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen28').then((m) => ({ default: m.App6gen28 }))),
  '6gen29': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen29').then((m) => ({ default: m.App6gen29 }))),
  '6gen67': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen67').then((m) => ({ default: m.App6gen67 }))),
  '6gen77': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen77').then((m) => ({ default: m.App6gen77 }))),
  '6gen84': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen84').then((m) => ({ default: m.App6gen84 }))),
  '6gen82': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen82').then((m) => ({ default: m.App6gen82 }))),
  '6gen78': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen78').then((m) => ({ default: m.App6gen78 }))),
  '6gen80': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen80').then((m) => ({ default: m.App6gen80 }))),
  '6gen83': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen83').then((m) => ({ default: m.App6gen83 }))),
  '6gen79': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen79').then((m) => ({ default: m.App6gen79 }))),
  '6gen81': entree(CH_6E_PRIMITIVES_INTEGRALES, () => import('./6e-6h/App6gen81').then((m) => ({ default: m.App6gen81 }))),
  '6gen34': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen34').then((m) => ({ default: m.App6gen34 }))),
  '6gen35': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen35').then((m) => ({ default: m.App6gen35 }))),
  '6gen36': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen36').then((m) => ({ default: m.App6gen36 }))),
  '6gen37': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen37').then((m) => ({ default: m.App6gen37 }))),
  '6gen38': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen38').then((m) => ({ default: m.App6gen38 }))),
  '6gen39': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen39').then((m) => ({ default: m.App6gen39 }))),
  '6gen40': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen40').then((m) => ({ default: m.App6gen40 }))),
  '6gen41': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen41').then((m) => ({ default: m.App6gen41 }))),
  '6gen42': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen42').then((m) => ({ default: m.App6gen42 }))),
  '6gen68': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen68').then((m) => ({ default: m.App6gen68 }))),
  '6gen93': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen93').then((m) => ({ default: m.App6gen93 }))),
  '6gen95': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen95').then((m) => ({ default: m.App6gen95 }))),
  '6gen94': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen94').then((m) => ({ default: m.App6gen94 }))),
  '6gen97': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen97').then((m) => ({ default: m.App6gen97 }))),
  '6gen96': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen96').then((m) => ({ default: m.App6gen96 }))),
  '6gen98': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen98').then((m) => ({ default: m.App6gen98 }))),
  '6gen99': entree(CH_6E_NOMBRES_COMPLEXES, () => import('./6e-6h/App6gen99').then((m) => ({ default: m.App6gen99 }))),
  '6gen30': entree(CH_6E_PROBABILITES, () => import('./6e-6h/App6gen30').then((m) => ({ default: m.App6gen30 }))),
  '6gen31': entree(CH_6E_PROBABILITES, () => import('./6e-6h/App6gen31').then((m) => ({ default: m.App6gen31 }))),
  '6gen32': entree(CH_6E_PROBABILITES, () => import('./6e-6h/App6gen32').then((m) => ({ default: m.App6gen32 }))),
  '6gen33': entree(CH_6E_PROBABILITES, () => import('./6e-6h/App6gen33').then((m) => ({ default: m.App6gen33 }))),
  '6gen74': entree(CH_6E_PROBABILITES, () => import('./6e-6h/App6gen74').then((m) => ({ default: m.App6gen74 }))),
  '6gen75': entree(CH_6E_PROBABILITES, () => import('./6e-6h/App6gen75').then((m) => ({ default: m.App6gen75 }))),
  '6gen76': entree(CH_6E_PROBABILITES, () => import('./6e-6h/App6gen76').then((m) => ({ default: m.App6gen76 }))),
  '6gen162': entree(CH_6E_PROBABILITES, () => import('./6e-6h/App6gen162').then((m) => ({ default: m.App6gen162 }))),
  '6gen163': entree(CH_6E_PROBABILITES, () => import('./6e-6h/App6gen163').then((m) => ({ default: m.App6gen163 }))),
  '6gen160': entree(CH_6E_PROBABILITES, () => import('./6e-6h/App6gen160').then((m) => ({ default: m.App6gen160 }))),
  '6gen161': entree(CH_6E_PROBABILITES, () => import('./6e-6h/App6gen161').then((m) => ({ default: m.App6gen161 }))),
  '6gen69': entree(CH_6E_PROBABILITES, () => import('./6e-6h/App6gen69').then((m) => ({ default: m.App6gen69 }))),
  '6gen54': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen54').then((m) => ({ default: m.App6gen54 }))),
  '6gen55': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen55').then((m) => ({ default: m.App6gen55 }))),
  '6gen56': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen56').then((m) => ({ default: m.App6gen56 }))),
  '6gen57': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen57').then((m) => ({ default: m.App6gen57 }))),
  '6gen128': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen128').then((m) => ({ default: m.App6gen128 }))),
  '6gen129': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen129').then((m) => ({ default: m.App6gen129 }))),
  '6gen130': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen130').then((m) => ({ default: m.App6gen130 }))),
  '6gen131': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen131').then((m) => ({ default: m.App6gen131 }))),
  '6gen72': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen72').then((m) => ({ default: m.App6gen72 }))),
  '6gen123': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen123').then((m) => ({ default: m.App6gen123 }))),
  '6gen124': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen124').then((m) => ({ default: m.App6gen124 }))),
  '6gen125': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen125').then((m) => ({ default: m.App6gen125 }))),
  '6gen126': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen126').then((m) => ({ default: m.App6gen126 }))),
  '6gen127': entree(CH_6E_LIEUX_GEOMETRIQUES, () => import('./6e-6h/App6gen127').then((m) => ({ default: m.App6gen127 }))),
  '6gen58': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen58').then((m) => ({ default: m.App6gen58 }))),
  '6gen59': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen59').then((m) => ({ default: m.App6gen59 }))),
  '6gen60': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen60').then((m) => ({ default: m.App6gen60 }))),
  '6gen61': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen61').then((m) => ({ default: m.App6gen61 }))),
  '6gen62': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen62').then((m) => ({ default: m.App6gen62 }))),
  '6gen63': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen63').then((m) => ({ default: m.App6gen63 }))),
  '6gen132': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen132').then((m) => ({ default: m.App6gen132 }))),
  '6gen133': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen133').then((m) => ({ default: m.App6gen133 }))),
  '6gen134': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen134').then((m) => ({ default: m.App6gen134 }))),
  '6gen135': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen135').then((m) => ({ default: m.App6gen135 }))),
  '6gen136': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen136').then((m) => ({ default: m.App6gen136 }))),
  '6gen137': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen137').then((m) => ({ default: m.App6gen137 }))),
  '6gen73': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen73').then((m) => ({ default: m.App6gen73 }))),
  '6gen138': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen138').then((m) => ({ default: m.App6gen138 }))),
  '6gen139': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen139').then((m) => ({ default: m.App6gen139 }))),
  '6gen140': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen140').then((m) => ({ default: m.App6gen140 }))),
  '6gen141': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen141').then((m) => ({ default: m.App6gen141 }))),
  '6gen142': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen142').then((m) => ({ default: m.App6gen142 }))),
  '6gen143': entree(CH_6E_CONIQUES, () => import('./6e-6h/App6gen143').then((m) => ({ default: m.App6gen143 }))),
}
