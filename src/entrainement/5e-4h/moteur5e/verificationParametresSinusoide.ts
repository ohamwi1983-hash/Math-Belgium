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
 * la même arithmétique triviale. `cibleDecalageHorizontal`/`ciblePulsation`/`cibleDephasagePhase`
 * restent propres à 5gen8 (lecture algébrique directe) — 5gen9 calcule ses propres cibles Φ/φ à
 * partir du passage ascendant lu sur le graphique.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import type { ExerciceParametresSinusoide, ParametresSinusoideBase, RationnelPi } from "../core5e/parametresSinusoide.types";
import type { PhaseParametresSinusoide } from "./typesParametresSinusoide";

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

/** Accepte toute réponse cible + k·periode (k entier relatif) — Φ est défini à une période près
 * (Φ + kT décrit la même fonction), φ à 2π près. Même logique que la vérification de l'écran Φ de
 * 5gen9 (`verificationParametresSinusoideGraphique.ts`), qui la réutilise. */
export function diagnostiquerValeurModulo(texte: string, cible: number, periode: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    const ecart = valeur - cible;
    const reste = ecart - Math.round(ecart / periode) * periode;
    return Math.abs(reste) <= TOLERANCE_SINUSOIDE ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
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

/** Décalage horizontal Φ (champ `phi`) — accepté modulo T (`diagnostiquerPhaseParametresSinusoide`). */
export function cibleDecalageHorizontal(exercice: ExerciceParametresSinusoide): number {
  return valeurRationnelPiLocal(exercice.phi);
}

/** Pulsation ω = B = 2π/T (toujours > 0). */
export function ciblePulsation(exercice: ExerciceParametresSinusoide): number {
  return valeurRationnelPiLocal(exercice.B);
}

/** Déphasage φ du cours (constante de l'argument ωx + φ) = C = −ω·Φ — accepté modulo 2π. */
export function cibleDephasagePhase(exercice: ExerciceParametresSinusoide): number {
  return valeurRationnelPiLocal(exercice.C);
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

/** Diagnostic d'UNE saisie pour l'écran `phase` — source unique pour le score (session) ET pour le
 * message d'erreur affiché (appli) : Φ accepté à une période près, φ à 2π près, le reste à ±0,01. */
export function diagnostiquerPhaseParametresSinusoide(exercice: ExerciceParametresSinusoide, phase: PhaseParametresSinusoide, texte: string): StatutVerification {
  switch (phase) {
    case "amplitude":
      return diagnostiquerValeurSinusoide(texte, cibleAmplitude(exercice));
    case "pulsation":
      return diagnostiquerValeurSinusoide(texte, ciblePulsation(exercice));
    case "periode":
      return diagnostiquerValeurSinusoide(texte, ciblePeriode(exercice));
    case "frequence":
      return diagnostiquerValeurSinusoide(texte, cibleFrequence(exercice));
    case "dephasage":
      return diagnostiquerValeurModulo(texte, cibleDephasagePhase(exercice), 2 * Math.PI);
    case "phi":
      return diagnostiquerValeurModulo(texte, cibleDecalageHorizontal(exercice), ciblePeriode(exercice));
    case "decalage":
      return diagnostiquerValeurSinusoide(texte, cibleDecalage(exercice));
  }
}
