/**
 * Couche B — vérification pour "Équation d'une parabole depuis un graphe".
 *
 * Écran 1 : S et F, 4 champs numériques indépendants, statut à 3 valeurs classique (égalité
 * exacte — S et F sont toujours entiers par construction, voir `equationParabole.types.ts`).
 *
 * Écran 2 : équation, texte libre, vérifiée par équivalence algébrique à 2 variables —
 * `diagnostiquerEquivalenceQuadratiqueXY` réutilisé **directement** (`verificationEquationCercle.ts`,
 * moteur→moteur, déjà validé pour les générateurs "cercle", jamais redéveloppé) : cible
 * `(x-x_S)²-2p(y-y_S)` (axe vertical) ou `(y-y_S)²-2p(x-x_S)` (axe horizontal), sondage centré sur
 * le sommet RÉEL de l'exercice.
 */
import type { ExerciceEquationParabole } from "../core/equationParabole.types";
import type { StatutVerification } from "./statutVerification";
import { diagnostiquerEquivalenceQuadratiqueXY } from "./verificationEquationCercle";

const TOLERANCE = 0.01;

function statutNumeriqueSimple(valeur: number, cible: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

function combinerStatutsSimple(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export interface ReponseSommetFoyer {
  sx: number;
  sy: number;
  fx: number;
  fy: number;
}

export function diagnostiquerSommetFoyer(exercice: ExerciceEquationParabole, reponse: ReponseSommetFoyer): StatutVerification {
  return combinerStatutsSimple(
    statutNumeriqueSimple(reponse.sx, exercice.sommet.x),
    statutNumeriqueSimple(reponse.sy, exercice.sommet.y),
    statutNumeriqueSimple(reponse.fx, exercice.foyer.x),
    statutNumeriqueSimple(reponse.fy, exercice.foyer.y),
  );
}

export function verifierSommetFoyer(exercice: ExerciceEquationParabole, reponse: ReponseSommetFoyer): boolean {
  return diagnostiquerSommetFoyer(exercice, reponse) === "correct";
}

/** `(x-x_S)²-2p(y-y_S)` (vertical) ou `(y-y_S)²-2p(x-x_S)` (horizontal) — la seule référence de
 * vérité, jamais recalculée différemment ailleurs. */
function cibleParabole(x: number, y: number, exercice: ExerciceEquationParabole): number {
  const { sommet, p } = exercice;
  return exercice.variante === "vertical"
    ? (x - sommet.x) * (x - sommet.x) - 2 * p * (y - sommet.y)
    : (y - sommet.y) * (y - sommet.y) - 2 * p * (x - sommet.x);
}

export function diagnostiquerEquation(exercice: ExerciceEquationParabole, texte: string): StatutVerification {
  return diagnostiquerEquivalenceQuadratiqueXY(texte, exercice.sommet.x, exercice.sommet.y, (x, y) => cibleParabole(x, y, exercice));
}

export function verifierEquation(exercice: ExerciceEquationParabole, texte: string): boolean {
  return diagnostiquerEquation(exercice, texte) === "correct";
}
