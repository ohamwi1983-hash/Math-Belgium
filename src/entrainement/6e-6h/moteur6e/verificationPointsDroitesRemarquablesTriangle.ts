import type {
  Droite,
  ExercicePDRT_A,
  ExercicePDRT_B,
  ExercicePDRT_C,
  ExercicePDRT_D,
  ExercicePDRT_E,
  ExercicePDRT_F,
  ExercicePDRT_G,
  ExercicePDRT_H,
  ExercicePointsDroitesRemarquablesTriangle,
  Point,
} from "../core6e/pointsDroitesRemarquablesTriangle.types";
import { diagnostiquerEnsembleValeurs, diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhasePointsDroitesRemarquablesTriangle } from "./typesPointsDroitesRemarquablesTriangle";

/**
 * Couche B (6e) — vérification propre à `6gen54` (dispatch par famille/écran). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/pointsDroitesRemarquablesTriangle/session.integration.test.ts` pour le seul
 * fichier autorisé Couche A + Couche B ensemble.
 *
 * Réutilise `diagnostiquerValeur`/`diagnostiquerEnsembleValeurs` (`moteur6e/
 * equivalenceExponentielle.ts`, chapitre 2 — convention DÉJÀ établie et documentée par `6gen43`
 * pour "tout champ numérique", peu importe le chapitre d'origine du module) pour tout champ
 * numérique isolé (coordonnée, longueur...), et l'évaluateur brut `evaluerValeurExponentielle`
 * (`moteur6e/expressionExponentielle.ts`) pour les vérifications structurelles propres à ce
 * générateur (équations de droite par proportionnalité, rapport, aire paramétrée).
 *
 * **Équation d'une droite = triplet (a,b,c) proportionnel** — toute droite `ax+by+c=0` admet une
 * infinité d'équations, toutes multiples l'une de l'autre par un scalaire non nul ; la comparaison
 * ne peut donc jamais être une égalité terme à terme, seulement un test de PROPORTIONNALITÉ
 * (`statutTripletProportionnel`, déterminants croisés nuls) — mirroir du principe déjà appliqué
 * pour la même raison au chantier 4e (`src/moteur/verificationDroite.ts`, jamais importé : chantier
 * strictement isolé, seule l'IDÉE mathématique est réutilisée, jamais le code).
 */

const EPSILON_STRUCTURE = 1e-6;
const TOLERANCE = 0.01;

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

/** Comparaison position par position d'un tableau de textes à un tableau de valeurs cibles — sert
 * indifféremment pour un nombre isolé, un couple de coordonnées (2 cases) ou un triplet
 * d'équation comparé terme à terme (jamais utilisé pour une équation, voir `statutEquation` juste
 * en dessous pour ce cas — la proportionnalité, pas l'égalité, y est le bon critère). */
function diagnostiquerValeurs(valeurs: string[], cibles: number[]): StatutVerification {
  return combinerStatuts(...cibles.map((c, i) => diagnostiquerValeur(valeurs[i] ?? "", c)));
}

function evaluerTriplet(valeurs: string[], debut: number): { a: number; b: number; c: number } | null {
  const a = evaluerValeurExponentielle(valeurs[debut] ?? "");
  const b = evaluerValeurExponentielle(valeurs[debut + 1] ?? "");
  const c = evaluerValeurExponentielle(valeurs[debut + 2] ?? "");
  if (a === null || b === null || c === null) return null;
  return { a, b, c };
}

function statutTripletProportionnel(t: { a: number; b: number; c: number }, ref: Droite): StatutVerification {
  if (Math.abs(t.a) <= EPSILON_STRUCTURE && Math.abs(t.b) <= EPSILON_STRUCTURE && Math.abs(t.c) <= EPSILON_STRUCTURE) return "parse_error";
  const echelle = Math.max(1, Math.abs(ref.a), Math.abs(ref.b), Math.abs(ref.c)) ** 2;
  const m1 = t.a * ref.b - ref.a * t.b;
  const m2 = t.a * ref.c - ref.a * t.c;
  const m3 = t.b * ref.c - ref.b * t.c;
  const seuil = EPSILON_STRUCTURE * echelle * 1000; // tolérance généreuse : saisie élève, pas génération exacte
  const proportionnel = Math.abs(m1) <= seuil && Math.abs(m2) <= seuil && Math.abs(m3) <= seuil;
  return proportionnel ? "correct" : "not_equivalent";
}

/** Diagnostique une équation de droite (3 cases consécutives de `valeurs`, à partir de `debut`) par
 * proportionnalité à `ref`. */
function diagnostiquerEquation(valeurs: string[], debut: number, ref: Droite): StatutVerification {
  const t = evaluerTriplet(valeurs, debut);
  if (t === null) return "parse_error";
  return statutTripletProportionnel(t, ref);
}

/** Compare un ensemble (ordre indifférent) de points saisis en 2N cases (x,y par ligne) à un
 * ensemble cible de N points — utilisé par la famille C, écran 3 (add-as-needed). */
function diagnostiquerEnsemblePoints(valeurs: string[], cibles: Point[]): StatutVerification {
  if (valeurs.length !== cibles.length * 2) return "not_equivalent";
  const pts: Point[] = [];
  for (let i = 0; i < cibles.length; i++) {
    const x = evaluerValeurExponentielle(valeurs[2 * i] ?? "");
    const y = evaluerValeurExponentielle(valeurs[2 * i + 1] ?? "");
    if (x === null || y === null) return "parse_error";
    pts.push({ x, y });
  }
  const restantes = [...cibles];
  for (const p of pts) {
    const idx = restantes.findIndex((c) => Math.abs(c.x - p.x) <= TOLERANCE && Math.abs(c.y - p.y) <= TOLERANCE);
    if (idx === -1) return "not_equivalent";
    restantes.splice(idx, 1);
  }
  return "correct";
}

/** Rapport m:n comparé PAR ÉQUIVALENCE (multiple non nul accepté, ex. 5:12 ~ 10:24) à un rapport
 * cible m0:n0 — famille B écran 2. */
function diagnostiquerRatio(valeurs: string[], m0: number, n0: number): StatutVerification {
  const m = evaluerValeurExponentielle(valeurs[0] ?? "");
  const n = evaluerValeurExponentielle(valeurs[1] ?? "");
  if (m === null || n === null) return "parse_error";
  if (Math.abs(m) < 1e-9 || Math.abs(n) < 1e-9) return "not_equivalent";
  const echelle = Math.max(1, Math.abs(m0), Math.abs(n0));
  return Math.abs(m * n0 - n * m0) <= TOLERANCE * echelle ? "correct" : "not_equivalent";
}

/** Aire(t)=½|K+M·t| — la même fonction s'écrit aussi ½|(-K)+(-M)·t| : les 2 conventions de signe
 * sont acceptées (famille C écran 1). */
function diagnostiquerAireParametree(valeurs: string[], K: number, M: number): StatutVerification {
  const k1 = evaluerValeurExponentielle(valeurs[0] ?? "");
  const m1 = evaluerValeurExponentielle(valeurs[1] ?? "");
  if (k1 === null || m1 === null) return "parse_error";
  const direct = Math.abs(k1 - K) <= TOLERANCE && Math.abs(m1 - M) <= TOLERANCE;
  const oppose = Math.abs(k1 + K) <= TOLERANCE && Math.abs(m1 + M) <= TOLERANCE;
  return direct || oppose ? "correct" : "not_equivalent";
}

/** Choix multiple (famille E, écran 1) — 1 case, identifiants triés séparés par des virgules. */
function diagnostiquerChoixMultiple(valeur: string, correctIds: readonly string[]): StatutVerification {
  const soumis = [...new Set(valeur.split(",").map((s) => s.trim()).filter((s) => s !== ""))].sort();
  const attendu = [...correctIds].sort();
  if (soumis.length !== attendu.length) return "not_equivalent";
  return soumis.every((v, i) => v === attendu[i]) ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille A — choix structurel (constant, pas dépendant de l'exercice) + coordonnées.
// ============================================================================

/** Les 3 candidats (mêmes options pour A, B, C) — voir `ui6e/formatPointsDroitesRemarquablesTriangle.ts`
 * pour les libellés affichés. Correct pour le rôle A="subA" (=B'+C'-A'), rôle B="subB", rôle
 * C="subC" — fait STRUCTUREL (jamais dépendant du tirage), donc hardcodé ici plutôt que stocké
 * dans l'exercice (cohérent avec "Couche B ne recalcule jamais de maths" : ceci n'est pas un
 * calcul, c'est une constante). */
export const RELATIONS_CORRECTES_A: readonly [string, string, string] = ["subA", "subB", "subC"];

function diagnostiquerAEcran(exercice: ExercicePDRT_A, phase: PhasePointsDroitesRemarquablesTriangle, valeurs: string[]): StatutVerification {
  if (phase === "aEcran1") {
    const ok = valeurs[0] === RELATIONS_CORRECTES_A[0] && valeurs[1] === RELATIONS_CORRECTES_A[1] && valeurs[2] === RELATIONS_CORRECTES_A[2];
    return ok ? "correct" : "not_equivalent";
  }
  return diagnostiquerValeurs(valeurs, [exercice.A.x, exercice.A.y, exercice.B.x, exercice.B.y, exercice.C.x, exercice.C.y]);
}

// ============================================================================
// Famille B.
// ============================================================================

function diagnostiquerBEcran(exercice: ExercicePDRT_B, phase: PhasePointsDroitesRemarquablesTriangle, valeurs: string[]): StatutVerification {
  if (phase === "bEcran1") return diagnostiquerValeurs(valeurs, [exercice.AB, exercice.BC]);
  if (phase === "bEcran2") return diagnostiquerRatio(valeurs, exercice.AB, exercice.BC);
  return diagnostiquerValeurs(valeurs, [exercice.I.x, exercice.I.y]);
}

// ============================================================================
// Famille C.
// ============================================================================

function diagnostiquerCEcran(exercice: ExercicePDRT_C, phase: PhasePointsDroitesRemarquablesTriangle, valeurs: string[]): StatutVerification {
  if (phase === "cEcran1") return diagnostiquerAireParametree(valeurs, exercice.K, exercice.M);
  if (phase === "cEcran2") return diagnostiquerEnsembleValeurs(valeurs, exercice.solutionsT);
  return diagnostiquerEnsemblePoints(valeurs, exercice.solutionsC);
}

// ============================================================================
// Famille D.
// ============================================================================

function diagnostiquerDEcran(exercice: ExercicePDRT_D, phase: PhasePointsDroitesRemarquablesTriangle, valeurs: string[]): StatutVerification {
  if (phase === "dEcran1") return combinerStatuts(diagnostiquerEquation(valeurs, 0, exercice.eqPourB_1), diagnostiquerEquation(valeurs, 3, exercice.eqPourB_2));
  if (phase === "dEcran2") return diagnostiquerValeurs(valeurs, [exercice.B.x, exercice.B.y]);
  if (phase === "dEcran3") return diagnostiquerValeurs(valeurs, [exercice.C.x, exercice.C.y]);
  return combinerStatuts(diagnostiquerEquation(valeurs, 0, exercice.droiteAB), diagnostiquerEquation(valeurs, 3, exercice.droiteAC), diagnostiquerEquation(valeurs, 6, exercice.droiteBC));
}

// ============================================================================
// Famille E — choix multiple (écran 1) + équations (écran 2).
// ============================================================================

export const CONSTRUCTIONS_CORRECTES_E: readonly string[] = ["parallele", "milieu"];

function diagnostiquerEEcran(exercice: ExercicePDRT_E, phase: PhasePointsDroitesRemarquablesTriangle, valeurs: string[]): StatutVerification {
  if (phase === "eEcran1") return diagnostiquerChoixMultiple(valeurs[0] ?? "", CONSTRUCTIONS_CORRECTES_E);
  return combinerStatuts(diagnostiquerEquation(valeurs, 0, exercice.droiteParallele), diagnostiquerEquation(valeurs, 3, exercice.droiteMilieu));
}

// ============================================================================
// Famille F.
// ============================================================================

function diagnostiquerFEcran(exercice: ExercicePDRT_F, phase: PhasePointsDroitesRemarquablesTriangle, valeurs: string[]): StatutVerification {
  if (phase === "fEcran1") return combinerStatuts(diagnostiquerEquation(valeurs, 0, exercice.droiteAB), diagnostiquerEquation(valeurs, 3, exercice.perpendiculaire));
  if (phase === "fEcran2") return diagnostiquerValeurs(valeurs, [exercice.H.x, exercice.H.y]);
  return diagnostiquerValeurs(valeurs, [exercice.Q.x, exercice.Q.y]);
}

// ============================================================================
// Famille G — 2 sous-types, même déroulé d'écrans, cardinalité différente à l'écran 3.
// ============================================================================

function pointIntermediaireG(exercice: ExercicePDRT_G): Point {
  return exercice.sousType === "sommetDiagonale" ? exercice.O : exercice.M;
}

function secondSommetG(exercice: ExercicePDRT_G): Point {
  return exercice.sousType === "sommetDiagonale" ? exercice.C : exercice.A;
}

function diagnostiquerGEcran(exercice: ExercicePDRT_G, phase: PhasePointsDroitesRemarquablesTriangle, valeurs: string[]): StatutVerification {
  if (phase === "gEcran1") {
    const point = pointIntermediaireG(exercice);
    return combinerStatuts(diagnostiquerEquation(valeurs, 0, exercice.perpendiculaire), diagnostiquerValeurs(valeurs.slice(3), [point.x, point.y]));
  }
  if (phase === "gEcran2") {
    const second = secondSommetG(exercice);
    return diagnostiquerValeurs(valeurs, [second.x, second.y]);
  }
  if (exercice.sousType === "sommetDiagonale") {
    return diagnostiquerValeurs(valeurs, [exercice.B.x, exercice.B.y, exercice.C.x, exercice.C.y, exercice.D.x, exercice.D.y]);
  }
  return diagnostiquerValeurs(valeurs, [exercice.A.x, exercice.A.y, exercice.B.x, exercice.B.y, exercice.C.x, exercice.C.y, exercice.D.x, exercice.D.y]);
}

// ============================================================================
// Famille H — réutilise Pp/rayonReflechi déjà calculés par la Couche A (elle-même réutilisant
// familleF).
// ============================================================================

function diagnostiquerHEcran(exercice: ExercicePDRT_H, phase: PhasePointsDroitesRemarquablesTriangle, valeurs: string[]): StatutVerification {
  if (phase === "hEcran1") return diagnostiquerValeurs(valeurs, [exercice.Pp.x, exercice.Pp.y]);
  return diagnostiquerEquation(valeurs, 0, exercice.rayonReflechi);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExercicePointsDroitesRemarquablesTriangle, phase: PhasePointsDroitesRemarquablesTriangle, valeurs: string[]): StatutVerification {
  switch (exercice.famille) {
    case "A":
      return diagnostiquerAEcran(exercice, phase, valeurs);
    case "B":
      return diagnostiquerBEcran(exercice, phase, valeurs);
    case "C":
      return diagnostiquerCEcran(exercice, phase, valeurs);
    case "D":
      return diagnostiquerDEcran(exercice, phase, valeurs);
    case "E":
      return diagnostiquerEEcran(exercice, phase, valeurs);
    case "F":
      return diagnostiquerFEcran(exercice, phase, valeurs);
    case "G":
      return diagnostiquerGEcran(exercice, phase, valeurs);
    case "H":
      return diagnostiquerHEcran(exercice, phase, valeurs);
  }
}

export function verifierEcran(exercice: ExercicePointsDroitesRemarquablesTriangle, phase: PhasePointsDroitesRemarquablesTriangle, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
