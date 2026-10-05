/**
 * Couche B — vérification pour "Norme d'un vecteur et distance entre 2 points" (chapitre "Calcul
 * vectoriel"), nouveau générateur (`promptcreationgenerateur26normedistance.md`), refondu par
 * `promptgen26refontecomplete.md` (variante `comparaison` supprimée, format de réponse élargi à la
 * fraction/l'irrationnel irréductible sur plusieurs écrans, écran `reductionParametreNorme` passé à
 * un champ de texte libre unique, `testPythagore` devenu catégoriel).
 *
 * Statut à 3 valeurs (`StatutVerification`) sur tous les champs numériques libres, y compris les
 * nouveaux champs texte libre (`evaluerExpressionGenerale`, mêmes primitives que
 * `verificationDistanceDroite.ts::diagnostiquerDistance` — entier/fraction/`sqrt(...)`/décimal,
 * jamais le filtrage numérique-strict qui bloquerait `/`). Les champs CATÉGORIELS (classification de
 * triangle isocèle, sommet rectangle) ont leur PROPRE logique booléenne, jamais le statut à 3
 * valeurs (aucune saisie libre pour eux) — même principe que "Colinéarité"/"Orthogonalité"
 * (générateurs 24/25).
 */
import type { ClassificationTriangleIsocele, ExerciceDistance, ExerciceIsocele, ExerciceNormeVecteur, ExerciceParametreNorme, ExercicePythagore } from "../core/normeDistance.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 0.01;

function statutNumerique(valeur: number, cible: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

/** `√` unicode → `sqrt(...)`, même translittération que `verificationDistanceDroite.ts` — seule
 * adaptation nécessaire, `evaluerExpressionGenerale` ne tokenise que la forme fonction. */
function remplacerRacineUnicode(texte: string): string {
  return texte.replace(/√\(/g, "sqrt(").replace(/√\s*(\d+(?:[.,]\d+)?)/g, "sqrt($1)");
}

/** Champ de texte libre acceptant entier/fraction/racine/décimal — même patron que
 * `verificationDistanceDroite.ts::diagnostiquerDistance`, réutilisé sur tous les écrans de ce
 * générateur au format de réponse élargi (`promptgen26refontecomplete.md`, Partie B/D/F/G). */
function diagnostiquerExpressionNumerique(texte: string, cible: number): StatutVerification {
  let valeur: number;
  try {
    valeur = evaluerExpressionGenerale(remplacerRacineUnicode(texte), 0);
  } catch {
    return "parse_error";
  }
  return statutNumerique(valeur, cible);
}

// ============================================================================
// Variante 1 — norme d'un vecteur donné
// ============================================================================

export function diagnostiquerNormeVecteur(exercice: ExerciceNormeVecteur, texte: string): StatutVerification {
  return diagnostiquerExpressionNumerique(texte, exercice.norme);
}

export function verifierNormeVecteur(exercice: ExerciceNormeVecteur, texte: string): boolean {
  return diagnostiquerNormeVecteur(exercice, texte) === "correct";
}

// ============================================================================
// Variante 2 — distance entre 2 points
// ============================================================================

export interface ReponseConstructionDistance {
  x: number;
  y: number;
}

export function evaluerConstructionDistance(exercice: ExerciceDistance, reponse: ReponseConstructionDistance): { x: StatutVerification; y: StatutVerification } {
  return {
    x: statutNumerique(reponse.x, exercice.vecteurAB.x),
    y: statutNumerique(reponse.y, exercice.vecteurAB.y),
  };
}

export function verifierConstructionDistance(exercice: ExerciceDistance, reponse: ReponseConstructionDistance): boolean {
  const e = evaluerConstructionDistance(exercice, reponse);
  return e.x === "correct" && e.y === "correct";
}

export function diagnostiquerCalculDistance(exercice: ExerciceDistance, texte: string): StatutVerification {
  return diagnostiquerExpressionNumerique(texte, exercice.distance);
}

export function verifierCalculDistance(exercice: ExerciceDistance, texte: string): boolean {
  return diagnostiquerCalculDistance(exercice, texte) === "correct";
}

// ============================================================================
// Variante 4 — triangle isocèle/scalène
// ============================================================================

export interface ReponseConstructionIsocele {
  abX: number;
  abY: number;
  acX: number;
  acY: number;
  bcX: number;
  bcY: number;
}

export function evaluerConstructionIsocele(
  exercice: ExerciceIsocele,
  reponse: ReponseConstructionIsocele,
): Record<keyof ReponseConstructionIsocele, StatutVerification> {
  return {
    abX: statutNumerique(reponse.abX, exercice.vecteurAB.x),
    abY: statutNumerique(reponse.abY, exercice.vecteurAB.y),
    acX: statutNumerique(reponse.acX, exercice.vecteurAC.x),
    acY: statutNumerique(reponse.acY, exercice.vecteurAC.y),
    bcX: statutNumerique(reponse.bcX, exercice.vecteurBC.x),
    bcY: statutNumerique(reponse.bcY, exercice.vecteurBC.y),
  };
}

export function verifierConstructionIsocele(exercice: ExerciceIsocele, reponse: ReponseConstructionIsocele): boolean {
  const e = evaluerConstructionIsocele(exercice, reponse);
  return Object.values(e).every((s) => s === "correct");
}

/** Format de réponse élargi (`promptgen26refontecomplete.md`, Partie D, écran 2) : 3 champs de
 * texte libre (fraction/irrationnel irréductible acceptés), jamais des nombres bruts. */
export interface ReponseCalculIsocele {
  ab: string;
  ac: string;
  bc: string;
}

export function evaluerCalculIsocele(exercice: ExerciceIsocele, reponse: ReponseCalculIsocele): { ab: StatutVerification; ac: StatutVerification; bc: StatutVerification } {
  return {
    ab: diagnostiquerExpressionNumerique(reponse.ab, exercice.longueurAB),
    ac: diagnostiquerExpressionNumerique(reponse.ac, exercice.longueurAC),
    bc: diagnostiquerExpressionNumerique(reponse.bc, exercice.longueurBC),
  };
}

export function verifierCalculIsocele(exercice: ExerciceIsocele, reponse: ReponseCalculIsocele): boolean {
  const e = evaluerCalculIsocele(exercice, reponse);
  return e.ab === "correct" && e.ac === "correct" && e.bc === "correct";
}

/** Réponse catégorielle de l'écran "conclusion" — depuis `promptgen26refontecomplete.md` (Partie
 * D), l'option "Équilatéral" a été retirée entièrement (piège volontairement abandonné) : cette
 * réponse coïncide désormais exactement avec `ClassificationTriangleIsocele`, un simple alias. */
export type ReponseClassificationIsocele = ClassificationTriangleIsocele;

export function conclusionAttendueIsocele(exercice: ExerciceIsocele): ClassificationTriangleIsocele {
  return exercice.classification;
}

export function verifierConclusionIsocele(exercice: ExerciceIsocele, reponse: ReponseClassificationIsocele): boolean {
  return reponse === conclusionAttendueIsocele(exercice);
}

// ============================================================================
// Variante 5 — déterminer x pour une norme cible (quadratique)
// ============================================================================

/** Points d'échantillonnage pour comparer l'équation soumise (LHS=RHS) à l'équation cible
 * `ax²+bx+c=0` (`a=1` toujours, voir `generateurs/normeDistance/index.ts`) — 5 points, largement
 * suffisant pour déterminer une équivalence de degré ≤2 (3 points suffiraient déjà), marge
 * supplémentaire pour réduire le risque de faux positif sur une expression non polynomiale. */
const POINTS_ECHANTILLON_EQUATION = [-5, -2, 1, 4, 8];

/**
 * Écran 1 de la variante "parametre" (`promptgen26refontecomplete.md`, Partie C) : un seul champ de
 * texte libre où l'élève écrit l'équation développée et réduite complète (`x^2-8x+97=0`), vérifiée
 * par équivalence algébrique — remplace les 3 anciens champs numériques (a, b, c). Sépare `texte` en
 * membre gauche/droit sur le premier `=`, évalue chacun par échantillonnage
 * (`evaluerExpressionGenerale`, degré non polynomial toléré — seule l'égalité aux points
 * d'échantillonnage compte) et compare `gauche(x)-droite(x)` à `a·x²+b·x+c` en chaque point.
 */
export function diagnostiquerReductionParametreNorme(exercice: ExerciceParametreNorme, texte: string): StatutVerification {
  const cotes = texte.split("=");
  if (cotes.length !== 2) return "parse_error";
  const [gauche, droite] = cotes;

  try {
    for (const x of POINTS_ECHANTILLON_EQUATION) {
      const g = evaluerExpressionGenerale(remplacerRacineUnicode(gauche), x);
      const d = evaluerExpressionGenerale(remplacerRacineUnicode(droite), x);
      if (!Number.isFinite(g) || !Number.isFinite(d)) return "parse_error";
      const diff = g - d;
      const cible = exercice.a * x * x + exercice.b * x + exercice.c;
      if (Math.abs(diff - cible) > TOLERANCE) return "not_equivalent";
    }
  } catch {
    return "parse_error";
  }
  return "correct";
}

export function verifierReductionParametreNorme(exercice: ExerciceParametreNorme, texte: string): boolean {
  return diagnostiquerReductionParametreNorme(exercice, texte) === "correct";
}

/** Comparaison en multi-ensemble à tolérance — même principe que `verifierZerosCaracteristiques`
 * (exercice "Caractéristiques d'une fonction") : ordre indifférent, le NOMBRE de valeurs soumises
 * doit correspondre exactement au nombre de solutions réelles (0, 1 ou 2). Inchangée par la refonte
 * (seul l'écran 1 de cette variante a changé). */
export function verifierResolutionParametreNorme(exercice: ExerciceParametreNorme, valeurs: number[]): boolean {
  if (valeurs.length !== exercice.solutions.length) return false;
  const cibles = [...exercice.solutions].sort((a, b) => a - b);
  const reponses = [...valeurs].sort((a, b) => a - b);
  return reponses.every((v, i) => Number.isFinite(v) && Math.abs(v - cibles[i]) <= TOLERANCE);
}

// ============================================================================
// Variante 6 — Pythagore, méthode alternative
// ============================================================================

export interface ReponseConstructionPythagore {
  abX: number;
  abY: number;
  acX: number;
  acY: number;
  bcX: number;
  bcY: number;
}

export function evaluerConstructionPythagore(
  exercice: ExercicePythagore,
  reponse: ReponseConstructionPythagore,
): Record<keyof ReponseConstructionPythagore, StatutVerification> {
  return {
    abX: statutNumerique(reponse.abX, exercice.vecteurAB.x),
    abY: statutNumerique(reponse.abY, exercice.vecteurAB.y),
    acX: statutNumerique(reponse.acX, exercice.vecteurAC.x),
    acY: statutNumerique(reponse.acY, exercice.vecteurAC.y),
    bcX: statutNumerique(reponse.bcX, exercice.vecteurBC.x),
    bcY: statutNumerique(reponse.bcY, exercice.vecteurBC.y),
  };
}

export function verifierConstructionPythagore(exercice: ExercicePythagore, reponse: ReponseConstructionPythagore): boolean {
  const e = evaluerConstructionPythagore(exercice, reponse);
  return Object.values(e).every((s) => s === "correct");
}

/** Longueurs RÉELLES des 3 côtés (racine des longueurs au carré déjà stockées sur l'exercice) —
 * potentiellement irrationnelles (contrairement à "isocèle", ce triangle n'est pas construit pour
 * garantir des côtés entiers). `promptgen26refontecomplete.md` (Partie E) aligne délibérément
 * l'écran "calcul" de cette variante sur celui d'"isocèle" : mêmes labels en norme, même format de
 * réponse élargi (fraction/irrationnel irréductible) — l'ancien écran demandait les longueurs AU
 * CARRÉ (toujours entières) ; c'est désormais la NORME elle-même qui est demandée. */
export function longueursPythagore(exercice: ExercicePythagore): { ab: number; ac: number; bc: number } {
  return { ab: Math.sqrt(exercice.carreAB), ac: Math.sqrt(exercice.carreAC), bc: Math.sqrt(exercice.carreBC) };
}

export interface ReponseCalculPythagore {
  ab: string;
  ac: string;
  bc: string;
}

export function evaluerCalculPythagore(
  exercice: ExercicePythagore,
  reponse: ReponseCalculPythagore,
): { ab: StatutVerification; ac: StatutVerification; bc: StatutVerification } {
  const cibles = longueursPythagore(exercice);
  return {
    ab: diagnostiquerExpressionNumerique(reponse.ab, cibles.ab),
    ac: diagnostiquerExpressionNumerique(reponse.ac, cibles.ac),
    bc: diagnostiquerExpressionNumerique(reponse.bc, cibles.bc),
  };
}

export function verifierCalculPythagore(exercice: ExercicePythagore, reponse: ReponseCalculPythagore): boolean {
  const e = evaluerCalculPythagore(exercice, reponse);
  return e.ab === "correct" && e.ac === "correct" && e.bc === "correct";
}

/** Écran "test" — depuis `promptgen26refontecomplete.md` (Partie E), fusionne l'ancien écran
 * numérique `testPythagore` (calcul des 3 écarts hypothèse par hypothèse) et l'ancien écran
 * catégoriel `conclusionPythagore` (désormais supprimé) : une seule question catégorielle "Le
 * triangle est rectangle en" (A/B/C, plus d'option "pas rectangle" — voir `core/normeDistance.types.ts`
 * pour le gap connu et assumé quand `sommetRectangle` est `null`). */
export type ReponseTestPythagore = "A" | "B" | "C" | null;

export function sommetAttenduPythagore(exercice: ExercicePythagore): "A" | "B" | "C" | null {
  return exercice.sommetRectangle;
}

export function verifierTestPythagore(exercice: ExercicePythagore, reponse: ReponseTestPythagore): boolean {
  return reponse === sommetAttenduPythagore(exercice);
}
