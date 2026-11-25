import type { ExerciceProbabiliteHypergeometrique } from "../../core6e/probabiliteHypergeometrique.types";
import type { AdaptateurFeuilleExercices, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { FORMAT_6GEN47 } from "../../ui6e/formatProbabiliteHypergeometrique";
import { correctionPapierCombinatoire, enoncePapierCombinatoire } from "../adaptateurCombinatoire";
import { phasesPourExercice } from "../../moteur6e/typesProbabiliteHypergeometrique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProbabiliteHypergeometrique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceProbabiliteHypergeometrique>` pour `6gen47`
 * (Probabilité hypergéométrique) — NOUVEAU, même principe que `denombrementFondamental/
 * exportEvaluation.ts` (6gen43).
 */

/** Profil (tirage équilibré) de 6gen47.
 * Calculatrice des élèves de 6e (6h) : Casio Graph Math+ (lois binomiale, normale, de Poisson et
 * hypergéométrique intégrées, `BinomialPD`/`BinomialCD`, `NormCD`/`InvNormCD`, `HypergeoPD`…). Règle validée
 * (revue des profils, 24/11/2026) : `calcul: 'exacte'` SEULEMENT si la calculatrice donne directement la
 * réponse demandée — la variante n'est alors jamais tirée « calculatrice autorisée ». Aucun cas particulier
 * ni `forme`.
 * - A (aucun / tous / exactement k succès) : N, K, n et k sont DONNÉS dans l'énoncé ; « à l'aide de la formule
 *   hypergéométrique » : `HypergeoPD(k, n, K, N)` donne la probabilité directement → `exacte`.
 * - B (ordre contre composition) et C (loto + bonus, combinaison des deux catégories) : il reste un
 *   raisonnement (produit de fractions et nombre d'ordres ; indépendance → produit) → pas de `calcul`. */
export function profilProbabiliteHypergeometrique(exercice: ExerciceProbabiliteHypergeometrique): ProfilInstance {
  return exercice.famille === "A" ? { casParticulier: null, calcul: "exacte" } : { casParticulier: null };
}

export const adaptateurEvaluationProbabiliteHypergeometrique: AdaptateurFeuilleExercices<ExerciceProbabiliteHypergeometrique> = {
  titreDocument: "Probabilité hypergéométrique — Évaluation",
  nomFichierBase: "probabilite-hypergeometrique",
  genererInstance: genererExerciceProbabiliteHypergeometrique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: enoncePapierCombinatoire(FORMAT_6GEN47, phasesPourExercice),
  construireCorrection: correctionPapierCombinatoire(FORMAT_6GEN47, phasesPourExercice),
  profilInstance: profilProbabiliteHypergeometrique,
};
