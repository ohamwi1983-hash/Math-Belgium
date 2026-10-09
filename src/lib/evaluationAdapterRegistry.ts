import type { AdaptateurFeuilleExercices } from '../entrainement/export/genererFeuilleExercices'

/**
 * Registre des adaptateurs `AdaptateurFeuilleExercices<T>` déjà portés dans Math-Belgium (voir
 * `.claude/rules` — chaque fichier `generateurs/{nom}/exportEvaluation.ts` transforme UNE instance
 * tirée en énoncé/corrigé rédigés pour le document imprimable). SEULE source de vérité pour "quel
 * générateur peut générer une évaluation/feuille d'exercices 100% localement, sans passer par
 * plateforme-maths" — `evaluationLocal.ts` la consulte avant de décider local vs redirection.
 *
 * Miroir manuel de `AppEvaluation4e.tsx::ADAPTATEURS`/`AppEvaluation5e.tsx::ADAPTATEURS` côté
 * plateforme-maths — un `Record` par chantier (4e : chapitres 1 à 8, 55 générateurs ; 5e :
 * chapitres 1 à 5, 35 générateurs — voir chaque fichier source pour le détail des sections
 * couvertes/exclues), plus `EVALUATION_ADAPTER_REGISTRY` qui les fusionne pour un lookup unique
 * par `generatorId` (les deux unions `gen*`/`5gen*` ne se recoupent jamais). `as unknown as
 * AdaptateurFeuilleExercices<never>` : chaque adaptateur a son propre paramètre de type T (une
 * instance de SON générateur), jamais unifiable dans un seul `Record` sans passer par un type
 * existentiel — même compromis déjà accepté côté plateforme-maths.
 */

import { adaptateurEvaluationSecondDegre } from '../entrainement/4e/generateurs/secondDegre/exportEvaluation'
import { adaptateurEvaluationInequations } from '../entrainement/4e/generateurs/inequations/exportEvaluation'
import { adaptateurEvaluationSimplification } from '../entrainement/4e/generateurs/simplification/exportEvaluation'
import { adaptateurEvaluationEquationRationnelle } from '../entrainement/4e/generateurs/equationRationnelle/exportEvaluation'
import { adaptateurEvaluationSignesProduit } from '../entrainement/4e/generateurs/signesProduit/exportEvaluation'
import { adaptateurEvaluationInequationRationnelle } from '../entrainement/4e/generateurs/inequationRationnelle/exportEvaluation'
import { adaptateurExportWordAnalyseFonction } from '../entrainement/4e/generateurs/analyseFonction/exportWord'
import { adaptateurEvaluationTransformationsGraphiques } from '../entrainement/4e/generateurs/transformationsGraphiques/exportEvaluation'
import { adaptateurEvaluationFormeCanoniqueTransformations } from '../entrainement/4e/generateurs/formeCanoniqueTransformations/exportEvaluation'
import { adaptateurEvaluationFonctionsReference } from '../entrainement/4e/generateurs/fonctionsReference/exportEvaluation'
import { adaptateurEvaluationFormeCanoniqueFonctionsReference } from '../entrainement/4e/generateurs/formeCanoniqueFonctionsReference/exportEvaluation'
import { adaptateurEvaluationCaracteristiquesFonction } from '../entrainement/4e/generateurs/caracteristiquesFonction/exportEvaluation'
import { adaptateurEvaluationCaracteristiquesAlgebriques } from '../entrainement/4e/generateurs/caracteristiquesAlgebriques/exportEvaluation'
import { adaptateurEvaluationTableauFrequences } from '../entrainement/4e/generateurs/tableauFrequences/exportEvaluation'
import { adaptateurEvaluationHistogramme } from '../entrainement/4e/generateurs/histogramme/exportEvaluation'
import { adaptateurEvaluationMoyennePonderee } from '../entrainement/4e/generateurs/moyennePonderee/exportEvaluation'
import { adaptateurEvaluationMediane } from '../entrainement/4e/generateurs/mediane/exportEvaluation'
import { adaptateurEvaluationDispersion } from '../entrainement/4e/generateurs/dispersion/exportEvaluation'
import { adaptateurEvaluationExerciceSynthese } from '../entrainement/4e/generateurs/exerciceSynthese/exportEvaluation'
import { adaptateurEvaluationBoiteMoustaches } from '../entrainement/4e/generateurs/boiteMoustaches/exportEvaluation'
import { adaptateurEvaluationBienaymeTchebychev } from '../entrainement/4e/generateurs/bienaymeTchebychev/exportEvaluation'
import { adaptateurEvaluationComparaisonSeries } from '../entrainement/4e/generateurs/comparaisonSeries/exportEvaluation'
import { adaptateurEvaluationCercleTrigonometrique } from '../entrainement/4e/generateurs/cercleTrigonometrique/exportEvaluation'
import { adaptateurEvaluationValeursRemarquables } from '../entrainement/4e/generateurs/valeursRemarquables/exportEvaluation'
import { adaptateurEvaluationUnSansLautre } from '../entrainement/4e/generateurs/unSansLautre/exportEvaluation'
import { adaptateurEvaluationAnglesAssocies } from '../entrainement/4e/generateurs/anglesAssocies/exportEvaluation'
import { adaptateurEvaluationQuelAngle } from '../entrainement/4e/generateurs/quelAngle/exportEvaluation'
import { adaptateurEvaluationTriangleQuelconque } from '../entrainement/4e/generateurs/triangleQuelconque/exportEvaluation'
import { adaptateurEvaluationTriangleLies } from '../entrainement/4e/generateurs/triangleLies/exportEvaluation'
import { adaptateurEvaluationPointVectoriel } from '../entrainement/4e/generateurs/pointVectoriel/exportEvaluation'
import { adaptateurEvaluationRelationVectorielle } from '../entrainement/4e/generateurs/relationVectorielle/exportEvaluation'
import { adaptateurEvaluationCombinaisonVecteurs } from '../entrainement/4e/generateurs/combinaisonVecteurs/exportEvaluation'
import { adaptateurEvaluationConstructionVectorielle } from '../entrainement/4e/generateurs/constructionVectorielle/exportEvaluation'
import { adaptateurEvaluationColinearite } from '../entrainement/4e/generateurs/colinearite/exportEvaluation'
import { adaptateurEvaluationOrthogonalite } from '../entrainement/4e/generateurs/orthogonalite/exportEvaluation'
import { adaptateurEvaluationNormeDistance } from '../entrainement/4e/generateurs/normeDistance/exportEvaluation'
import { adaptateurEvaluationReductionVectorielle } from '../entrainement/4e/generateurs/reductionVectorielle/exportEvaluation'
import { adaptateurEvaluationComparaisonVecteurs } from '../entrainement/4e/generateurs/comparaisonVecteurs/exportEvaluation'
import { adaptateurEvaluationApplicationPhysique } from '../entrainement/4e/generateurs/applicationPhysique/exportEvaluation'
import { adaptateurEvaluationEquationDroite } from '../entrainement/4e/generateurs/equationDroite/exportEvaluation'
import { adaptateurEvaluationLectureGraphiqueDroite } from '../entrainement/4e/generateurs/lectureGraphiqueDroite/exportEvaluation'
import { adaptateurEvaluationConstructionDroite } from '../entrainement/4e/generateurs/constructionDroite/exportEvaluation'
import { adaptateurEvaluationRelationsDroites } from '../entrainement/4e/generateurs/relationsDroites/exportEvaluation'
import { adaptateurEvaluationCaracteristiquesDroite } from '../entrainement/4e/generateurs/caracteristiquesDroite/exportEvaluation'
import { adaptateurEvaluationDistanceDroite } from '../entrainement/4e/generateurs/distanceDroite/exportEvaluation'
import { adaptateurEvaluationIntersectionDroites } from '../entrainement/4e/generateurs/intersectionDroites/exportEvaluation'
import { adaptateurEvaluationEquationCercle } from '../entrainement/4e/generateurs/equationCercle/exportEvaluation'
import { adaptateurEvaluationEquationCercleDeveloppee } from '../entrainement/4e/generateurs/equationCercleDeveloppee/exportEvaluation'
import { adaptateurEvaluationEquationParabole } from '../entrainement/4e/generateurs/equationParabole/exportEvaluation'
import { adaptateurEvaluationEquationParaboleDeveloppee } from '../entrainement/4e/generateurs/equationParaboleDeveloppee/exportEvaluation'
import { adaptateurEvaluationConstructionParabole } from '../entrainement/4e/generateurs/constructionParabole/exportEvaluation'
import { adaptateurEvaluationLieuxGeometriques } from '../entrainement/4e/generateurs/lieuxGeometriques/exportEvaluation'
import { adaptateurEvaluationPositionDroitePlan } from '../entrainement/4e/generateurs/positionDroitePlan/exportEvaluation'
import { adaptateurEvaluationSectionPlaneSolide } from '../entrainement/4e/generateurs/sectionPlaneSolide/exportEvaluation'
import { adaptateurEvaluationOmbreSoleil } from '../entrainement/4e/generateurs/ombreSoleil/exportEvaluation'

export const EVALUATION_ADAPTER_REGISTRY_4E: Record<string, AdaptateurFeuilleExercices<never>> = {
  gen1: adaptateurEvaluationSecondDegre as unknown as AdaptateurFeuilleExercices<never>,
  gen2: adaptateurEvaluationInequations as unknown as AdaptateurFeuilleExercices<never>,
  gen3: adaptateurEvaluationSimplification as unknown as AdaptateurFeuilleExercices<never>,
  gen4: adaptateurEvaluationEquationRationnelle as unknown as AdaptateurFeuilleExercices<never>,
  gen5: adaptateurEvaluationSignesProduit as unknown as AdaptateurFeuilleExercices<never>,
  gen6: adaptateurEvaluationInequationRationnelle as unknown as AdaptateurFeuilleExercices<never>,
  gen7: adaptateurExportWordAnalyseFonction as unknown as AdaptateurFeuilleExercices<never>,
  gen8: adaptateurEvaluationTransformationsGraphiques as unknown as AdaptateurFeuilleExercices<never>,
  gen9: adaptateurEvaluationFormeCanoniqueTransformations as unknown as AdaptateurFeuilleExercices<never>,
  gen10: adaptateurEvaluationFonctionsReference as unknown as AdaptateurFeuilleExercices<never>,
  gen11: adaptateurEvaluationFormeCanoniqueFonctionsReference as unknown as AdaptateurFeuilleExercices<never>,
  gen12: adaptateurEvaluationCaracteristiquesFonction as unknown as AdaptateurFeuilleExercices<never>,
  gen13: adaptateurEvaluationCaracteristiquesAlgebriques as unknown as AdaptateurFeuilleExercices<never>,
  gen30: adaptateurEvaluationTableauFrequences as unknown as AdaptateurFeuilleExercices<never>,
  gen31: adaptateurEvaluationHistogramme as unknown as AdaptateurFeuilleExercices<never>,
  gen32: adaptateurEvaluationMoyennePonderee as unknown as AdaptateurFeuilleExercices<never>,
  gen33: adaptateurEvaluationMediane as unknown as AdaptateurFeuilleExercices<never>,
  gen34: adaptateurEvaluationDispersion as unknown as AdaptateurFeuilleExercices<never>,
  gen35: adaptateurEvaluationExerciceSynthese as unknown as AdaptateurFeuilleExercices<never>,
  gen36: adaptateurEvaluationBoiteMoustaches as unknown as AdaptateurFeuilleExercices<never>,
  gen37: adaptateurEvaluationBienaymeTchebychev as unknown as AdaptateurFeuilleExercices<never>,
  gen38: adaptateurEvaluationComparaisonSeries as unknown as AdaptateurFeuilleExercices<never>,
  gen14: adaptateurEvaluationCercleTrigonometrique as unknown as AdaptateurFeuilleExercices<never>,
  gen15: adaptateurEvaluationValeursRemarquables as unknown as AdaptateurFeuilleExercices<never>,
  gen16: adaptateurEvaluationUnSansLautre as unknown as AdaptateurFeuilleExercices<never>,
  gen17: adaptateurEvaluationAnglesAssocies as unknown as AdaptateurFeuilleExercices<never>,
  gen18: adaptateurEvaluationQuelAngle as unknown as AdaptateurFeuilleExercices<never>,
  gen19: adaptateurEvaluationTriangleQuelconque as unknown as AdaptateurFeuilleExercices<never>,
  gen58: adaptateurEvaluationTriangleLies as unknown as AdaptateurFeuilleExercices<never>,
  gen20: adaptateurEvaluationPointVectoriel as unknown as AdaptateurFeuilleExercices<never>,
  gen21: adaptateurEvaluationRelationVectorielle as unknown as AdaptateurFeuilleExercices<never>,
  gen22: adaptateurEvaluationCombinaisonVecteurs as unknown as AdaptateurFeuilleExercices<never>,
  gen23: adaptateurEvaluationConstructionVectorielle as unknown as AdaptateurFeuilleExercices<never>,
  gen24: adaptateurEvaluationColinearite as unknown as AdaptateurFeuilleExercices<never>,
  gen25: adaptateurEvaluationOrthogonalite as unknown as AdaptateurFeuilleExercices<never>,
  gen26: adaptateurEvaluationNormeDistance as unknown as AdaptateurFeuilleExercices<never>,
  gen27: adaptateurEvaluationReductionVectorielle as unknown as AdaptateurFeuilleExercices<never>,
  gen28: adaptateurEvaluationComparaisonVecteurs as unknown as AdaptateurFeuilleExercices<never>,
  gen29: adaptateurEvaluationApplicationPhysique as unknown as AdaptateurFeuilleExercices<never>,
  gen42: adaptateurEvaluationEquationDroite as unknown as AdaptateurFeuilleExercices<never>,
  gen43: adaptateurEvaluationLectureGraphiqueDroite as unknown as AdaptateurFeuilleExercices<never>,
  gen44: adaptateurEvaluationConstructionDroite as unknown as AdaptateurFeuilleExercices<never>,
  gen45: adaptateurEvaluationRelationsDroites as unknown as AdaptateurFeuilleExercices<never>,
  gen46: adaptateurEvaluationCaracteristiquesDroite as unknown as AdaptateurFeuilleExercices<never>,
  gen47: adaptateurEvaluationDistanceDroite as unknown as AdaptateurFeuilleExercices<never>,
  gen48: adaptateurEvaluationIntersectionDroites as unknown as AdaptateurFeuilleExercices<never>,
  gen49: adaptateurEvaluationEquationCercle as unknown as AdaptateurFeuilleExercices<never>,
  gen50: adaptateurEvaluationEquationCercleDeveloppee as unknown as AdaptateurFeuilleExercices<never>,
  gen51: adaptateurEvaluationEquationParabole as unknown as AdaptateurFeuilleExercices<never>,
  gen52: adaptateurEvaluationEquationParaboleDeveloppee as unknown as AdaptateurFeuilleExercices<never>,
  gen53: adaptateurEvaluationConstructionParabole as unknown as AdaptateurFeuilleExercices<never>,
  gen54: adaptateurEvaluationLieuxGeometriques as unknown as AdaptateurFeuilleExercices<never>,
  gen39: adaptateurEvaluationPositionDroitePlan as unknown as AdaptateurFeuilleExercices<never>,
  gen40: adaptateurEvaluationSectionPlaneSolide as unknown as AdaptateurFeuilleExercices<never>,
  gen41: adaptateurEvaluationOmbreSoleil as unknown as AdaptateurFeuilleExercices<never>,
}

import { adaptateurEvaluationDomaineDefinition } from '../entrainement/5e-4h/generateurs5e/domaineDefinition/exportEvaluation'
import { adaptateurEvaluationDecompositionFonction } from '../entrainement/5e-4h/generateurs5e/decompositionFonction/exportEvaluation'
import { adaptateurEvaluationComposerFonctions } from '../entrainement/5e-4h/generateurs5e/composerFonctions/exportEvaluation'
import { adaptateurEvaluationComposeeGraphique } from '../entrainement/5e-4h/generateurs5e/composeeGraphique/exportEvaluation'
import { adaptateurEvaluationProblemesContexte } from '../entrainement/5e-4h/generateurs5e/problemesContexte/exportEvaluation'
import { adaptateurEvaluationArcSecteur } from '../entrainement/5e-4h/generateurs5e/arcsSecteurs/exportEvaluation'
import { adaptateurEvaluationPolygonesArcsSecteurs } from '../entrainement/5e-4h/generateurs5e/polygonesArcsSecteurs/exportEvaluation'
import { adaptateurEvaluationParametresSinusoide } from '../entrainement/5e-4h/generateurs5e/parametresSinusoide/exportEvaluation'
import { adaptateurEvaluationParametresSinusoideGraphique } from '../entrainement/5e-4h/generateurs5e/parametresSinusoideGraphique/exportEvaluation'
import { adaptateurEvaluationEquationTrig } from '../entrainement/5e-4h/generateurs5e/equationsTrigonometriques/exportEvaluation'
import { adaptateurEvaluationExtremumsSinusoide } from '../entrainement/5e-4h/generateurs5e/extremumsSinusoide/exportEvaluation'
import { adaptateurEvaluationGeometrieCercle } from '../entrainement/5e-4h/generateurs5e/geometrieCercle/exportEvaluation'
import { adaptateurEvaluationModelisationSinusoide } from '../entrainement/5e-4h/generateurs5e/modelisationSinusoide/exportEvaluation'
import { adaptateurEvaluationSuitesArithmetiques } from '../entrainement/5e-4h/generateurs5e/suitesArithmetiques/exportEvaluation'
import { adaptateurEvaluationSuitesGeometriques } from '../entrainement/5e-4h/generateurs5e/suitesGeometriques/exportEvaluation'
import { adaptateurEvaluationConvergenceSuites } from '../entrainement/5e-4h/generateurs5e/convergenceSuites/exportEvaluation'
import { adaptateurEvaluationSuitesClassiques } from '../entrainement/5e-4h/generateurs5e/suitesClassiques/exportEvaluation'
import { adaptateurEvaluationComparaisonSuites } from '../entrainement/5e-4h/generateurs5e/comparaisonSuites/exportEvaluation'
import { adaptateurEvaluationSuiteRecurrenteAffine } from '../entrainement/5e-4h/generateurs5e/suiteRecurrenteAffine/exportEvaluation'
import { adaptateurEvaluationLimites } from '../entrainement/5e-4h/generateurs5e/limites/exportEvaluation'
import { adaptateurEvaluationAsymptoteOblique } from '../entrainement/5e-4h/generateurs5e/asymptoteOblique/exportEvaluation'
import { adaptateurEvaluationLectureGraphiqueLimites } from '../entrainement/5e-4h/generateurs5e/lectureGraphiqueLimites/exportEvaluation'
import { adaptateurEvaluationLimitesContexte } from '../entrainement/5e-4h/generateurs5e/limitesContexte/exportEvaluation'
import { adaptateurEvaluationEtudeComplete } from '../entrainement/5e-4h/generateurs5e/etudeComplete/exportEvaluation'
import { adaptateurEvaluationAssociation } from '../entrainement/5e-4h/generateurs5e/association/exportEvaluation'
import { adaptateurEvaluationDefinitionDerivee } from '../entrainement/5e-4h/generateurs5e/definitionDerivee/exportEvaluation'
import { adaptateurEvaluationFonctionDerivee } from '../entrainement/5e-4h/generateurs5e/fonctionDerivee/exportEvaluation'
import { adaptateurEvaluationTangentes } from '../entrainement/5e-4h/generateurs5e/tangentes/exportEvaluation'
import { adaptateurEvaluationEtudeLocale } from '../entrainement/5e-4h/generateurs5e/etudeLocale/exportEvaluation'
import { adaptateurEvaluationLectureGraphiqueDerivees } from '../entrainement/5e-4h/generateurs5e/lectureGraphiqueDerivees/exportEvaluation'
import { adaptateurEvaluationEtudierFonction } from '../entrainement/5e-4h/generateurs5e/etudierFonction/exportEvaluation'
import { adaptateurEvaluationOptimisationGeometrique } from '../entrainement/5e-4h/generateurs5e/optimisationGeometrique/exportEvaluation'
import { adaptateurEvaluationContexteEconomique } from '../entrainement/5e-4h/generateurs5e/contexteEconomique/exportEvaluation'
import { adaptateurEvaluationExtremaBornes } from '../entrainement/5e-4h/generateurs5e/extremaBornes/exportEvaluation'
import { adaptateurEvaluationVitessePosition } from '../entrainement/5e-4h/generateurs5e/vitessePosition/exportEvaluation'

export const EVALUATION_ADAPTER_REGISTRY_5E: Record<string, AdaptateurFeuilleExercices<never>> = {
  '5gen1': adaptateurEvaluationDomaineDefinition as unknown as AdaptateurFeuilleExercices<never>,
  '5gen2': adaptateurEvaluationDecompositionFonction as unknown as AdaptateurFeuilleExercices<never>,
  '5gen3': adaptateurEvaluationComposerFonctions as unknown as AdaptateurFeuilleExercices<never>,
  '5gen4': adaptateurEvaluationComposeeGraphique as unknown as AdaptateurFeuilleExercices<never>,
  '5gen5': adaptateurEvaluationProblemesContexte as unknown as AdaptateurFeuilleExercices<never>,
  '5gen6': adaptateurEvaluationArcSecteur as unknown as AdaptateurFeuilleExercices<never>,
  '5gen7': adaptateurEvaluationPolygonesArcsSecteurs as unknown as AdaptateurFeuilleExercices<never>,
  '5gen8': adaptateurEvaluationParametresSinusoide as unknown as AdaptateurFeuilleExercices<never>,
  '5gen9': adaptateurEvaluationParametresSinusoideGraphique as unknown as AdaptateurFeuilleExercices<never>,
  '5gen10': adaptateurEvaluationEquationTrig as unknown as AdaptateurFeuilleExercices<never>,
  '5gen11': adaptateurEvaluationExtremumsSinusoide as unknown as AdaptateurFeuilleExercices<never>,
  '5gen12': adaptateurEvaluationGeometrieCercle as unknown as AdaptateurFeuilleExercices<never>,
  '5gen13': adaptateurEvaluationModelisationSinusoide as unknown as AdaptateurFeuilleExercices<never>,
  '5gen14': adaptateurEvaluationSuitesArithmetiques as unknown as AdaptateurFeuilleExercices<never>,
  '5gen15': adaptateurEvaluationSuitesGeometriques as unknown as AdaptateurFeuilleExercices<never>,
  '5gen16': adaptateurEvaluationConvergenceSuites as unknown as AdaptateurFeuilleExercices<never>,
  '5gen17': adaptateurEvaluationSuitesClassiques as unknown as AdaptateurFeuilleExercices<never>,
  '5gen18': adaptateurEvaluationComparaisonSuites as unknown as AdaptateurFeuilleExercices<never>,
  '5gen19': adaptateurEvaluationSuiteRecurrenteAffine as unknown as AdaptateurFeuilleExercices<never>,
  '5gen20': adaptateurEvaluationLimites as unknown as AdaptateurFeuilleExercices<never>,
  '5gen21': adaptateurEvaluationAsymptoteOblique as unknown as AdaptateurFeuilleExercices<never>,
  '5gen22': adaptateurEvaluationLectureGraphiqueLimites as unknown as AdaptateurFeuilleExercices<never>,
  '5gen23': adaptateurEvaluationLimitesContexte as unknown as AdaptateurFeuilleExercices<never>,
  '5gen24': adaptateurEvaluationEtudeComplete as unknown as AdaptateurFeuilleExercices<never>,
  '5gen25': adaptateurEvaluationAssociation as unknown as AdaptateurFeuilleExercices<never>,
  '5gen26': adaptateurEvaluationDefinitionDerivee as unknown as AdaptateurFeuilleExercices<never>,
  '5gen27': adaptateurEvaluationFonctionDerivee as unknown as AdaptateurFeuilleExercices<never>,
  '5gen28': adaptateurEvaluationTangentes as unknown as AdaptateurFeuilleExercices<never>,
  '5gen29': adaptateurEvaluationEtudeLocale as unknown as AdaptateurFeuilleExercices<never>,
  '5gen30': adaptateurEvaluationLectureGraphiqueDerivees as unknown as AdaptateurFeuilleExercices<never>,
  '5gen31': adaptateurEvaluationEtudierFonction as unknown as AdaptateurFeuilleExercices<never>,
  '5gen32': adaptateurEvaluationOptimisationGeometrique as unknown as AdaptateurFeuilleExercices<never>,
  '5gen33': adaptateurEvaluationContexteEconomique as unknown as AdaptateurFeuilleExercices<never>,
  '5gen34': adaptateurEvaluationExtremaBornes as unknown as AdaptateurFeuilleExercices<never>,
  '5gen35': adaptateurEvaluationVitessePosition as unknown as AdaptateurFeuilleExercices<never>,
}

import { adaptateurEvaluationDenombrementFondamental } from '../entrainement/6e-6h/generateurs6e/denombrementFondamental/exportEvaluation'
import { adaptateurEvaluationDenombrementCombine } from '../entrainement/6e-6h/generateurs6e/denombrementCombine/exportEvaluation'
import { adaptateurEvaluationBinomeNewton } from '../entrainement/6e-6h/generateurs6e/binomeNewton/exportEvaluation'
import { adaptateurEvaluationDenombrementCombinatoirePur } from '../entrainement/6e-6h/generateurs6e/denombrementCombinatoirePur/exportEvaluation'
import { adaptateurEvaluationProbabiliteHypergeometrique } from '../entrainement/6e-6h/generateurs6e/probabiliteHypergeometrique/exportEvaluation'
import { adaptateurEvaluationBinomialeSequenceOrdonnee } from '../entrainement/6e-6h/generateurs6e/binomialeSequenceOrdonnee/exportEvaluation'
import { adaptateurEvaluationInjectiviteFonctions } from '../entrainement/6e-6h/generateurs6e/injectiviteFonctions/exportEvaluation'
import { adaptateurEvaluationFonctionsCyclometriques } from '../entrainement/6e-6h/generateurs6e/fonctionsCyclometriques/exportEvaluation'
import { adaptateurEvaluationEquationsCyclometriques } from '../entrainement/6e-6h/generateurs6e/equationsCyclometriques/exportEvaluation'
import { adaptateurEvaluationDeriveesCyclometriques } from '../entrainement/6e-6h/generateurs6e/deriveesCyclometriques/exportEvaluation'
import { adaptateurEvaluationGraphiquesCyclometriques } from '../entrainement/6e-6h/generateurs6e/graphiquesCyclometriques/exportEvaluation'
import { adaptateurEvaluationLimitesExponentielles } from '../entrainement/6e-6h/generateurs6e/limitesExponentielles/exportEvaluation'
import { adaptateurEvaluationDomaineDeriveeExponentielles } from '../entrainement/6e-6h/generateurs6e/domaineDeriveeExponentielles/exportEvaluation'
import { adaptateurEvaluationGraphiquesDeriveeExponentielles } from '../entrainement/6e-6h/generateurs6e/graphiquesDeriveeExponentielles/exportEvaluation'
import { adaptateurEvaluationEquationsExponentielles } from '../entrainement/6e-6h/generateurs6e/equationsExponentielles/exportEvaluation'
import { adaptateurEvaluationInequationsExponentielles } from '../entrainement/6e-6h/generateurs6e/inequationsExponentielles/exportEvaluation'
import { adaptateurEvaluationEtudeFonctionExponentielle } from '../entrainement/6e-6h/generateurs6e/etudeFonctionExponentielle/exportEvaluation'
import { adaptateurEvaluationExponentiellesProblemes } from '../entrainement/6e-6h/generateurs6e/exponentiellesProblemes/exportEvaluation'
import { adaptateurEvaluationProprietesLogarithme } from '../entrainement/6e-6h/generateurs6e/proprietesLogarithme/exportEvaluation'
import { adaptateurEvaluationGraphiqueDeriveeLogarithme } from '../entrainement/6e-6h/generateurs6e/graphiqueDeriveeLogarithme/exportEvaluation'
import { adaptateurEvaluationDeterminerParametresLogarithme } from '../entrainement/6e-6h/generateurs6e/determinerParametresLogarithme/exportEvaluation'
import { adaptateurEvaluationHyperboliques } from '../entrainement/6e-6h/generateurs6e/hyperboliques/exportEvaluation'
import { adaptateurEvaluationEquationsExpLog } from '../entrainement/6e-6h/generateurs6e/equationsExpLog/exportEvaluation'
import { adaptateurEvaluationLimitesLogarithmiques } from '../entrainement/6e-6h/generateurs6e/limitesLogarithmiques/exportEvaluation'
import { adaptateurEvaluationLogarithmesProblemes } from '../entrainement/6e-6h/generateurs6e/logarithmesProblemes/exportEvaluation'
import { adaptateurEvaluationEtudeFonctionLogarithme } from '../entrainement/6e-6h/generateurs6e/etudeFonctionLogarithme/exportEvaluation'
import { adaptateurEvaluationInequationsLogarithmiques } from '../entrainement/6e-6h/generateurs6e/inequationsLogarithmiques/exportEvaluation'
import { adaptateurEvaluationDomaineDeriveeLogarithme } from '../entrainement/6e-6h/generateurs6e/domaineDeriveeLogarithme/exportEvaluation'
import { adaptateurEvaluationVariablesDiscretesEsperance } from '../entrainement/6e-6h/generateurs6e/variablesDiscretesEsperance/exportEvaluation'
import { adaptateurEvaluationLoiBinomiale } from '../entrainement/6e-6h/generateurs6e/loiBinomiale/exportEvaluation'
import { adaptateurEvaluationLoiNormale } from '../entrainement/6e-6h/generateurs6e/loiNormale/exportEvaluation'
import { adaptateurEvaluationExtensionsBinomialeNormaleBayes } from '../entrainement/6e-6h/generateurs6e/extensionsBinomialeNormaleBayes/exportEvaluation'
import { adaptateurEvaluationLoiPoisson } from '../entrainement/6e-6h/generateurs6e/loiPoisson/exportEvaluation'
import { adaptateurEvaluationCalculPrimitives } from '../entrainement/6e-6h/generateurs6e/calculPrimitives/exportEvaluation'
import { adaptateurEvaluationQuellePrimitive } from '../entrainement/6e-6h/generateurs6e/quellePrimitive/exportEvaluation'
import { adaptateurEvaluationIntegralesDefinies } from '../entrainement/6e-6h/generateurs6e/integralesDefinies/exportEvaluation'
import { adaptateurEvaluationCalculAires } from '../entrainement/6e-6h/generateurs6e/calculAires/exportEvaluation'
import { adaptateurEvaluationVolumesRevolution } from '../entrainement/6e-6h/generateurs6e/volumesRevolution/exportEvaluation'
import { adaptateurEvaluationLongueurArc } from '../entrainement/6e-6h/generateurs6e/longueurArc/exportEvaluation'
import { adaptateurEvaluationIntegralesProblemes } from '../entrainement/6e-6h/generateurs6e/integralesProblemes/exportEvaluation'
import { adaptateurEvaluationNombresComplexes } from '../entrainement/6e-6h/generateurs6e/nombresComplexes/exportEvaluation'
import { adaptateurEvaluationAffixesRacines } from '../entrainement/6e-6h/generateurs6e/affixesRacines/exportEvaluation'
import { adaptateurEvaluationEquationsComplexes } from '../entrainement/6e-6h/generateurs6e/equationsComplexes/exportEvaluation'
import { adaptateurEvaluationFormeTrigonometrique } from '../entrainement/6e-6h/generateurs6e/formeTrigonometrique/exportEvaluation'
import { adaptateurEvaluationFormuleMoivre } from '../entrainement/6e-6h/generateurs6e/formuleMoivre/exportEvaluation'
import { adaptateurEvaluationRacinesNiemes } from '../entrainement/6e-6h/generateurs6e/racinesNiemes/exportEvaluation'
import { adaptateurEvaluationTransformationsPlan } from '../entrainement/6e-6h/generateurs6e/transformationsPlan/exportEvaluation'
import { adaptateurEvaluationTrianglesComplexes } from '../entrainement/6e-6h/generateurs6e/trianglesComplexes/exportEvaluation'
import { adaptateurEvaluationComplexesAvances } from '../entrainement/6e-6h/generateurs6e/complexesAvances/exportEvaluation'
import { adaptateurEvaluationProbabilitesEnsembles } from '../entrainement/6e-6h/generateurs6e/probabilitesEnsembles/exportEvaluation'
import { adaptateurEvaluationTiragesArbres } from '../entrainement/6e-6h/generateurs6e/tiragesArbres/exportEvaluation'
import { adaptateurEvaluationIndependanceBayes } from '../entrainement/6e-6h/generateurs6e/independanceBayes/exportEvaluation'
import { adaptateurEvaluationProbabilitesProblemes } from '../entrainement/6e-6h/generateurs6e/probabilitesProblemes/exportEvaluation'
import { adaptateurEvaluationPointsDroitesRemarquablesTriangle } from '../entrainement/6e-6h/generateurs6e/pointsDroitesRemarquablesTriangle/exportEvaluation'
import { adaptateurEvaluationCercles } from '../entrainement/6e-6h/generateurs6e/cercles/exportEvaluation'
import { adaptateurEvaluationLieuxGeometriquesParametres } from '../entrainement/6e-6h/generateurs6e/lieuxGeometriquesParametres/exportEvaluation'
import { adaptateurEvaluationMethodeGeneratrices } from '../entrainement/6e-6h/generateurs6e/methodeGeneratrices/exportEvaluation'

/** 6e (6h) — chapitres « fonctions réciproques & cyclométriques » (`6gen1`-`6gen5`), « fonctions
 * exponentielles » (`6gen6`-`6gen12` — `6gen65`, le quiz vrai/faux de ce chapitre, n'a pas
 * d'adaptateur côté plateforme-maths, voir `evaluationLocal.ts`) et « fonctions logarithmes »
 * (`6gen13`-`6gen22`) — les 7 autres chapitres de 6e restent hors périmètre (générateurs pas
 * encore portés du tout, interactif compris). */
export const EVALUATION_ADAPTER_REGISTRY_6E: Record<string, AdaptateurFeuilleExercices<never>> = {
  '6gen1': adaptateurEvaluationInjectiviteFonctions as unknown as AdaptateurFeuilleExercices<never>,
  '6gen2': adaptateurEvaluationFonctionsCyclometriques as unknown as AdaptateurFeuilleExercices<never>,
  '6gen3': adaptateurEvaluationEquationsCyclometriques as unknown as AdaptateurFeuilleExercices<never>,
  '6gen4': adaptateurEvaluationDeriveesCyclometriques as unknown as AdaptateurFeuilleExercices<never>,
  '6gen5': adaptateurEvaluationGraphiquesCyclometriques as unknown as AdaptateurFeuilleExercices<never>,
  '6gen6': adaptateurEvaluationLimitesExponentielles as unknown as AdaptateurFeuilleExercices<never>,
  '6gen7': adaptateurEvaluationDomaineDeriveeExponentielles as unknown as AdaptateurFeuilleExercices<never>,
  '6gen8': adaptateurEvaluationGraphiquesDeriveeExponentielles as unknown as AdaptateurFeuilleExercices<never>,
  '6gen9': adaptateurEvaluationEquationsExponentielles as unknown as AdaptateurFeuilleExercices<never>,
  '6gen10': adaptateurEvaluationInequationsExponentielles as unknown as AdaptateurFeuilleExercices<never>,
  '6gen11': adaptateurEvaluationEtudeFonctionExponentielle as unknown as AdaptateurFeuilleExercices<never>,
  '6gen12': adaptateurEvaluationExponentiellesProblemes as unknown as AdaptateurFeuilleExercices<never>,
  '6gen13': adaptateurEvaluationProprietesLogarithme as unknown as AdaptateurFeuilleExercices<never>,
  '6gen20': adaptateurEvaluationGraphiqueDeriveeLogarithme as unknown as AdaptateurFeuilleExercices<never>,
  '6gen18': adaptateurEvaluationDeterminerParametresLogarithme as unknown as AdaptateurFeuilleExercices<never>,
  '6gen19': adaptateurEvaluationHyperboliques as unknown as AdaptateurFeuilleExercices<never>,
  '6gen14': adaptateurEvaluationEquationsExpLog as unknown as AdaptateurFeuilleExercices<never>,
  '6gen17': adaptateurEvaluationLimitesLogarithmiques as unknown as AdaptateurFeuilleExercices<never>,
  '6gen22': adaptateurEvaluationLogarithmesProblemes as unknown as AdaptateurFeuilleExercices<never>,
  '6gen21': adaptateurEvaluationEtudeFonctionLogarithme as unknown as AdaptateurFeuilleExercices<never>,
  '6gen15': adaptateurEvaluationInequationsLogarithmiques as unknown as AdaptateurFeuilleExercices<never>,
  '6gen16': adaptateurEvaluationDomaineDeriveeLogarithme as unknown as AdaptateurFeuilleExercices<never>,
  '6gen43': adaptateurEvaluationDenombrementFondamental as unknown as AdaptateurFeuilleExercices<never>,
  '6gen44': adaptateurEvaluationDenombrementCombine as unknown as AdaptateurFeuilleExercices<never>,
  '6gen45': adaptateurEvaluationBinomeNewton as unknown as AdaptateurFeuilleExercices<never>,
  '6gen46': adaptateurEvaluationDenombrementCombinatoirePur as unknown as AdaptateurFeuilleExercices<never>,
  '6gen47': adaptateurEvaluationProbabiliteHypergeometrique as unknown as AdaptateurFeuilleExercices<never>,
  '6gen48': adaptateurEvaluationBinomialeSequenceOrdonnee as unknown as AdaptateurFeuilleExercices<never>,
  '6gen49': adaptateurEvaluationVariablesDiscretesEsperance as unknown as AdaptateurFeuilleExercices<never>,
  '6gen50': adaptateurEvaluationLoiBinomiale as unknown as AdaptateurFeuilleExercices<never>,
  '6gen51': adaptateurEvaluationLoiNormale as unknown as AdaptateurFeuilleExercices<never>,
  '6gen52': adaptateurEvaluationExtensionsBinomialeNormaleBayes as unknown as AdaptateurFeuilleExercices<never>,
  '6gen53': adaptateurEvaluationLoiPoisson as unknown as AdaptateurFeuilleExercices<never>,
  '6gen23': adaptateurEvaluationCalculPrimitives as unknown as AdaptateurFeuilleExercices<never>,
  '6gen24': adaptateurEvaluationQuellePrimitive as unknown as AdaptateurFeuilleExercices<never>,
  '6gen25': adaptateurEvaluationIntegralesDefinies as unknown as AdaptateurFeuilleExercices<never>,
  '6gen26': adaptateurEvaluationCalculAires as unknown as AdaptateurFeuilleExercices<never>,
  '6gen27': adaptateurEvaluationVolumesRevolution as unknown as AdaptateurFeuilleExercices<never>,
  '6gen28': adaptateurEvaluationLongueurArc as unknown as AdaptateurFeuilleExercices<never>,
  '6gen29': adaptateurEvaluationIntegralesProblemes as unknown as AdaptateurFeuilleExercices<never>,
  '6gen34': adaptateurEvaluationNombresComplexes as unknown as AdaptateurFeuilleExercices<never>,
  '6gen35': adaptateurEvaluationAffixesRacines as unknown as AdaptateurFeuilleExercices<never>,
  '6gen36': adaptateurEvaluationEquationsComplexes as unknown as AdaptateurFeuilleExercices<never>,
  '6gen37': adaptateurEvaluationFormeTrigonometrique as unknown as AdaptateurFeuilleExercices<never>,
  '6gen38': adaptateurEvaluationFormuleMoivre as unknown as AdaptateurFeuilleExercices<never>,
  '6gen39': adaptateurEvaluationRacinesNiemes as unknown as AdaptateurFeuilleExercices<never>,
  '6gen40': adaptateurEvaluationTransformationsPlan as unknown as AdaptateurFeuilleExercices<never>,
  '6gen41': adaptateurEvaluationTrianglesComplexes as unknown as AdaptateurFeuilleExercices<never>,
  '6gen42': adaptateurEvaluationComplexesAvances as unknown as AdaptateurFeuilleExercices<never>,
  '6gen30': adaptateurEvaluationProbabilitesEnsembles as unknown as AdaptateurFeuilleExercices<never>,
  '6gen31': adaptateurEvaluationTiragesArbres as unknown as AdaptateurFeuilleExercices<never>,
  '6gen32': adaptateurEvaluationIndependanceBayes as unknown as AdaptateurFeuilleExercices<never>,
  '6gen33': adaptateurEvaluationProbabilitesProblemes as unknown as AdaptateurFeuilleExercices<never>,
  '6gen54': adaptateurEvaluationPointsDroitesRemarquablesTriangle as unknown as AdaptateurFeuilleExercices<never>,
  '6gen55': adaptateurEvaluationCercles as unknown as AdaptateurFeuilleExercices<never>,
  '6gen56': adaptateurEvaluationLieuxGeometriquesParametres as unknown as AdaptateurFeuilleExercices<never>,
  '6gen57': adaptateurEvaluationMethodeGeneratrices as unknown as AdaptateurFeuilleExercices<never>,
}

/** Lookup unique par `generatorId`, tous chantiers portés confondus — `evaluationLocal.ts` n'a pas
 * à savoir quel chantier a produit quel générateur. */
export const EVALUATION_ADAPTER_REGISTRY: Record<string, AdaptateurFeuilleExercices<never>> = {
  ...EVALUATION_ADAPTER_REGISTRY_4E,
  ...EVALUATION_ADAPTER_REGISTRY_5E,
  ...EVALUATION_ADAPTER_REGISTRY_6E,
}
