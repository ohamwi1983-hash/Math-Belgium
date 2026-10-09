import type { AdaptateurFeuilleExercices } from '../entrainement/export/genererFeuilleExercices'

/**
 * Registre des adaptateurs `AdaptateurFeuilleExercices<T>` déjà portés dans Math-Belgium (voir
 * `.claude/rules` — chaque fichier `generateurs/{nom}/exportEvaluation.ts` transforme UNE instance
 * tirée en énoncé/corrigé rédigés pour le document imprimable). SEULE source de vérité pour "quel
 * générateur peut générer une évaluation/feuille d'exercices 100% localement, sans passer par
 * plateforme-maths" — `evaluationLocal.ts` la consulte avant de décider local vs redirection.
 *
 * Miroir manuel de `AppEvaluation4e.tsx::ADAPTATEURS` côté plateforme-maths, limité pour l'instant
 * au 4e (chapitres 1 à 8, 55 générateurs — voir ce fichier pour le détail des sections couvertes/
 * exclues). `as unknown as AdaptateurFeuilleExercices<never>` : chaque adaptateur a son propre
 * paramètre de type T (une instance de SON générateur), jamais unifiable dans un seul `Record` sans
 * passer par un type existentiel — même compromis déjà accepté côté plateforme-maths.
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
