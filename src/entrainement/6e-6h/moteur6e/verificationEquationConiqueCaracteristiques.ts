import type { ExerciceEquationConiqueCaracteristiques, ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleD } from "../core6e/equationConiqueCaracteristiques.types";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import { diagnostiquerEquivalenceQuadratiqueXY } from "./expressionQuadratiqueXY";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseEquationConiqueCaracteristiques } from "./typesEquationConiqueCaracteristiques";

/**
 * Couche B (6e) — vérification propre à `6gen59` (dispatch par famille/sous-type/écran). N'importe
 * JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/equationConiqueCaracteristiques/session.integration.test.ts` pour le seul fichier
 * autorisé Couche A + Couche B ensemble.
 *
 * Toutes les équations finales et valeurs intermédiaires (a,b,c,p,e,bCarre,aCarre...) sont comparées
 * par ÉQUIVALENCE NUMÉRIQUE (`diagnostiquerValeur`, tolérance 0.01 — `equivalenceExponentielle.ts`,
 * déjà éprouvée par plusieurs chapitres 6e) ou par ÉQUIVALENCE ALGÉBRIQUE À 2 VARIABLES
 * (`diagnostiquerEquivalenceQuadratiqueXY`, `expressionQuadratiqueXY.ts`, partagé avec `6gen58` —
 * accepte n'importe quelle reformulation équivalente d'une équation finale, jamais une seule forme
 * figée). Les champs de CHOIX comparent directement l'identifiant choisi (`correct`/`not_equivalent`
 * uniquement, jamais `parse_error` — pas de saisie libre possible sur ces champs).
 *
 * Toutes les équations finales sont échantillonnées autour de `(0,0)` — sûr ici : chaque cible est
 * un polynôme en `x,y` divisé par des CONSTANTES uniquement (`a²`,`bCarre`...), jamais par une
 * expression contenant `x`/`y` — aucun risque de division par zéro au point de référence, quelle
 * que soit la famille.
 */

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function diagnostiquerValeurs(valeurs: string[], attendues: number[]): StatutVerification {
  return combinerStatuts(...attendues.map((v, i) => diagnostiquerValeur(valeurs[i] ?? "", v)));
}

function diagnostiquerChoix(valeur: string | undefined, attendu: string): StatutVerification {
  return valeur === attendu ? "correct" : "not_equivalent";
}

function diagnostiquerEquation(texte: string, cible: (x: number, y: number) => number): StatutVerification {
  return diagnostiquerEquivalenceQuadratiqueXY(texte, 0, 0, cible);
}

// ============================================================================
// Famille A.
// ============================================================================

function cibleMemeAxe(e: Extract<ExerciceFamilleA, { sousType: "memeAxe" }>): (x: number, y: number) => number {
  const signe = e.natureCible === "ellipse" ? 1 : -1;
  return e.axe === "horizontal" ? (x, y) => (x * x) / (e.a * e.a) + (signe * (y * y)) / e.bCarre - 1 : (x, y) => (y * y) / (e.a * e.a) + (signe * (x * x)) / e.bCarre - 1;
}

function diagnostiquerAMemeAxe(e: Extract<ExerciceFamilleA, { sousType: "memeAxe" }>, phase: PhaseEquationConiqueCaracteristiques, valeurs: string[]): StatutVerification {
  if (phase === "aMemeAxeEcran1") return diagnostiquerValeurs(valeurs, [e.a, e.c]);
  if (phase === "aMemeAxeEcran2") return combinerStatuts(diagnostiquerChoix(valeurs[0], e.natureCible), diagnostiquerValeur(valeurs[1] ?? "", e.bCarre));
  return diagnostiquerEquation(valeurs[0] ?? "", cibleMemeAxe(e));
}

function cibleAxesPerp(e: Extract<ExerciceFamilleA, { sousType: "axesPerpendiculaires" }>): (x: number, y: number) => number {
  return e.axePrincipal === "horizontal" ? (x, y) => (x * x) / e.aCarre + (y * y) / e.bCarre - 1 : (x, y) => (y * y) / e.aCarre + (x * x) / e.bCarre - 1;
}

function diagnostiquerAAxesPerp(e: Extract<ExerciceFamilleA, { sousType: "axesPerpendiculaires" }>, phase: PhaseEquationConiqueCaracteristiques, valeurs: string[]): StatutVerification {
  if (phase === "aAxesPerpEcran1") return combinerStatuts(diagnostiquerChoix(valeurs[0], "axeF"), diagnostiquerValeur(valeurs[1] ?? "", e.b));
  if (phase === "aAxesPerpEcran2") return diagnostiquerValeurs(valeurs, [e.c, e.aCarre]);
  return diagnostiquerEquation(valeurs[0] ?? "", cibleAxesPerp(e));
}

function cibleDeuxSommets(e: Extract<ExerciceFamilleA, { sousType: "deuxSommets" }>): (x: number, y: number) => number {
  return (x, y) => (x * x) / (e.sommetX * e.sommetX) + (y * y) / (e.sommetY * e.sommetY) - 1;
}

function diagnostiquerADeuxSommets(e: Extract<ExerciceFamilleA, { sousType: "deuxSommets" }>, phase: PhaseEquationConiqueCaracteristiques, valeurs: string[]): StatutVerification {
  if (phase === "aDeuxSommetsEcran1") return diagnostiquerValeurs(valeurs, [e.sommetX, e.sommetY]);
  return diagnostiquerEquation(valeurs[0] ?? "", cibleDeuxSommets(e));
}

function diagnostiquerA(e: ExerciceFamilleA, phase: PhaseEquationConiqueCaracteristiques, valeurs: string[]): StatutVerification {
  if (e.sousType === "memeAxe") return diagnostiquerAMemeAxe(e, phase, valeurs);
  if (e.sousType === "axesPerpendiculaires") return diagnostiquerAAxesPerp(e, phase, valeurs);
  return diagnostiquerADeuxSommets(e, phase, valeurs);
}

// ============================================================================
// Famille B — parabole.
// ============================================================================

function cibleB(e: ExerciceFamilleB): (x: number, y: number) => number {
  return e.axe === "horizontal" ? (x, y) => (y - e.k) * (y - e.k) - 4 * e.p * (x - e.h) : (x, y) => (x - e.h) * (x - e.h) - 4 * e.p * (y - e.k);
}

function diagnostiquerB(e: ExerciceFamilleB, phase: PhaseEquationConiqueCaracteristiques, valeurs: string[]): StatutVerification {
  if (phase === "bEcran1") return diagnostiquerChoix(valeurs[0], e.axe);
  if (phase === "bEcran2") return diagnostiquerValeur(valeurs[0] ?? "", e.p);
  return diagnostiquerEquation(valeurs[0] ?? "", cibleB(e));
}

// ============================================================================
// Famille C.
// ============================================================================

function cibleC(e: ExerciceFamilleC): (x: number, y: number) => number {
  const signe = e.natureCible === "ellipse" ? 1 : -1;
  return e.axeTransverse === "horizontal" ? (x, y) => (x * x) / (e.a * e.a) + (signe * (y * y)) / e.bCarre - 1 : (x, y) => (y * y) / (e.a * e.a) + (signe * (x * x)) / e.bCarre - 1;
}

function diagnostiquerC(e: ExerciceFamilleC, phase: PhaseEquationConiqueCaracteristiques, valeurs: string[]): StatutVerification {
  if (phase === "cEcran1") return combinerStatuts(diagnostiquerChoix(valeurs[0], e.donnee1), diagnostiquerChoix(valeurs[1], e.donnee2));
  if (phase === "cEcran2") return diagnostiquerValeurs(valeurs, [e.a, e.c]);
  if (phase === "cEcran3") return combinerStatuts(diagnostiquerChoix(valeurs[0], e.natureCible), diagnostiquerValeur(valeurs[1] ?? "", e.bCarre));
  return diagnostiquerEquation(valeurs[0] ?? "", cibleC(e));
}

// ============================================================================
// Famille D — hyperbole depuis une asymptote.
// ============================================================================

function cibleD(e: ExerciceFamilleD): (x: number, y: number) => number {
  return e.axeTransverse === "horizontal" ? (x, y) => (x * x) / (e.a * e.a) - (y * y) / (e.b * e.b) - 1 : (x, y) => (y * y) / (e.a * e.a) - (x * x) / (e.b * e.b) - 1;
}

function diagnostiquerD(e: ExerciceFamilleD, phase: PhaseEquationConiqueCaracteristiques, valeurs: string[]): StatutVerification {
  if (phase === "dEcran1") {
    const penteAttendue = e.pente.num / e.pente.den;
    return combinerStatuts(diagnostiquerChoix(valeurs[0], e.axeTransverse), diagnostiquerValeur(valeurs[1] ?? "", penteAttendue));
  }
  if (phase === "dEcran2") {
    if (e.sousType === "sommet") return diagnostiquerValeur(valeurs[0] ?? "", e.b);
    return diagnostiquerValeurs(valeurs, [e.a, e.b]);
  }
  return diagnostiquerEquation(valeurs[0] ?? "", cibleD(e));
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceEquationConiqueCaracteristiques, phase: PhaseEquationConiqueCaracteristiques, valeurs: string[]): StatutVerification {
  if (exercice.famille === "A") return diagnostiquerA(exercice, phase, valeurs);
  if (exercice.famille === "B") return diagnostiquerB(exercice, phase, valeurs);
  if (exercice.famille === "C") return diagnostiquerC(exercice, phase, valeurs);
  return diagnostiquerD(exercice, phase, valeurs);
}

export function verifierEcran(exercice: ExerciceEquationConiqueCaracteristiques, phase: PhaseEquationConiqueCaracteristiques, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
