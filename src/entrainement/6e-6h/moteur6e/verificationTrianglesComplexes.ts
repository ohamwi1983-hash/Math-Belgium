import type { ExerciceTrianglesA, ExerciceTrianglesB, ExerciceTrianglesC, ExerciceTrianglesD, ExerciceTrianglesE, ExerciceTrianglesComplexes } from "../core6e/trianglesComplexes.types";
import { diagnostiquerAngle, diagnostiquerValeur } from "./equivalenceExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerComplexe } from "./verificationComplexes";
import type { PhaseTrianglesComplexes } from "./typesTrianglesComplexes";

/**
 * Tolérance décimale pour les angles de la famille B (loi des cosinus, angles non remarquables —
 * voir en-tête `generateurs6e/trianglesComplexes/familleB.ts`). Audit 6e ch. 5, point 7
 * (décision G) : 0,1° refusait un arrondi au dixième honnête (73,7 pour 73,74) — 0,5°, avec une
 * consigne « arrondis au dixième de degré ». Dupliquée ICI (Couche B) plutôt qu'importée de la
 * constante homonyme de `familleB.ts` (Couche A) — `moteur6e/` n'importe jamais `generateurs6e/`.
 */
export const TOLERANCE_ANGLE_DEGRES_PARTAGEE = 0.5;

/**
 * Couche B (6e) — vérification propre à `6gen41` (dispatch par famille/écran). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md).
 *
 * `diagnostiquerComplexe` (champs a+bi : multiplicateur D, quotient E) ; `diagnostiquerValeur` pour
 * tout champ réel (longueurs — `sqrt(n)` accepté —, rapport, angles en degrés) ;
 * `diagnostiquerAngle` pour l'angle en radians de la famille D (à 2kπ près — audit 6e ch. 5,
 * point 7). Les écrans de CHOIX comparent l'identifiant sélectionné à la valeur attendue — jamais de
 * `parse_error` possible (bouton, pas de saisie libre).
 */

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function diagnostiquerChoix(valeur: string, cible: string): StatutVerification {
  return valeur === cible ? "correct" : "not_equivalent";
}

// Famille A.
export function diagnostiquerAEcran1(e: ExerciceTrianglesA, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], e.AB.numerique), diagnostiquerValeur(valeurs[1], e.AC.numerique), diagnostiquerValeur(valeurs[2], e.BC.numerique));
}
export function diagnostiquerAEcran2(e: ExerciceTrianglesA, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], e.sommetIsocele);
}
export function diagnostiquerAEcran3(e: ExerciceTrianglesA, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], e.sommetRectangle);
}

// Famille B.
export function diagnostiquerBEcran1(e: ExerciceTrianglesB, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], e.OA.numerique), diagnostiquerValeur(valeurs[1], e.OB.numerique), diagnostiquerValeur(valeurs[2], e.AB.numerique));
}
export function diagnostiquerBEcran2(e: ExerciceTrianglesB, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], e.sommetIsocele);
}
export function diagnostiquerBEcran3(e: ExerciceTrianglesB, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], e.sommetRectangle);
}
/** Angles en O, A, B (degrés), tolérance 0,5°. */
export function diagnostiquerBEcran4(e: ExerciceTrianglesB, valeurs: string[]): StatutVerification {
  return combinerStatuts(
    diagnostiquerValeur(valeurs[0], e.anglesDeg.O, TOLERANCE_ANGLE_DEGRES_PARTAGEE),
    diagnostiquerValeur(valeurs[1], e.anglesDeg.A, TOLERANCE_ANGLE_DEGRES_PARTAGEE),
    diagnostiquerValeur(valeurs[2], e.anglesDeg.B, TOLERANCE_ANGLE_DEGRES_PARTAGEE),
  );
}

// Famille C.
export function diagnostiquerCEcran1(e: ExerciceTrianglesC, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], e.cote), diagnostiquerValeur(valeurs[1], e.cote), diagnostiquerValeur(valeurs[2], e.cote));
}
/** Les 3 distances AO, AB, AF (formes radicales acceptées). */
export function diagnostiquerCEcran2(e: ExerciceTrianglesC, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], e.AO.numerique), diagnostiquerValeur(valeurs[1], e.AB.numerique), diagnostiquerValeur(valeurs[2], e.AF.numerique));
}
/** Verdict (écran séparé, une seule tentative) : "equidistant" ou "non". */
export function diagnostiquerCEcran3(e: ExerciceTrianglesC, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], e.equidistant ? "equidistant" : "non");
}

// Famille D.
export function diagnostiquerDEcran1(e: ExerciceTrianglesD, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], e.rapport), diagnostiquerAngle(valeurs[1], e.angleNumerique).statut);
}
/** "coherent" si D est l'image de B par la même similitude, "incoherent" sinon (≈ 1 fois sur 3). */
export function diagnostiquerDEcran2(e: ExerciceTrianglesD, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], e.coherent ? "coherent" : "incoherent");
}
export function diagnostiquerDEcran3(e: ExerciceTrianglesD, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], { re: e.multiplicateurRe, im: e.multiplicateurIm });
}

// Famille E.
export function diagnostiquerEEcran1(e: ExerciceTrianglesE, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], { re: e.quotientRe, im: e.quotientIm });
}
export function diagnostiquerEEcran2(e: ExerciceTrianglesE, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], e.position);
}

// Dispatcher générique.
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
    case "cEcran3":
      return diagnostiquerCEcran3(exercice as ExerciceTrianglesC, valeurs);
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceTrianglesD, valeurs);
    case "dEcran2":
      return diagnostiquerDEcran2(exercice as ExerciceTrianglesD, valeurs);
    case "dEcran3":
      return diagnostiquerDEcran3(exercice as ExerciceTrianglesD, valeurs);
    case "eEcran1":
      return diagnostiquerEEcran1(exercice as ExerciceTrianglesE, valeurs);
    case "eEcran2":
      return diagnostiquerEEcran2(exercice as ExerciceTrianglesE, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
