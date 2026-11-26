// Copie 5e (6h) de `5e-4h/generateurs5e/modeliserSuite/profilEvaluation.ts` (56gen9 ← 5gen47, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceModeliserSuite } from "./core/modeliserSuite";

/**
 * Profil de tirage équilibré de `5gen47` « Modéliser une situation par une suite »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - Aucun cas particulier : chaque instance a ses cinq étapes (nature, u₁, raison, rang/N/tableau,
 *   réponse). La NATURE (arithmétique / géométrique) est le verdict de l'écran a) : jamais un cas
 *   particulier, jamais dans `forme`, tirée 50/50 dans chaque série.
 * - `forme` = signature de difficulté reproduite d'une série à l'autre : `{question}:{départ}` —
 *   question finale (terme / somme / seuil, c'est aussi la variante) et convention de départ
 *   (`rang1` : valeur de l'année de rang 1 donnée ; `avant` : valeur de l'année précédente, u₁ à
 *   calculer). Forme la plus rare : `…:avant`, 40 % de sa variante (mesuré, voir le rapport).
 * - `calcul` : `exacte` (valeurs rondes, raisons 2, 1,5, 1,25, 0,75, 0,5) ou `calculatrice`
 *   (pourcentages quelconques, données décimales ou non rondes). Le mode est tiré INDÉPENDAMMENT de
 *   la nature : « calculatrice interdite » comme « autorisée » gardent les deux natures (sinon la
 *   contrainte de calcul trahirait le verdict).
 */
export function profilModeliserSuite(e: ExerciceModeliserSuite): ProfilInstance {
  return { casParticulier: null, forme: `${e.variante}:${e.depart}`, calcul: e.mode === "exact" ? "exacte" : "calculatrice" };
}
