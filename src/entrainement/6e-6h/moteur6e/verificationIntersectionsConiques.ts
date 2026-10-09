import type { ExerciceIntersectionsConiques, ExerciceIntersectionsConiquesA, ExerciceIntersectionsConiquesB, Frac } from "../core6e/intersectionsConiques.types";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import { diagnostiquerEquivalenceQuadratiqueXY } from "./expressionQuadratiqueXY";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseIntersectionsConiques } from "./typesIntersectionsConiques";

/**
 * Couche B (6e) — vérification propre à `6gen61` (dispatch par famille/écran). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/intersectionsConiques/session.integration.test.ts` pour le seul fichier autorisé
 * Couche A + Couche B ensemble.
 *
 * RÉUTILISE `expressionQuadratiqueXY.ts` (`diagnostiquerEquivalenceQuadratiqueXY`, écrit pour
 * `6gen58` mais explicitement documenté "conçu pour être réutilisé TEL QUEL par 6gen59-6gen63" —
 * voir son en-tête) pour toute équation à 2 variables (conique, droite, cercle brut) et
 * `equivalenceExponentielle.ts` (`diagnostiquerValeur`, déjà éprouvé par plusieurs chapitres 6e)
 * pour tout champ purement numérique (accepte nativement une fraction "a/b", une conséquence
 * bienvenue de son évaluateur arithmétique sous-jacent) — AUCUN nouvel évaluateur écrit ici, tout
 * est déjà en place sur cette plateforme pour ce chapitre.
 */

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function diagnostiquerValeurs(valeurs: string[], attendues: number[], tolerance = 0.01): StatutVerification {
  return combinerStatuts(...attendues.map((v, i) => diagnostiquerValeur(valeurs[i] ?? "", v, tolerance)));
}

function diagnostiquerChoix(valeur: string | undefined, attendu: string): StatutVerification {
  return valeur === attendu ? "correct" : "not_equivalent";
}

function diagnostiquerEquation(texte: string, cible: (x: number, y: number) => number): StatutVerification {
  return diagnostiquerEquivalenceQuadratiqueXY(texte, 0, 0, cible);
}

function fracToNumber(f: Frac): number {
  return f.n / f.d;
}

// ============================================================================
// Add-as-needed famille A écran 4 — ensemble de 0, 1, ou 2 points, comparaison EXACTE de l'ensemble
// (ordre indifférent) — mirroir `diagnostiquerEnsembleDeuxPoints` (`expressionCercles.ts`, 6gen55),
// généralisé à un nombre de points VARIABLE (0/1/2, jamais figé à 2).
// ============================================================================

interface PointNombre {
  x: number;
  y: number;
}

function parserPointLibre(texte: string): PointNombre | null {
  const nettoye = texte.trim().replace(/^\(/, "").replace(/\)$/, "");
  const parties = nettoye.split(";").length === 2 ? nettoye.split(";") : nettoye.split(",");
  if (parties.length !== 2) return null;
  const x = evaluerValeurExponentielle(parties[0] ?? "");
  const y = evaluerValeurExponentielle(parties[1] ?? "");
  if (x === null || y === null) return null;
  return { x, y };
}

const TOLERANCE_POINT = 0.01;

/** Compare l'ensemble des points saisis (`textes`) à l'ensemble des points attendus (`cibles`),
 * TAILLE VARIABLE (0, 1, ou 2 — jamais figée) — chaque point attendu doit être apparié à un point
 * saisi (et vice versa), l'ORDRE de saisie n'ayant aucune importance. */
export function diagnostiquerEnsemblePoints(textes: string[], cibles: readonly PointNombre[]): StatutVerification {
  if (textes.length !== cibles.length) return "not_equivalent";
  if (cibles.length === 0) return "correct";
  const parses = textes.map(parserPointLibre);
  if (parses.some((p) => p === null)) return "parse_error";
  const pts = parses as PointNombre[];
  const utilise = new Array(cibles.length).fill(false);
  for (const p of pts) {
    let trouve = false;
    for (let i = 0; i < cibles.length; i++) {
      if (utilise[i]) continue;
      const cible = cibles[i]!;
      if (Math.abs(p.x - cible.x) <= TOLERANCE_POINT && Math.abs(p.y - cible.y) <= TOLERANCE_POINT) {
        utilise[i] = true;
        trouve = true;
        break;
      }
    }
    if (!trouve) return "not_equivalent";
  }
  return "correct";
}

// ============================================================================
// Famille A.
// ============================================================================

function cibleConique(e: ExerciceIntersectionsConiquesA): (x: number, y: number) => number {
  return (x, y) => e.conique.p * x * x + e.conique.q * y * y - e.conique.n;
}

function cibleDroite(e: ExerciceIntersectionsConiquesA): (x: number, y: number) => number {
  const m = fracToNumber(e.droite.m);
  const c = fracToNumber(e.droite.c);
  return (x, y) => y - (m * x + c);
}

function diagnostiquerA(e: ExerciceIntersectionsConiquesA, phase: PhaseIntersectionsConiques, valeurs: string[]): StatutVerification {
  if (phase === "aEcran1") return diagnostiquerEquation(valeurs[0] ?? "", cibleConique(e));
  if (phase === "aEcran2") return diagnostiquerEquation(valeurs[0] ?? "", cibleDroite(e));
  if (phase === "aEcran3") return combinerStatuts(diagnostiquerValeur(valeurs[0] ?? "", e.discriminant, 0.5), diagnostiquerChoix(valeurs[1], String(e.nombreSolutions)));
  // aEcran4
  const cibles = e.points.map((p) => ({ x: fracToNumber(p.x), y: fracToNumber(p.y) }));
  return diagnostiquerEnsemblePoints(valeurs, cibles);
}

// ============================================================================
// Famille B.
// ============================================================================

/** Écran 1 — accepte N'IMPORTE QUELLE paire (λ,μ) non nulle vérifiant la relation de coefficients
 * égaux (voir `familleB.ts` en-tête), jamais seulement la paire canonique stockée dans l'exercice —
 * mathématiquement, une infinité de multiples valides existent. */
function diagnostiquerConditionsB(e: ExerciceIntersectionsConiquesB, valeurs: string[]): StatutVerification {
  const lambdaTxt = valeurs[0] ?? "";
  const muTxt = valeurs[1] ?? "";
  const lambda = evaluerValeurExponentielle(lambdaTxt);
  const mu = evaluerValeurExponentielle(muTxt);
  if (lambda === null || mu === null) return "parse_error";
  if (Math.abs(mu) < 1e-9 && Math.abs(lambda) < 1e-9) return "not_equivalent";
  const coeffXCarre = lambda * 1 + mu * e.A2;
  // C1 n'a pas de terme y² (coefficient 0) — coeffYCarre se réduit donc à mu*e.B2.
  const coeffYCarre = mu * e.B2;
  return Math.abs(coeffXCarre - coeffYCarre) <= 1e-6 ? "correct" : "not_equivalent";
}

function cibleCercleBrut(e: ExerciceIntersectionsConiquesB): (x: number, y: number) => number {
  return (x, y) => e.K * x * x + e.K * y * y + e.coeffX * x + e.coeffY * y + e.constanteBrute;
}

function diagnostiquerB(e: ExerciceIntersectionsConiquesB, phase: PhaseIntersectionsConiques, valeurs: string[]): StatutVerification {
  if (phase === "bEcran1") return diagnostiquerConditionsB(e, valeurs);
  if (phase === "bEcran2") return diagnostiquerEquation(valeurs[0] ?? "", cibleCercleBrut(e));
  return diagnostiquerValeurs(valeurs, [e.centre.x, e.centre.y, e.rayon]);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceIntersectionsConiques, phase: PhaseIntersectionsConiques, valeurs: string[]): StatutVerification {
  if (exercice.famille === "A") return diagnostiquerA(exercice, phase, valeurs);
  return diagnostiquerB(exercice, phase, valeurs);
}

export function verifierEcran(exercice: ExerciceIntersectionsConiques, phase: PhaseIntersectionsConiques, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
