import type { ExerciceVolumeA, ExerciceVolumeB, ExerciceVolumeC, ExerciceVolumeD, ExerciceVolumesRevolution, OrdreCourbes } from "../core6e/volumesRevolution.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEnsembleValeurs, diagnostiquerEquivalenceFonction, diagnostiquerValeur } from "./equivalenceExponentielle";
import { diagnostiquerPrimitive } from "./verificationCalculPrimitives";
import type { PhaseVolumesRevolution } from "./typesVolumesRevolution";

/**
 * Couche B (6e) — vérification pour `6gen27` ("Volumes de révolution", chapitre 4). N'importe
 * JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `verificationVolumesRevolution.test.ts` (fixtures locales factices) et
 * `generateurs6e/volumesRevolution/session.integration.test.ts` (seul fichier autorisé Couche A +
 * Couche B) pour la preuve.
 *
 * Réutilise `diagnostiquerValeur`/`diagnostiquerEquivalenceFonction`/`diagnostiquerEnsembleValeurs`
 * (`moteur6e/equivalenceExponentielle.ts`, jamais modifié — mêmes briques que 6gen23/6gen26) POUR
 * les écrans propres à ce générateur, ET `diagnostiquerPrimitive`
 * (`moteur6e/verificationCalculPrimitives.ts`, 6gen23) pour les 2 écrans "calculer la primitive de
 * f(x)² développée" (familles A/B) — comparaison À UNE CONSTANTE ADDITIVE PRÈS, RÉUTILISÉE TELLE
 * QUELLE (Couche B ↔ Couche B libre, CLAUDE.md) plutôt que réimplémentée : voir en-tête
 * `core6e/volumesRevolution.types.ts`.
 *
 * **Le π de chaque valeur finale n'exige AUCUNE gestion symbolique spéciale** :
 * `expressionExponentielle.ts` reconnaît déjà l'identifiant `pi` (=`Math.PI`) — comparer une
 * réponse élève contenant "pi" à une cible numérique `Math.PI * ...` est donc une simple
 * comparaison numérique à tolérance, exactement comme toute autre valeur de ce chantier.
 *
 * **Piège central de la famille C (écran 4)** : la cible EXACTE de l'écran 4 est calculée depuis
 * `developpe`/`primitiveDeveloppeReference` — CET exercice les construit TOUJOURS comme
 * sup(x)²−inf(x)² (jamais (sup(x)−inf(x))², voir `generateurs6e/volumesRevolution/familleC.ts`) —
 * une réponse élève calculée sur la formule INCORRECTE (sup−inf)² tombe donc, EN PRATIQUE, sur une
 * valeur numérique différente (sauf coïncidence non générique) et échoue naturellement à la
 * comparaison de tolérance — AUCUN garde-fou spécial requis en plus (contrairement à la famille C
 * de 6gen26, dont le piège nécessitait une vérification de signe explicite en plus de la valeur) ;
 * testé explicitement par `verificationVolumesRevolution.test.ts` et
 * `session.integration.test.ts`.
 */

const TOLERANCE = 0.01;
const CANDIDATS_X = [-2.7, -2.1, -1.6, -1.1, -0.6, -0.35, 0.35, 0.6, 1.1, 1.6, 2.1, 2.7];

/** Champ "choix" (ordre) — jamais de saisie libre, comparaison stricte à la valeur correcte (jamais
 * de `parse_error`, réservé aux erreurs de SYNTAXE d'une expression libre). */
function diagnostiquerChoix(soumis: string, correct: string): StatutVerification {
  return soumis === correct ? "correct" : "not_equivalent";
}

function volumeEntreBornes(a: number, b: number, primitiveDeveloppeReference: (x: number) => number): number {
  return Math.PI * (primitiveDeveloppeReference(b) - primitiveDeveloppeReference(a));
}

// ============================================================================
// Famille A — Volume par rotation d'une courbe seule, bornes données.
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceVolumeA, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.developpeReference, CANDIDATS_X);
}
export function verifierAEcran1(exercice: ExerciceVolumeA, valeurs: string[]): boolean {
  return diagnostiquerAEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerAEcran2(exercice: ExerciceVolumeA, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveDeveloppeReference, CANDIDATS_X);
}
export function verifierAEcran2(exercice: ExerciceVolumeA, valeurs: string[]): boolean {
  return diagnostiquerAEcran2(exercice, valeurs) === "correct";
}

export function diagnostiquerAEcran3(exercice: ExerciceVolumeA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], volumeEntreBornes(exercice.a, exercice.b, exercice.primitiveDeveloppeReference), TOLERANCE);
}
export function verifierAEcran3(exercice: ExerciceVolumeA, valeurs: string[]): boolean {
  return diagnostiquerAEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille B — Volume par rotation, bornes à trouver.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceVolumeB, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(valeurs, [exercice.r1, exercice.r2], TOLERANCE);
}
export function verifierBEcran1(exercice: ExerciceVolumeB, valeurs: string[]): boolean {
  return diagnostiquerBEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerBEcran2(exercice: ExerciceVolumeB, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.developpeReference, CANDIDATS_X);
}
export function verifierBEcran2(exercice: ExerciceVolumeB, valeurs: string[]): boolean {
  return diagnostiquerBEcran2(exercice, valeurs) === "correct";
}

export function diagnostiquerBEcran3(exercice: ExerciceVolumeB, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveDeveloppeReference, CANDIDATS_X);
}
export function verifierBEcran3(exercice: ExerciceVolumeB, valeurs: string[]): boolean {
  return diagnostiquerBEcran3(exercice, valeurs) === "correct";
}

export function diagnostiquerBEcran4(exercice: ExerciceVolumeB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], volumeEntreBornes(exercice.r1, exercice.r2, exercice.primitiveDeveloppeReference), TOLERANCE);
}
export function verifierBEcran4(exercice: ExerciceVolumeB, valeurs: string[]): boolean {
  return diagnostiquerBEcran4(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille C — Volume entre une courbe et une droite (piège central, voir en-tête de fichier).
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceVolumeC, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(valeurs, [exercice.r1, exercice.r2], TOLERANCE);
}
export function verifierCEcran1(exercice: ExerciceVolumeC, valeurs: string[]): boolean {
  return diagnostiquerCEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerCEcran2(exercice: ExerciceVolumeC, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], exercice.ordre);
}
export function verifierCEcran2(exercice: ExerciceVolumeC, valeurs: string[]): boolean {
  return diagnostiquerCEcran2(exercice, valeurs) === "correct";
}

export function diagnostiquerCEcran3(exercice: ExerciceVolumeC, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.developpeReference, CANDIDATS_X);
}
export function verifierCEcran3(exercice: ExerciceVolumeC, valeurs: string[]): boolean {
  return diagnostiquerCEcran3(exercice, valeurs) === "correct";
}

export function diagnostiquerCEcran4(exercice: ExerciceVolumeC, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], volumeEntreBornes(exercice.r1, exercice.r2, exercice.primitiveDeveloppeReference), TOLERANCE);
}
export function verifierCEcran4(exercice: ExerciceVolumeC, valeurs: string[]): boolean {
  return diagnostiquerCEcran4(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille D — Comparaison à un cylindre englobant.
// ============================================================================

export function diagnostiquerDEcran1(exercice: ExerciceVolumeD, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.volumeParaboloide, TOLERANCE);
}
export function verifierDEcran1(exercice: ExerciceVolumeD, valeurs: string[]): boolean {
  return diagnostiquerDEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerDEcran2(exercice: ExerciceVolumeD, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.volumeCylindre, TOLERANCE);
}
export function verifierDEcran2(exercice: ExerciceVolumeD, valeurs: string[]): boolean {
  return diagnostiquerDEcran2(exercice, valeurs) === "correct";
}

/** Rapport TOUJOURS 1/2 (propriété invariante en k,L — voir en-tête
 * `generateurs6e/volumesRevolution/familleD.ts`) — cible LITTÉRALE `0.5`, jamais recalculée depuis
 * `volumeParaboloide/volumeCylindre` (qui vaudrait la même chose, mais la valeur "1/2" est ce que
 * la spec demande de RECONNAÎTRE, pas de recalculer depuis les 2 nombres précédents à chaque
 * appel). */
export function diagnostiquerDEcran3(_exercice: ExerciceVolumeD, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], 0.5, TOLERANCE);
}
export function verifierDEcran3(exercice: ExerciceVolumeD, valeurs: string[]): boolean {
  return diagnostiquerDEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Dispatcher générique (voir en-tête de fichier).
// ============================================================================

/** UNE SEULE fonction de vérification par écran, quel que soit `exercice.famille`/`phase` — mirroir
 * 6gen26 (`verificationCalculAires.ts`). */
export function diagnostiquerEcran(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aEcran1":
      return diagnostiquerAEcran1(exercice as ExerciceVolumeA, valeurs);
    case "aEcran2":
      return diagnostiquerAEcran2(exercice as ExerciceVolumeA, valeurs);
    case "aEcran3":
      return diagnostiquerAEcran3(exercice as ExerciceVolumeA, valeurs);
    case "bEcran1":
      return diagnostiquerBEcran1(exercice as ExerciceVolumeB, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exercice as ExerciceVolumeB, valeurs);
    case "bEcran3":
      return diagnostiquerBEcran3(exercice as ExerciceVolumeB, valeurs);
    case "bEcran4":
      return diagnostiquerBEcran4(exercice as ExerciceVolumeB, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceVolumeC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceVolumeC, valeurs);
    case "cEcran3":
      return diagnostiquerCEcran3(exercice as ExerciceVolumeC, valeurs);
    case "cEcran4":
      return diagnostiquerCEcran4(exercice as ExerciceVolumeC, valeurs);
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceVolumeD, valeurs);
    case "dEcran2":
      return diagnostiquerDEcran2(exercice as ExerciceVolumeD, valeurs);
    case "dEcran3":
      return diagnostiquerDEcran3(exercice as ExerciceVolumeD, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}

export type { OrdreCourbes };
