/**
 * Couche B — vérification pour "Comparaison visuelle de vecteurs sur figure" (chapitre "Calcul
 * vectoriel", deuxième générateur). L'étape "égalité" réutilise `parserCombinaisonVecteurs`
 * (`expressionVectorielle.ts`, module frère) restreint à un seul nom valide (`labelReference`),
 * exactement le motif attendu pour une égalité à un seul vecteur (ex. `c = 2h`).
 */
import type { ExerciceComparaisonVecteurs } from "../core/comparaisonVecteurs.types";
import { parserCombinaisonVecteurs } from "./expressionVectorielle";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 1e-6;

/** Étape "sélection" — comparaison en multi-ensemble, jamais sensible à l'ordre ; aucun risque de
 * parse_error (sélection sur la figure, pas une saisie libre). */
export function verifierSelection(exercice: ExerciceComparaisonVecteurs, labelsSelectionnes: string[]): boolean {
  const attendus = [...new Set(exercice.labelsCorrects)].sort();
  const soumis = [...new Set(labelsSelectionnes)].sort();
  return attendus.length === soumis.length && attendus.every((l, i) => l === soumis[i]);
}

/** Étape "égalité" — `cible = k*référence` (ex. `c = 2h`) : le membre gauche doit être exactement
 * `cibleEgalite`, le membre droit un terme unique en `labelReference`. */
export function diagnostiquerEgalite(exercice: ExerciceComparaisonVecteurs, texte: string): StatutVerification {
  const parties = texte.split("=");
  if (parties.length !== 2) return "not_equivalent";

  const gauche = parties[0].trim().toLowerCase();
  if (gauche !== exercice.cibleEgalite.toLowerCase()) return "not_equivalent";

  const parsed = parserCombinaisonVecteurs(parties[1], [exercice.labelReference]);
  if (parsed === null) return "parse_error";

  const coefficient = parsed[exercice.labelReference];
  return Math.abs(coefficient - exercice.coefficientEgalite) < TOLERANCE ? "correct" : "not_equivalent";
}

export function verifierEgalite(exercice: ExerciceComparaisonVecteurs, texte: string): boolean {
  return diagnostiquerEgalite(exercice, texte) === "correct";
}
