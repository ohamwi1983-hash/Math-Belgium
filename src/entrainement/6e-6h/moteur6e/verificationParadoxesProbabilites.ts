import type { ExerciceParadoxesProbabilites } from "../core6e/paradoxesProbabilites.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseParadoxe } from "./typesParadoxesProbabilites";
import { diagnostiquerProbabilite } from "./verificationProbabilites";

/**
 * Couche B (6e) — vérification de `6gen76`. Toute réponse numérique passe par
 * `diagnostiquerProbabilite` (audit 6e ch. 6, décision A) : écriture exacte (fraction, puissance,
 * « 1 − (5/6)^4 »…), décimal arrondi correctement au MILLIÈME au moins (annoncé à l'écran) ou
 * pourcentage. Le millième est imposé partout : au centième, 1 − (35/36)²⁵ ≈ 0,51 et
 * 1 − (5/6)⁴ ≈ 0,52 se départagent encore, mais la consigne reste la même pour les trois familles.
 */

export const DECIMALES_MIN = 3;

/** Valeurs EXACTES attendues, champ par champ (écrans `modeliser` et `calculer`). Source unique :
 * l'écran, le récapitulatif, le corrigé et le barème en dérivent. */
export function valeursAttendues(e: ExerciceParadoxesProbabilites, phase: "modeliser" | "calculer"): number[] {
  switch (e.famille) {
    case "mere": {
      const contraire1 = Math.pow(5 / 6, 4);
      const contraire2 = Math.pow(35 / 36, e.kLancersDouble);
      return phase === "modeliser" ? [contraire1, contraire2] : [1 - contraire1, 1 - contraire2];
    }
    case "montyHall": {
      const n = e.nPortes;
      return phase === "modeliser" ? [1 / n, 1 / (n - 2)] : [1 / n, (n - 1) / (n * (n - 2))];
    }
    case "deuxEnfants": {
      const compatibles = e.information === "auMoinsUn" ? 3 : 2;
      return phase === "modeliser" ? [compatibles, 1] : [1 / compatibles];
    }
  }
}

/** Identifiant de l'option correcte de la conclusion : toujours l'option canonique 0 (affichée à
 * la place `ordreConclusion.indexOf(0)`). */
export const ID_CONCLUSION_CORRECTE = "0";

/** Statut champ par champ (`[statut]` pour un écran à choix). La prédiction n'est jamais fausse. */
export function diagnostiquerChamps(e: ExerciceParadoxesProbabilites, phase: PhaseParadoxe, valeurs: string[]): StatutVerification[] {
  if (phase === "prediction") return ["correct"];
  if (phase === "conclure") return [valeurs[0] === ID_CONCLUSION_CORRECTE ? "correct" : "not_equivalent"];
  const cibles = valeursAttendues(e, phase);
  return cibles.map((cible, i) => diagnostiquerProbabilite(valeurs[i] ?? "", cible, DECIMALES_MIN));
}

/** Statut global : `parse_error` prioritaire (message de syntaxe), puis `not_equivalent`. */
export function diagnostiquerEcran(e: ExerciceParadoxesProbabilites, phase: PhaseParadoxe, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceParadoxesProbabilites, phase: PhaseParadoxe, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}
