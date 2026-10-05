import type { ExerciceCercleTrigonometrique, Quadrant, ReponseSignes } from "../core/cercleTrigonometrique.types";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 1e-9;

/** Vrai ssi l'écran "réduction" doit apparaître dans la séquence de cet exercice. */
export function necessiteReduction(exercice: ExerciceCercleTrigonometrique): boolean {
  return exercice.angleDepart !== exercice.angleReduit;
}

/**
 * Statut à 3 valeurs (convention CLAUDE.md) : `valeur` est déjà convertie en nombre côté composant
 * (même principe que `diagnostiquerCoefficients`, "Analyse d'une fonction") — un texte non
 * numérique y arrive donc comme NaN, seul signal d'échec de parsing pour ce champ purement
 * numérique.
 */
export function diagnostiquerReduction(exercice: ExerciceCercleTrigonometrique, valeur: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - exercice.angleReduit) <= TOLERANCE ? "correct" : "not_equivalent";
}

export function verifierReduction(exercice: ExerciceCercleTrigonometrique, valeur: number): boolean {
  return diagnostiquerReduction(exercice, valeur) === "correct";
}

/** Sélection sur le cercle interactif, jamais de saisie libre : pas de statut à 3 valeurs, comparaison directe. */
export function verifierQuadrant(exercice: ExerciceCercleTrigonometrique, quadrant: Quadrant): boolean {
  return quadrant === exercice.quadrant;
}

export function diagnostiquerAnglePremierQuadrant(exercice: ExerciceCercleTrigonometrique, valeur: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - exercice.anglePremierQuadrant) <= TOLERANCE ? "correct" : "not_equivalent";
}

export function verifierAnglePremierQuadrant(exercice: ExerciceCercleTrigonometrique, valeur: number): boolean {
  return diagnostiquerAnglePremierQuadrant(exercice, valeur) === "correct";
}

/**
 * Détail champ par champ (marquage rouge en direct après un échec, même principe que
 * `evaluerCurseurs` de "Transformations graphiques") — jamais utilisé pour la note elle-même,
 * qui reste `verifierSignes` (tout ou rien, un seul essai global comme la grille de l'exercice 5).
 */
export function evaluerSignes(exercice: ExerciceCercleTrigonometrique, reponse: ReponseSignes): { sin: boolean; cos: boolean; tan: boolean } {
  return {
    sin: reponse.sin === exercice.signeSin,
    cos: reponse.cos === exercice.signeCos,
    tan: reponse.tan === exercice.signeTan,
  };
}

export function verifierSignes(exercice: ExerciceCercleTrigonometrique, reponse: ReponseSignes): boolean {
  const evaluation = evaluerSignes(exercice, reponse);
  return evaluation.sin && evaluation.cos && evaluation.tan;
}
