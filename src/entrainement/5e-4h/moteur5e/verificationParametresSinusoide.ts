/**
 * Couche B (5e) — vérification pour 5gen8 ("Paramètres d'une fonction sinusoïdale"). Même technique
 * générique que 5gen6 (`verificationArcsSecteurs.ts`) — `evaluerExpressionGenerale` directement (il
 * reconnaît nativement "pi", y compris collé à un coefficient), tolérance ±0.01 — RÉPLIQUÉE ici
 * plutôt qu'importée (convention déjà établie sur la plateforme pour ce genre de petite primitive
 * numérique générique, voir CLAUDE.md "gen29"/"Motifs partagés").
 * `src/moteur5e/` ne peut jamais importer `src/generateurs5e/` — les cibles numériques sont donc
 * recalculées ICI depuis les champs déjà exacts de `ExerciceParametresSinusoide` (jamais via les
 * fonctions `rationnelPi.ts` de Couche A), en pur JS/Math, indépendamment de la Couche A.
 *
 * `cibleAmplitude`/`ciblePeriode`/`cibleFrequence`/`cibleDecalage` prennent volontairement
 * `ParametresSinusoideBase` (le socle commun, sans `forme`/`B`/`C`) plutôt que `ExerciceParametresSinusoide` —
 * elles ne touchent jamais à ces 3 champs propres à 5gen8, ce qui permet à
 * `verificationParametresSinusoideGraphique.ts` (5gen9, le pendant graphique) de les RÉUTILISER
 * directement (moteur→moteur, explicitement autorisé par l'architecture) au lieu d'une 3e copie de
 * la même arithmétique triviale. Seule `cibleDephasage` reste propre à 5gen8 (lecture algébrique
 * directe) — 5gen9 a besoin d'une cible de nature différente pour son écran φ (position graphique
 * du premier passage ascendant, acceptée modulo T), jamais de cette fonction-ci.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import type { ExerciceParametresSinusoide, ParametresSinusoideBase, RationnelPi } from "../core5e/parametresSinusoide.types";

export const TOLERANCE_SINUSOIDE = 0.01;

export function diagnostiquerValeurSinusoide(texte: string, cible: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    return Math.abs(valeur - cible) <= TOLERANCE_SINUSOIDE ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

export function verifierValeurSinusoide(texte: string, cible: number): boolean {
  return diagnostiquerValeurSinusoide(texte, cible) === "correct";
}

function valeurRationnelPiLocal(v: RationnelPi): number {
  return (v.numerateur / v.denominateur) * Math.PI ** v.degrePi;
}

function valeurAmplitudeLocal(exercice: ParametresSinusoideBase): number {
  const { A } = exercice;
  const magnitude = A.rationnelle ? A.rationnelle.numerateur / A.rationnelle.denominateur : Math.sqrt(A.radicande!);
  return A.signe * magnitude;
}

/** L'amplitude demandée est TOUJOURS |A| — le signe de A dans la formule n'est jamais l'amplitude
 * elle-même (piège central de l'écran 1, spec). */
export function cibleAmplitude(exercice: ParametresSinusoideBase): number {
  return Math.abs(valeurAmplitudeLocal(exercice));
}

export function cibleDephasage(exercice: ExerciceParametresSinusoide): number {
  return valeurRationnelPiLocal(exercice.phi);
}

export function ciblePeriode(exercice: ParametresSinusoideBase): number {
  return valeurRationnelPiLocal(exercice.T);
}

export function cibleFrequence(exercice: ParametresSinusoideBase): number {
  return 1 / valeurRationnelPiLocal(exercice.T);
}

export function cibleDecalage(exercice: ParametresSinusoideBase): number {
  return exercice.b;
}
