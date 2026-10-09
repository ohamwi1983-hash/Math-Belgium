import type { ConditionD, ExerciceFormeTrigA, ExerciceFormeTrigB, ExerciceFormeTrigC, ExerciceFormeTrigD, ExerciceFormeTrigE, ExerciceFormeTrigonometrique } from "../core6e/formeTrigonometrique.types";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerComplexe } from "./verificationComplexes";
import type { PhaseFormeTrigonometrique } from "./typesFormeTrigonometrique";

/**
 * Couche B (6e) — vérification propre à `6gen37` (dispatch par famille/écran). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/formeTrigonometrique/session.integration.test.ts` pour le seul fichier autorisé
 * Couche A + Couche B ensemble.
 *
 * Réutilise TELLE QUELLE la fondation chapitre 7 : `diagnostiquerComplexe`
 * (`moteur6e/verificationComplexes.ts`, `6gen34`) pour les 2 SEULS champs "a+bi" de ce générateur
 * (famille C écran 3, famille E écran 2 — voir en-tête `core6e/formeTrigonometrique.types.ts` pour
 * la raison de cette restriction) ; `diagnostiquerValeur` (`moteur6e/equivalenceExponentielle.ts`,
 * chapitre 2) pour TOUT champ réel simple (module, argument, k/m de congruence, cos/sin isolés) —
 * cet évaluateur supporte nativement `sqrt`/`pi`/les fractions, indispensable ici puisque module et
 * argument sont TRÈS SOUVENT irrationnels (√2, √3, multiples de π), à la différence des 2 champs
 * a+bi ci-dessus (toujours rationnels par construction, voir le même en-tête).
 */

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

// ============================================================================
// Famille A.
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceFormeTrigA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.r);
}
export function diagnostiquerAEcran2(exercice: ExerciceFormeTrigA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.angle.numerique);
}

// ============================================================================
// Famille B — écran 1 : 4 champs (produit/quotient) ou 2 champs (puissance) ; écran 2 : 2 champs
// pour tous les sous-types.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceFormeTrigB, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "puissance") {
    return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.z.r), diagnostiquerValeur(valeurs[1], exercice.z.angle.numerique));
  }
  return combinerStatuts(
    diagnostiquerValeur(valeurs[0], exercice.z1.r),
    diagnostiquerValeur(valeurs[1], exercice.z1.angle.numerique),
    diagnostiquerValeur(valeurs[2], exercice.z2.r),
    diagnostiquerValeur(valeurs[3], exercice.z2.angle.numerique),
  );
}
export function diagnostiquerBEcran2(exercice: ExerciceFormeTrigB, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.rResultat), diagnostiquerValeur(valeurs[1], exercice.angleResultat.numerique));
}

// ============================================================================
// Famille C — écran 1/2 : 2 champs réels (r,θ) ; écran 3 : 1 champ a+bi (rationnel garanti, voir
// en-tête `core6e/formeTrigonometrique.types.ts`).
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceFormeTrigC, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.r), diagnostiquerValeur(valeurs[1], exercice.angle.numerique));
}
export function diagnostiquerCEcran2(exercice: ExerciceFormeTrigC, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.rFinal), diagnostiquerValeur(valeurs[1], exercice.angleFinal.numerique));
}
export function diagnostiquerCEcran3(exercice: ExerciceFormeTrigC, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], { re: exercice.aFinal, im: exercice.bFinal });
}

// ============================================================================
// Famille D — écran 1 : 1 champ réel (θ) ; écran 2 : CHOIX parmi 4 conditions canoniques (jamais de
// texte libre — voir `components6e/EtapeChoixCongruenceFormeTrigonometrique.tsx`) ; écran 3 : 2
// champs réels (k,m).
// ============================================================================

/** Les 4 identifiants de choix de l'écran 2, dans l'ordre affiché — partagé avec le composant écran
 * pour que les libellés restent synchronisés avec `ui6e/formatFormeTrigonometrique.ts`. */
export const OPTIONS_CONDITION_D: ConditionD[] = ["reelPositif", "reelNegatif", "imaginairePurPositif", "imaginairePurNegatif"];

export function diagnostiquerDEcran1(exercice: ExerciceFormeTrigD, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.z.angle.numerique);
}
/** `valeurs[0]` est l'identifiant du choix sélectionné (un des 4 de `OPTIONS_CONDITION_D`) — jamais
 * de `parse_error` possible (bouton, pas de saisie libre), seulement `correct`/`not_equivalent`. */
export function diagnostiquerDEcran2(exercice: ExerciceFormeTrigD, valeurs: string[]): StatutVerification {
  return valeurs[0] === exercice.condition ? "correct" : "not_equivalent";
}
export function diagnostiquerDEcran3(exercice: ExerciceFormeTrigD, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.congruence.k), diagnostiquerValeur(valeurs[1], exercice.congruence.m));
}

// ============================================================================
// Famille E — écran 1 : 1 champ réel (angle résultant) ; écran 2 : 1 champ a+bi (rationnel garanti,
// voir en-tête `core6e/formeTrigonometrique.types.ts`) ; écran 3 : 2 champs réels (cos,sin).
// ============================================================================

export function diagnostiquerEEcran1(exercice: ExerciceFormeTrigE, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.angleResultat.numerique);
}
export function diagnostiquerEEcran2(exercice: ExerciceFormeTrigE, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0], { re: exercice.aFinal, im: exercice.bFinal });
}
export function diagnostiquerEEcran3(exercice: ExerciceFormeTrigE, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.aFinal), diagnostiquerValeur(valeurs[1], exercice.bFinal));
}

// ============================================================================
// Dispatcher générique (mirroir 6gen34).
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aEcran1":
      return diagnostiquerAEcran1(exercice as ExerciceFormeTrigA, valeurs);
    case "aEcran2":
      return diagnostiquerAEcran2(exercice as ExerciceFormeTrigA, valeurs);
    case "bEcran1":
      return diagnostiquerBEcran1(exercice as ExerciceFormeTrigB, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exercice as ExerciceFormeTrigB, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceFormeTrigC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceFormeTrigC, valeurs);
    case "cEcran3":
      return diagnostiquerCEcran3(exercice as ExerciceFormeTrigC, valeurs);
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceFormeTrigD, valeurs);
    case "dEcran2":
      return diagnostiquerDEcran2(exercice as ExerciceFormeTrigD, valeurs);
    case "dEcran3":
      return diagnostiquerDEcran3(exercice as ExerciceFormeTrigD, valeurs);
    case "eEcran1":
      return diagnostiquerEEcran1(exercice as ExerciceFormeTrigE, valeurs);
    case "eEcran2":
      return diagnostiquerEEcran2(exercice as ExerciceFormeTrigE, valeurs);
    case "eEcran3":
      return diagnostiquerEEcran3(exercice as ExerciceFormeTrigE, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
