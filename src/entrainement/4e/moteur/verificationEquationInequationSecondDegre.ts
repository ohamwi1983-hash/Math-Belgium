/**
 * Couche B — vérification pour "Équations/inéquations du second degré en contexte" (position 57).
 * Ce module ne porte plus que les écrans "poserEquationInequation"/"resoudre"/"validation"/
 * "interpretation", les 4 seuls restants depuis la refonte (voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête) — toutes les fonctions liées au système à
 * 2 inconnues (`diagnostiquerSystemeReel`/`diagnostiquerSystemeHypothetique`/
 * `diagnostiquerEliminationSysteme`, ancienne famille `achatGroupe`) ont disparu avec lui.
 */
import type { CoefficientsQuadratiques, ExerciceEquationInequationSecondDegre, IntervalleBorne } from "../core/equationInequationSecondDegre.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import type { StatutVerification } from "./statutVerification";

function evaluerQuadratiqueLocal(fonction: CoefficientsQuadratiques, x: number): number {
  return fonction.a * x * x + fonction.b * x + fonction.c;
}

const POINTS_ECHANTILLON = [-3, -2, -1, 1, 2, 3, 4, 5, 7];
const TOLERANCE_EQUATION = 1e-4;
const TOLERANCE = 0.005;

// ============================================================================
// Écran "poserEquationInequation".
// ============================================================================

/** Le symbole réellement présent dans le texte peut différer du symbole ATTENDU (piège explicite
 * de la spec : "sens de l'inégalité mal déduit") — les deux sont donc détectés indépendamment :
 * `symboleTrouve` pilote le découpage gauche/droite (jamais `parse_error` pour un symbole
 * simplement erroné, tant qu'il est interprétable), `symboleAttendu` n'intervient qu'à la toute
 * fin pour distinguer `"correct"` de `"not_equivalent"`. */
export function diagnostiquerPoserEquationInequation(exercice: ExerciceEquationInequationSecondDegre, texte: string): StatutVerification {
  const symboleAttendu = exercice.variante === "equation" ? "=" : exercice.sens === "gt" ? ">" : "<";
  const symboleTrouve = texte.includes("=") ? "=" : texte.includes(">") ? ">" : texte.includes("<") ? "<" : null;
  if (symboleTrouve === null) return "parse_error";
  const cotes = texte.split(symboleTrouve);
  if (cotes.length !== 2) return "parse_error";
  const [gauche, droite] = cotes;

  try {
    for (const x of POINTS_ECHANTILLON) {
      const g = evaluerExpressionGenerale(gauche, x);
      const d = evaluerExpressionGenerale(droite, x);
      if (!Number.isFinite(g) || !Number.isFinite(d)) return "parse_error";
      if (Math.abs(g - evaluerQuadratiqueLocal(exercice.base.fonction, x)) > TOLERANCE_EQUATION) return "not_equivalent";
      if (Math.abs(d - exercice.k) > TOLERANCE_EQUATION) return "not_equivalent";
    }
  } catch {
    return "parse_error";
  }
  return symboleTrouve === symboleAttendu ? "correct" : "not_equivalent";
}

export function verifierPoserEquationInequation(exercice: ExerciceEquationInequationSecondDegre, texte: string): boolean {
  return diagnostiquerPoserEquationInequation(exercice, texte) === "correct";
}

// ============================================================================
// Écran "resoudre" — 2 valeurs (racines mathématiques ou bornes brutes), ordre indifférent.
// ============================================================================

function ciblesResoudre(exercice: ExerciceEquationInequationSecondDegre): [number, number] {
  return exercice.variante === "equation" ? exercice.racinesCandidates : [exercice.intervalleBrut.inf, exercice.intervalleBrut.sup];
}

export function diagnostiquerResoudre(exercice: ExerciceEquationInequationSecondDegre, valeurs: string[]): StatutVerification {
  if (valeurs.length !== 2) return "parse_error";
  const parsees = valeurs.map((v) => parserNombreOuFraction(v));
  if (parsees.some((v) => v === null)) return "parse_error";

  const cibles = [...ciblesResoudre(exercice)].sort((a, b) => a - b);
  const reponses = [...(parsees as number[])].sort((a, b) => a - b);
  const correct = reponses.every((v, i) => Math.abs(v - cibles[i]) <= TOLERANCE);
  return correct ? "correct" : "not_equivalent";
}

export function verifierResoudre(exercice: ExerciceEquationInequationSecondDegre, valeurs: string[]): boolean {
  return diagnostiquerResoudre(exercice, valeurs) === "correct";
}

// ============================================================================
// Écran "validation" — classification (equation) ou bornes finales (inequation).
// ============================================================================

/** `reponses` dans l'ORDRE de `exercice.racinesCandidates` (déjà triées croissant). */
export function verifierValidationEquation(exercice: ExerciceEquationInequationSecondDegre, reponses: boolean[]): boolean {
  if (exercice.variante !== "equation") return false;
  if (reponses.length !== exercice.racinesCandidates.length) return false;
  const cibles = exercice.racinesCandidates.map((r) => exercice.racinesValides.includes(r));
  return reponses.every((r, i) => r === cibles[i]);
}

export interface ReponseIntervalle {
  inf: string;
  sup: string;
}

function statutBorne(texte: string, cible: number): StatutVerification {
  const valeur = parserNombreOuFraction(texte);
  if (valeur === null) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

export function diagnostiquerValidationInequation(exercice: ExerciceEquationInequationSecondDegre, reponse: ReponseIntervalle): { inf: StatutVerification; sup: StatutVerification } {
  const cible: IntervalleBorne = exercice.variante === "inequation" ? exercice.intervalleValide : { inf: NaN, sup: NaN };
  return { inf: statutBorne(reponse.inf, cible.inf), sup: statutBorne(reponse.sup, cible.sup) };
}

export function verifierValidationInequation(exercice: ExerciceEquationInequationSecondDegre, reponse: ReponseIntervalle): boolean {
  const statut = diagnostiquerValidationInequation(exercice, reponse);
  return statut.inf === "correct" && statut.sup === "correct";
}

// ============================================================================
// Écran "interpretation" (QCM) — vérification par sélection.
// ============================================================================

export function verifierInterpretation(exercice: ExerciceEquationInequationSecondDegre, indexChoisi: number | null): boolean {
  if (indexChoisi === null) return false;
  return exercice.optionsInterpretation[indexChoisi]?.correcte === true;
}
