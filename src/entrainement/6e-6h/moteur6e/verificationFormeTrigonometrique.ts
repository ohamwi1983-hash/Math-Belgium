import type { ConditionD, ExerciceFormeTrigA, ExerciceFormeTrigB, ExerciceFormeTrigC, ExerciceFormeTrigD, ExerciceFormeTrigE, ExerciceFormeTrigonometrique } from "../core6e/formeTrigonometrique.types";
import { diagnostiquerAngle, diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
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
 * (`moteur6e/verificationComplexes.ts`, `6gen34`) pour le SEUL champ "a+bi" de ce générateur
 * (famille C écran 3 — voir en-tête `core6e/formeTrigonometrique.types.ts` pour
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

/** Tout champ θ est comparé à 2kπ près (audit 6e ch. 5, point 3/B) — θ + 2π, une valeur dans
 * [0 ; 2π[ ou nθ non réduit sont acceptés ; seul `cEcran2` exige ]−π ; π], et ce refus-là passe par
 * `controleAvantSoumission` (message sans tentative), jamais par ce statut. */
function angle(texte: string, cible: number): StatutVerification {
  return diagnostiquerAngle(texte, cible).statut;
}

// ============================================================================
// Famille A.
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceFormeTrigA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.r);
}
export function diagnostiquerAEcran2(exercice: ExerciceFormeTrigA, valeurs: string[]): StatutVerification {
  return angle(valeurs[0], exercice.angle.numerique);
}

// ============================================================================
// Famille B — écran 1 : 4 champs (produit/quotient) ou 2 champs (puissance) ; écran 2 : 2 champs
// pour tous les sous-types.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceFormeTrigB, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "puissance") {
    return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.z.r), angle(valeurs[1], exercice.z.angle.numerique));
  }
  return combinerStatuts(
    diagnostiquerValeur(valeurs[0], exercice.z1.r),
    angle(valeurs[1], exercice.z1.angle.numerique),
    diagnostiquerValeur(valeurs[2], exercice.z2.r),
    angle(valeurs[3], exercice.z2.angle.numerique),
  );
}
export function diagnostiquerBEcran2(exercice: ExerciceFormeTrigB, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.rResultat), angle(valeurs[1], exercice.angleResultat.numerique));
}

// ============================================================================
// Famille C — écran 1/2 : 2 champs réels (r,θ) ; écran 3 : 1 champ a+bi (rationnel garanti, voir
// en-tête `core6e/formeTrigonometrique.types.ts`).
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceFormeTrigC, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.r), angle(valeurs[1], exercice.angle.numerique));
}
export function diagnostiquerCEcran2(exercice: ExerciceFormeTrigC, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.rFinal), angle(valeurs[1], exercice.angleFinal.numerique));
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
  return angle(valeurs[0], exercice.z.angle.numerique);
}
/** `valeurs[0]` est l'identifiant du choix sélectionné (un des 4 de `OPTIONS_CONDITION_D`) — jamais
 * de `parse_error` possible (bouton, pas de saisie libre), seulement `correct`/`not_equivalent`. */
export function diagnostiquerDEcran2(exercice: ExerciceFormeTrigD, valeurs: string[]): StatutVerification {
  return valeurs[0] === exercice.condition ? "correct" : "not_equivalent";
}
/** Entier lu dans un champ, `null` si illisible, `NaN` si la valeur n'est pas entière. */
function lireEntier(texte: string): number | null {
  const v = evaluerValeurExponentielle(texte);
  if (v === null) return null;
  return Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : Number.NaN;
}
/** Écran 3 : solutions n = k + m·p, p ∈ ℤ (audit 6e ch. 5, point 7/G) — tout k′ ≡ k (mod m) est
 * accepté (k = 5 ou k = −7 pour m = 12 décrivent le même ensemble), m au signe près. */
export function diagnostiquerDEcran3(exercice: ExerciceFormeTrigD, valeurs: string[]): StatutVerification {
  const k = lireEntier(valeurs[0]);
  const m = lireEntier(valeurs[1]);
  if (k === null || m === null) return "parse_error";
  const { k: kAttendu, m: mAttendu } = exercice.congruence;
  if (Number.isNaN(m) || Math.abs(m) !== mAttendu) return "not_equivalent";
  if (Number.isNaN(k)) return "not_equivalent";
  return (((k - kAttendu) % mAttendu) + mAttendu) % mAttendu === 0 ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille E — écran 1 : 1 champ (angle résultant) ; écran 2 : cos et sin de cet angle, 2 champs
// réels séparés (valeurs exactes (±√6 ± √2)/4 — refonte audit 6e ch. 5, décision E).
// ============================================================================

export function diagnostiquerEEcran1(exercice: ExerciceFormeTrigE, valeurs: string[]): StatutVerification {
  return angle(valeurs[0], exercice.angleResultat.numerique);
}
export function diagnostiquerEEcran2(exercice: ExerciceFormeTrigE, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.cosResultat.numerique, 0.001), diagnostiquerValeur(valeurs[1], exercice.sinResultat.numerique, 0.001));
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
  }
}

export function verifierEcran(exercice: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}

// ============================================================================
// Contrôle AVANT soumission — messages qui ne consomment AUCUNE tentative (audit 6e ch. 5, points
// 3/B et 10) : saisie illisible, angle en degrés, nθ juste mais non réduit alors que la consigne de
// `cEcran2` exige ]−π ; π], valeur approchée ou cos/sin recopié là où une valeur exacte est demandée.
// ============================================================================

const SANS_TENTATIVE = " Ta saisie ne compte pas comme une tentative.";

/** Indices des champs θ de chaque écran, avec l'angle attendu. */
function champsAngle(exercice: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): { index: number; cible: number }[] {
  switch (phase) {
    case "aEcran2":
      return [{ index: 0, cible: (exercice as ExerciceFormeTrigA).angle.numerique }];
    case "bEcran1": {
      const e = exercice as ExerciceFormeTrigB;
      if (e.sousType === "puissance") return [{ index: 1, cible: e.z.angle.numerique }];
      return [{ index: 1, cible: e.z1.angle.numerique }, { index: 3, cible: e.z2.angle.numerique }];
    }
    case "bEcran2":
      return [{ index: 1, cible: (exercice as ExerciceFormeTrigB).angleResultat.numerique }];
    case "cEcran1":
      return [{ index: 1, cible: (exercice as ExerciceFormeTrigC).angle.numerique }];
    case "cEcran2":
      return [{ index: 1, cible: (exercice as ExerciceFormeTrigC).angleFinal.numerique }];
    case "dEcran1":
      return [{ index: 0, cible: (exercice as ExerciceFormeTrigD).z.angle.numerique }];
    case "eEcran1":
      return [{ index: 0, cible: (exercice as ExerciceFormeTrigE).angleResultat.numerique }];
    default:
      return [];
  }
}

export function controleAvantSoumission(exercice: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique, valeurs: string[]): string | null {
  if (phase === "dEcran2") return null;
  if (diagnostiquerEcran(exercice, phase, valeurs) === "parse_error") {
    return "Expression non reconnue — vérifie l'écriture (par exemple 2pi/3, sqrt(2) ou 3−2i)." + SANS_TENTATIVE;
  }
  for (const { index, cible } of champsAngle(exercice, phase)) {
    const d = diagnostiquerAngle(valeurs[index], cible);
    if (d.degres) return "Exprime l'angle en radians (par exemple 60° s'écrit pi/3)." + SANS_TENTATIVE;
    if (phase === "cEcran2" && d.statut === "correct" && d.nonReduit) {
      return "Ton angle nθ est juste, mais la consigne demande de le ramener dans ]−π ; π] (ajoute ou retire un multiple de 2π)." + SANS_TENTATIVE;
    }
  }
  if (phase === "eEcran2") {
    if (valeurs.some((v) => /cos|sin/i.test(v))) return "Calcule la valeur exacte au lieu de recopier cos(…) ou sin(…)." + SANS_TENTATIVE;
    if (valeurs.some((v) => !/sqrt|√/.test(v))) return "Donne la valeur exacte, avec des racines carrées (par exemple (sqrt(6)+sqrt(2))/4), pas une valeur approchée." + SANS_TENTATIVE;
  }
  return null;
}
