/**
 * Couche B — vérification pour "Équations/inéquations du second degré en contexte" (position 57).
 * Écrans 1-4 (identification/contrainteEtGrandeur/systeme/domaine) : réutilisent DIRECTEMENT
 * `verifierIdentification`/`verifierContrainteEtGrandeur`/`verifierSysteme`/`verifierDomaine`
 * (`moteur/verificationOptimisation.ts`, moteur→moteur explicitement autorisé) sur `exercice.base`
 * — voir CLAUDE.md pour la justification complète de cette réutilisation directe. Ce module ne
 * porte donc que les écrans 0a/0b (`voieSysteme`) et 5-8, propres à ce générateur.
 * `evaluerQuadratiqueLocal` est une PETITE fonction dupliquée depuis
 * `generateurs/optimisation/optimum.ts::evaluerQuadratique` (déjà dupliquée à l'identique dans
 * `verificationOptimisation.ts` — même principe, `src/moteur/` n'importe jamais `src/generateurs/`).
 */
import type { CoefficientsQuadratiques } from "../core/optimisation.types";
import type { ExerciceEquationInequationSecondDegre, IntervalleBorne } from "../core/equationInequationSecondDegre.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import { diagnostiquerEquivalenceQuadratiqueXY } from "./verificationEquationCercle";
import type { StatutVerification } from "./statutVerification";

function evaluerQuadratiqueLocal(fonction: CoefficientsQuadratiques, x: number): number {
  return fonction.a * x * x + fonction.b * x + fonction.c;
}

const POINTS_ECHANTILLON = [-3, -2, -1, 1, 2, 3, 4, 5, 7];
const TOLERANCE_EQUATION = 1e-4;
const TOLERANCE = 0.005;

// ============================================================================
// Écrans "poserSysteme"/"eliminerSysteme" — `voieSysteme` uniquement (famille `achatGroupe`).
// Réutilisent DIRECTEMENT `diagnostiquerEquivalenceQuadratiqueXY` (`verificationEquationCercle.ts`,
// moteur→moteur, déjà exportée et généralisée à "une cible quadratique à 2 variables quelconque" —
// voir CLAUDE.md, "Création — cinquante-septième exercice"). L'ancrage `(x0,y0)` de vérification est
// TOUJOURS le point (prix réel, quantité réelle) — l'unique racine valide et la quantité qui lui
// correspond via la contrainte isolée — qui satisfait par construction les 3 équations (réelle,
// hypothétique, éliminée), voir `generateurs/equationInequationSecondDegre/familles/achatGroupe.ts`.
// ============================================================================

function ancrageSysteme(exercice: Extract<ExerciceEquationInequationSecondDegre, { variante: "equation" }>): { x0: number; y0: number } {
  const x0 = exercice.racinesValides[0]!;
  // `voieSysteme` (achatGroupe, seule consommatrice) est toujours `base.variante==="modelisation"`
  // (jamais fonctionDonnee) — voir en-tête de fichier et `familles/achatGroupe.ts`.
  if (exercice.base.variante !== "modelisation") throw new Error("ancrageSysteme : accessible uniquement pour une famille voieSysteme, toujours en voie modelisation");
  const y0 = exercice.base.contrainte.pente * x0 + exercice.base.contrainte.ordonnee;
  return { x0, y0 };
}

export function diagnostiquerSystemeReel(exercice: ExerciceEquationInequationSecondDegre, texte: string): StatutVerification {
  if (exercice.variante !== "equation" || !exercice.systeme) return "parse_error";
  const { x0, y0 } = ancrageSysteme(exercice);
  const { M } = exercice.systeme;
  return diagnostiquerEquivalenceQuadratiqueXY(texte, x0, y0, (x, y) => x * y - M);
}

export function verifierSystemeReel(exercice: ExerciceEquationInequationSecondDegre, texte: string): boolean {
  return diagnostiquerSystemeReel(exercice, texte) === "correct";
}

export function diagnostiquerSystemeHypothetique(exercice: ExerciceEquationInequationSecondDegre, texte: string): StatutVerification {
  if (exercice.variante !== "equation" || !exercice.systeme) return "parse_error";
  const { x0, y0 } = ancrageSysteme(exercice);
  const { M, a, b } = exercice.systeme;
  return diagnostiquerEquivalenceQuadratiqueXY(texte, x0, y0, (x, y) => (x + a) * (y - b) - M);
}

export function verifierSystemeHypothetique(exercice: ExerciceEquationInequationSecondDegre, texte: string): boolean {
  return diagnostiquerSystemeHypothetique(exercice, texte) === "correct";
}

/** Relation LINÉAIRE obtenue en soustrayant les 2 équations du système (élimination du terme croisé
 * `xy`) — `a·y-b·x=a·b`, cible purement linéaire, la primitive ne fait aucune hypothèse de degré
 * (même principe déjà établi pour la directrice d'une parabole, gen54). */
export function diagnostiquerEliminationSysteme(exercice: ExerciceEquationInequationSecondDegre, texte: string): StatutVerification {
  if (exercice.variante !== "equation" || !exercice.systeme) return "parse_error";
  const { x0, y0 } = ancrageSysteme(exercice);
  const { a, b } = exercice.systeme;
  return diagnostiquerEquivalenceQuadratiqueXY(texte, x0, y0, (x, y) => a * y - b * x - a * b);
}

export function verifierEliminationSysteme(exercice: ExerciceEquationInequationSecondDegre, texte: string): boolean {
  return diagnostiquerEliminationSysteme(exercice, texte) === "correct";
}

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
