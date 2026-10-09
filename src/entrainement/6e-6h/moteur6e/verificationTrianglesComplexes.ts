import type { ExerciceTrianglesA, ExerciceTrianglesB, ExerciceTrianglesC, ExerciceTrianglesD, ExerciceTrianglesComplexes } from "../core6e/trianglesComplexes.types";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerComplexe } from "./verificationComplexes";
import type { PhaseTrianglesComplexes } from "./typesTrianglesComplexes";

/**
 * Tolérance décimale pour l'écran 4 de la famille B (angles via loi des cosinus, jamais
 * remarquables — voir en-tête `generateurs6e/trianglesComplexes/familleB.ts`). Dupliquée ICI
 * (Couche B) plutôt qu'importée de la constante homonyme de `familleB.ts` (Couche A) — la règle
 * non négociable `moteur6e/` n'importe jamais `generateurs6e/` (CLAUDE.md) s'applique aussi aux
 * simples constantes ; les 2 valeurs sont maintenues identiques et vérifiées par
 * `verificationTrianglesComplexes.test.ts`.
 */
const TOLERANCE_ANGLE_DEGRES_PARTAGEE = 0.1;

/**
 * Couche B (6e) — vérification propre à `6gen41` (dispatch par famille/écran). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/trianglesComplexes/session.integration.test.ts` pour le seul fichier autorisé
 * Couche A + Couche B ensemble.
 *
 * Réutilise TELLE QUELLE la fondation chapitre 7 : `diagnostiquerComplexe`
 * (`moteur6e/verificationComplexes.ts`, `6gen34`) pour le SEUL champ "a+bi" de ce générateur
 * (famille D écran 3, multiplicateur — TOUJOURS entier, voir en-tête `generateurs6e/
 * trianglesComplexes/familleD.ts`) ; `diagnostiquerValeur` (`moteur6e/equivalenceExponentielle.ts`,
 * chapitre 2) pour TOUT champ réel simple (longueurs, angles, rapport) — accepte nativement
 * `sqrt(...)` (nécessaire pour l'écran 2 de la famille C, seule longueur irrationnelle de ce
 * générateur — voir en-tête `core6e/trianglesComplexes.types.ts`).
 *
 * Les écrans de CHOIX (statut sommet/cohérence) comparent directement l'identifiant sélectionné à
 * la valeur attendue — jamais de `parse_error` possible (bouton, pas de saisie libre), mirroir
 * `diagnostiquerDEcran2` de `verificationFormeTrigonometrique.ts` (6gen37).
 */

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function diagnostiquerChoix(valeur: string, cible: string): StatutVerification {
  return valeur === cible ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille A.
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceTrianglesA, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.longueurAB), diagnostiquerValeur(valeurs[1], exercice.longueurAC), diagnostiquerValeur(valeurs[2], exercice.longueurBC));
}
export function diagnostiquerAEcran2(exercice: ExerciceTrianglesA, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], exercice.sommetIsocele);
}
export function diagnostiquerAEcran3(exercice: ExerciceTrianglesA, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], exercice.sommetRectangle);
}

// ============================================================================
// Famille B.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceTrianglesB, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.longueurOA), diagnostiquerValeur(valeurs[1], exercice.longueurOB), diagnostiquerValeur(valeurs[2], exercice.longueurAB));
}
export function diagnostiquerBEcran2(exercice: ExerciceTrianglesB, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], exercice.sommetIsocele);
}
export function diagnostiquerBEcran3(exercice: ExerciceTrianglesB, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], exercice.sommetRectangle);
}
/** Tolérance décimale — SEUL écran du chapitre 7 dans ce cas, voir en-tête `familleB.ts`. */
export function diagnostiquerBEcran4(exercice: ExerciceTrianglesB, valeurs: string[]): StatutVerification {
  return combinerStatuts(
    diagnostiquerValeur(valeurs[0], exercice.angleApexDeg, TOLERANCE_ANGLE_DEGRES_PARTAGEE),
    diagnostiquerValeur(valeurs[1], exercice.angleBaseDeg, TOLERANCE_ANGLE_DEGRES_PARTAGEE),
    diagnostiquerValeur(valeurs[2], exercice.angleBaseDeg, TOLERANCE_ANGLE_DEGRES_PARTAGEE),
  );
}

// ============================================================================
// Famille C.
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceTrianglesC, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.cote), diagnostiquerValeur(valeurs[1], exercice.cote), diagnostiquerValeur(valeurs[2], exercice.cote));
}
/** 3 longueurs (radicales, `sqrt(3)` typable — voir en-tête de fichier) + 1 choix de conclusion,
 * TOUJOURS "equidistant" (voir en-tête `familleC.ts`). */
export function diagnostiquerCEcran2(exercice: ExerciceTrianglesC, valeurs: string[]): StatutVerification {
  const cible = exercice.distanceCentre.numerique;
  return combinerStatuts(diagnostiquerValeur(valeurs[0], cible), diagnostiquerValeur(valeurs[1], cible), diagnostiquerValeur(valeurs[2], cible), diagnostiquerChoix(valeurs[3], "equidistant"));
}

// ============================================================================
// Famille D.
// ============================================================================

export function diagnostiquerDEcran1(exercice: ExerciceTrianglesD, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.rapport), diagnostiquerValeur(valeurs[1], exercice.angleNumerique));
}
/** Toujours "coherent" par construction (C,D construits comme images de A,B par la MÊME
 * similitude) — voir en-tête `familleD.ts` et mission 6gen41 ("aucune variante délibérément
 * incohérente décrite par le prompt source"). */
export function diagnostiquerDEcran2(_exercice: ExerciceTrianglesD, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], "coherent");
}
export function diagnostiquerDEcran3(exercice: ExerciceTrianglesD, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], { re: exercice.multiplicateurRe, im: exercice.multiplicateurIm });
}

// ============================================================================
// Dispatcher générique (mirroir 6gen37).
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aEcran1":
      return diagnostiquerAEcran1(exercice as ExerciceTrianglesA, valeurs);
    case "aEcran2":
      return diagnostiquerAEcran2(exercice as ExerciceTrianglesA, valeurs);
    case "aEcran3":
      return diagnostiquerAEcran3(exercice as ExerciceTrianglesA, valeurs);
    case "bEcran1":
      return diagnostiquerBEcran1(exercice as ExerciceTrianglesB, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exercice as ExerciceTrianglesB, valeurs);
    case "bEcran3":
      return diagnostiquerBEcran3(exercice as ExerciceTrianglesB, valeurs);
    case "bEcran4":
      return diagnostiquerBEcran4(exercice as ExerciceTrianglesB, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceTrianglesC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceTrianglesC, valeurs);
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceTrianglesD, valeurs);
    case "dEcran2":
      return diagnostiquerDEcran2(exercice as ExerciceTrianglesD, valeurs);
    case "dEcran3":
      return diagnostiquerDEcran3(exercice as ExerciceTrianglesD, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
