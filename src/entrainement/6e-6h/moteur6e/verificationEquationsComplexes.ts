import type {
  ExerciceEquationsComplexes,
  ExerciceFamilleAAvecBarre,
  ExerciceFamilleASansBarre,
  ExerciceFamilleB,
  ExerciceFamilleC,
  ExerciceFamilleD,
  ExerciceFamilleE,
  ExerciceFamilleF,
  IdEquationDeveloppeeB,
  IdEquationEnU,
  IdSystemeA,
} from "../core6e/equationsComplexes.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEquivalenceFonction } from "./equivalenceExponentielle";
import { evaluerValeurComplexe } from "./expressionComplexe";
import { TOLERANCE_COMPLEXE, diagnostiquerComplexe } from "./verificationComplexes";
import type { Complexe } from "./verificationComplexes";
import type { PhaseEquationsComplexes } from "./typesEquationsComplexes";

/**
 * Couche B (6e) — vérification propre à `6gen36` (dispatch par famille/écran). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/equationsComplexes/session.integration.test.ts` pour le seul fichier autorisé
 * Couche A + Couche B ensemble. Toute la comparaison numérique d'UN complexe est déléguée à
 * `diagnostiquerComplexe` (`moteur6e/verificationComplexes.ts`, LA fondation chapitre 7, importée
 * comme prescrit).
 *
 * ============================================================================
 * **Écrans QCM (aAvecEcran1, bEcran1, eEcran1) — pas de "saisie libre", donc pas de
 * `StatutVerification`** — même patron que `verificationAffixesRacines.ts` (`bEcran1`/`cEcran1`,
 * 6gen35) : l'id soumis vient TOUJOURS d'un bouton, jamais "parse_error" possible.
 * ============================================================================
 *
 * ============================================================================
 * **`diagnostiquerEnsembleComplexe` — wrapper local "ensemble de N racines, ordre indifférent"**
 * ============================================================================
 * `verificationComplexes.ts` anticipe EXPLICITEMENT ce besoin dans son en-tête ("un futur
 * générateur... doit écrire son propre wrapper LOCAL au-dessus de `evaluerValeurComplexe`") —
 * mirroir STRUCTUREL de `diagnostiquerRacinesCarrees` (6gen35, `verificationAffixesRacines.ts`),
 * généralisé à N cibles (2 pour C/D/eEcran2/fEcran4, 4 pour eEcran3/fEcran5) : le nombre de valeurs
 * soumises doit être EXACTEMENT `cibles.length` — soumettre un sous-ensemble, même entièrement
 * correct, retourne `"not_equivalent"`, JAMAIS `"correct"` (piège central de la spec, famille E
 * écran 3 : 2 valeurs de u donnent 4 racines en z, jamais 2).
 *
 * ============================================================================
 * **fEcran2/fEcran3 (quotient polynomial en z) — réutilise `equivalenceExponentielle.ts`
 * (chapitres 2-4), PAS `expressionComplexe.ts`**
 * ============================================================================
 * La famille F a des coefficients RÉELS de bout en bout (spec) — le quotient d'une division de
 * polynôme à coefficients réels par (z-racine réelle) reste un polynôme à coefficients réels.
 * `equivalenceExponentielle.ts` (Couche B ↔ Couche B, réutilisation libre entre générateurs du même
 * chantier — CLAUDE.md) fournit DÉJÀ la comparaison "texte à une variable" par échantillonnage
 * numérique, robuste à n'importe quelle forme algébriquement équivalente (développée ou non) —
 * exactement le besoin ici, jamais réimplémentée. `expressionComplexe.ts` ne conviendrait pas : il
 * n'a AUCUN support de variable liée (voir son en-tête, "grammaire délibérément SANS variable
 * liée").
 */

const POINTS_REELS = [-3, -1.7, 0.5, 2, 3.3, 5];

export function diagnostiquerEnsembleComplexe(textes: string[], cibles: Complexe[], tolerance: number = TOLERANCE_COMPLEXE): StatutVerification {
  if (textes.length !== cibles.length) return "not_equivalent";
  const valeurs: Complexe[] = [];
  for (const t of textes) {
    const v = evaluerValeurComplexe(t);
    if (v === null) return "parse_error";
    valeurs.push(v);
  }
  const restantes = [...cibles];
  for (const v of valeurs) {
    const index = restantes.findIndex((c) => Math.abs(c.re - v.re) <= tolerance && Math.abs(c.im - v.im) <= tolerance);
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}

/** Combine plusieurs `diagnostiquerComplexe` À POSITION FIXE (ordre significatif, contrairement à
 * `diagnostiquerEnsembleComplexe`) — `"parse_error"` prioritaire sur `"not_equivalent"`. */
function diagnostiquerChampsComplexes(valeurs: string[], cibles: Complexe[], tolerance: number = TOLERANCE_COMPLEXE): StatutVerification {
  const statuts = valeurs.map((v, i) => diagnostiquerComplexe(v, cibles[i], tolerance));
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function hornerReel(coefs: readonly number[]): (z: number) => number {
  return (z: number) => coefs.reduce((acc, c) => acc * z + c, 0);
}

// ============================================================================
// Famille A.
// ============================================================================

export function diagnostiquerASansEcran1(exercice: ExerciceFamilleASansBarre, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.z);
}
export function verifierASansEcran1(exercice: ExerciceFamilleASansBarre, valeurs: string[]): boolean {
  return diagnostiquerASansEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerAAvecEcran1(exercice: ExerciceFamilleAAvecBarre, valeurs: string[]): StatutVerification {
  void exercice;
  const choix = valeurs[0] as IdSystemeA;
  return choix === "correct" ? "correct" : "not_equivalent";
}
export function verifierAAvecEcran1(exercice: ExerciceFamilleAAvecBarre, valeurs: string[]): boolean {
  return diagnostiquerAAvecEcran1(exercice, valeurs) === "correct";
}

/** Toujours comparé à x,y,z RÉELS — indépendant du système choisi à l'écran 1. */
export function diagnostiquerAAvecEcran2(exercice: ExerciceFamilleAAvecBarre, valeurs: string[]): StatutVerification {
  return diagnostiquerChampsComplexes(valeurs, [
    { re: exercice.x, im: 0 },
    { re: exercice.y, im: 0 },
    { re: exercice.x, im: exercice.y },
  ]);
}
export function verifierAAvecEcran2(exercice: ExerciceFamilleAAvecBarre, valeurs: string[]): boolean {
  return diagnostiquerAAvecEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille B.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  void exercice;
  const choix = valeurs[0] as IdEquationDeveloppeeB;
  return choix === "correct" ? "correct" : "not_equivalent";
}
export function verifierBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.z);
}
export function verifierBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille C.
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], { re: exercice.delta, im: 0 });
}
export function verifierCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleComplexe(valeurs, exercice.racines);
}
export function verifierCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille D.
// ============================================================================

export function diagnostiquerDEcran1(exercice: ExerciceFamilleD, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], exercice.delta);
}
export function verifierDEcran1(exercice: ExerciceFamilleD, valeurs: string[]): boolean {
  return diagnostiquerDEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerDEcran2(exercice: ExerciceFamilleD, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleComplexe(valeurs, exercice.racinesDelta);
}
export function verifierDEcran2(exercice: ExerciceFamilleD, valeurs: string[]): boolean {
  return diagnostiquerDEcran2(exercice, valeurs) === "correct";
}

export function diagnostiquerDEcran3(exercice: ExerciceFamilleD, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleComplexe(valeurs, exercice.racines);
}
export function verifierDEcran3(exercice: ExerciceFamilleD, valeurs: string[]): boolean {
  return diagnostiquerDEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille E.
// ============================================================================

export function diagnostiquerEEcran1(exercice: ExerciceFamilleE, valeurs: string[]): StatutVerification {
  void exercice;
  const choix = valeurs[0] as IdEquationEnU;
  return choix === "correct" ? "correct" : "not_equivalent";
}
export function verifierEEcran1(exercice: ExerciceFamilleE, valeurs: string[]): boolean {
  return diagnostiquerEEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerEEcran2(exercice: ExerciceFamilleE, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleComplexe(valeurs, [exercice.u1, exercice.u2]);
}
export function verifierEEcran2(exercice: ExerciceFamilleE, valeurs: string[]): boolean {
  return diagnostiquerEEcran2(exercice, valeurs) === "correct";
}

/** Piège central : EXACTEMENT 4 racines attendues (2 par valeur de u), jamais 2. */
export function diagnostiquerEEcran3(exercice: ExerciceFamilleE, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleComplexe(valeurs, exercice.racines);
}
export function verifierEEcran3(exercice: ExerciceFamilleE, valeurs: string[]): boolean {
  return diagnostiquerEEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille F.
// ============================================================================

export function diagnostiquerFEcran1(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], { re: exercice.r1, im: 0 });
}
export function verifierFEcran1(exercice: ExerciceFamilleF, valeurs: string[]): boolean {
  return diagnostiquerFEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerFEcran2(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0], hornerReel(exercice.quotientCubique), POINTS_REELS, undefined, "z");
}
export function verifierFEcran2(exercice: ExerciceFamilleF, valeurs: string[]): boolean {
  return diagnostiquerFEcran2(exercice, valeurs) === "correct";
}

export function diagnostiquerFEcran3(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  const statutR2 = diagnostiquerComplexe(valeurs[0], { re: exercice.r2, im: 0 });
  const statutQuotient = diagnostiquerEquivalenceFonction(valeurs[1], hornerReel(exercice.quotientQuadratique), POINTS_REELS, undefined, "z");
  if (statutR2 === "parse_error" || statutQuotient === "parse_error") return "parse_error";
  if (statutR2 === "not_equivalent" || statutQuotient === "not_equivalent") return "not_equivalent";
  return "correct";
}
export function verifierFEcran3(exercice: ExerciceFamilleF, valeurs: string[]): boolean {
  return diagnostiquerFEcran3(exercice, valeurs) === "correct";
}

export function diagnostiquerFEcran4(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleComplexe(valeurs, [exercice.racines[2], exercice.racines[3]]);
}
export function verifierFEcran4(exercice: ExerciceFamilleF, valeurs: string[]): boolean {
  return diagnostiquerFEcran4(exercice, valeurs) === "correct";
}

export function diagnostiquerFEcran5(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleComplexe(valeurs, exercice.racines);
}
export function verifierFEcran5(exercice: ExerciceFamilleF, valeurs: string[]): boolean {
  return diagnostiquerFEcran5(exercice, valeurs) === "correct";
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aSansEcran1":
      return diagnostiquerASansEcran1(exercice as ExerciceFamilleASansBarre, valeurs);
    case "aAvecEcran1":
      return diagnostiquerAAvecEcran1(exercice as ExerciceFamilleAAvecBarre, valeurs);
    case "aAvecEcran2":
      return diagnostiquerAAvecEcran2(exercice as ExerciceFamilleAAvecBarre, valeurs);
    case "bEcran1":
      return diagnostiquerBEcran1(exercice as ExerciceFamilleB, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exercice as ExerciceFamilleB, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceFamilleC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceFamilleC, valeurs);
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceFamilleD, valeurs);
    case "dEcran2":
      return diagnostiquerDEcran2(exercice as ExerciceFamilleD, valeurs);
    case "dEcran3":
      return diagnostiquerDEcran3(exercice as ExerciceFamilleD, valeurs);
    case "eEcran1":
      return diagnostiquerEEcran1(exercice as ExerciceFamilleE, valeurs);
    case "eEcran2":
      return diagnostiquerEEcran2(exercice as ExerciceFamilleE, valeurs);
    case "eEcran3":
      return diagnostiquerEEcran3(exercice as ExerciceFamilleE, valeurs);
    case "fEcran1":
      return diagnostiquerFEcran1(exercice as ExerciceFamilleF, valeurs);
    case "fEcran2":
      return diagnostiquerFEcran2(exercice as ExerciceFamilleF, valeurs);
    case "fEcran3":
      return diagnostiquerFEcran3(exercice as ExerciceFamilleF, valeurs);
    case "fEcran4":
      return diagnostiquerFEcran4(exercice as ExerciceFamilleF, valeurs);
    case "fEcran5":
      return diagnostiquerFEcran5(exercice as ExerciceFamilleF, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
