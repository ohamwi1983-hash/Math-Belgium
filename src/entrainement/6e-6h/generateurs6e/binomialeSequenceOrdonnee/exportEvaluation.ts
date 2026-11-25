import type { ExerciceBinomialeSequenceOrdonnee } from "../../core6e/binomialeSequenceOrdonnee.types";
import type { AdaptateurFeuilleExercices, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { FORMAT_6GEN48 } from "../../ui6e/formatBinomialeSequenceOrdonnee";
import { correctionPapierCombinatoire, enoncePapierCombinatoire } from "../adaptateurCombinatoire";
import { phasesPourExercice } from "../../moteur6e/typesBinomialeSequenceOrdonnee";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBinomialeSequenceOrdonnee } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceBinomialeSequenceOrdonnee>` pour `6gen48`
 * (Probabilité binomiale et séquence exacte) — NOUVEAU, même principe que
 * `denombrementFondamental/exportEvaluation.ts` (6gen43).
 */

/** Profil (tirage équilibré) de 6gen48.
 * Calculatrice des élèves de 6e (6h) : Casio Graph Math+ (lois binomiale, normale, de Poisson et
 * hypergéométrique intégrées, `BinomialPD`/`BinomialCD`, `NormCD`/`InvNormCD`, `HypergeoPD`…). Règle validée
 * (revue des profils, 24/11/2026) : `calcul: 'exacte'` SEULEMENT si la calculatrice donne directement la
 * réponse demandée — la variante n'est alors jamais tirée « calculatrice autorisée ». Aucun cas particulier
 * ni `forme`.
 * - A « exactement k », « aucun », « tous » : n, p et k sont donnés, la stratégie est un terme unique
 *   (rien à décider) et `BinomialPD(k, n, p)` donne la probabilité → `exacte`.
 * - A « au moins » / « au plus » : choisir entre somme et complément est le travail évalué → pas de `calcul`.
 * - B (séquence exacte sans remise) : poser le produit des fractions → pas de `calcul`. */
export function profilBinomialeSequenceOrdonnee(exercice: ExerciceBinomialeSequenceOrdonnee): ProfilInstance {
  return exercice.famille === "A" && (exercice.typeQuestion === "exactement" || exercice.typeQuestion === "aucun" || exercice.typeQuestion === "tous")
    ? { casParticulier: null, calcul: "exacte" }
    : { casParticulier: null };
}

export const adaptateurEvaluationBinomialeSequenceOrdonnee: AdaptateurFeuilleExercices<ExerciceBinomialeSequenceOrdonnee> = {
  titreDocument: "Probabilité binomiale et séquence exacte — Évaluation",
  nomFichierBase: "binomiale-sequence-ordonnee",
  genererInstance: genererExerciceBinomialeSequenceOrdonnee,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: enoncePapierCombinatoire(FORMAT_6GEN48, phasesPourExercice),
  construireCorrection: correctionPapierCombinatoire(FORMAT_6GEN48, phasesPourExercice),
  profilInstance: profilBinomialeSequenceOrdonnee,
};
