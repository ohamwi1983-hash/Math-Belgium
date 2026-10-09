import type { ExerciceLoiNormale, ExerciceLoiNormaleA, ExerciceLoiNormaleB, ExerciceLoiNormaleC, ExerciceLoiNormaleD, ExerciceLoiNormaleE } from "../core6e/loiNormale.types";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseLoiNormale } from "./typesLoiNormale";

/**
 * Couche B (6e) — vérification propre à `6gen51` (dispatch par famille/écran). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/loiNormale/session.integration.test.ts` pour le seul fichier autorisé Couche A +
 * Couche B ensemble.
 *
 * Toute la logique mathématique (`Phi`/`PhiInverse`, standardisation, `probabiliteFinaleX`...) est
 * de la Couche A (`generateurs6e/loiNormale/`) — ce module ne fait QUE comparer le texte saisi à la
 * valeur numérique attendue, PASSÉE EN PARAMÈTRE par l'appelant du dispatcher générique
 * `moteur6e/sessionLoiNormale.ts` (qui, lui non plus, n'importe jamais `generateurs6e/` —
 * `verifierEcran`/`diagnostiquerEcran` prennent l'exercice ET REFONT eux-mêmes les quelques
 * calculs élémentaires strictement nécessaires — standardisation `(x-μ)/σ`, sommes/soustractions de
 * pourcentages fixes — jamais `Phi`/`PhiInverse` recalculés côté moteur : les 3 fonctions
 * `probabiliteFinaleX`/`valeurCibleTableX`/`valeurZD`/`valeurTC` etc. restent 100% Couche A ; voir
 * `session.integration.test.ts` pour la preuve que le VRAI Phi/PhiInverse de la Couche A produit
 * bien des réponses acceptées par ce module, tolérance comprise).
 *
 * ============================================================================
 * **Tolérances — cohérentes avec la précision d'une table statistique PAPIER (spec "Vérification"),
 * jamais plus strictes ni plus larges que ce qu'annoncent les consignes (`ui6e/formatLoiNormale.ts`)**
 * ============================================================================
 * - `TOLERANCE_PROBABILITE = 0,00005` — une probabilité annoncée "à 4 décimales" : demi-unité du
 *   dernier chiffre annoncé (convention standard d'arrondi), donc toute valeur dont l'arrondi à 4
 *   décimales coïncide avec la référence est acceptée.
 * - `TOLERANCE_Z = 0,005` — un z (ou un t de table) annoncé "à 2 décimales" : même convention,
 *   demi-unité du 2e chiffre après la virgule.
 * - `TOLERANCE_A` — la valeur dé-standardisée `a=μ+z·σ` (famille D, écran 3) : PAS une tolérance
 *   arbitraire supplémentaire, mais la propagation DIRECTE de `TOLERANCE_Z` à travers `σ`
 *   (`a=μ+z·σ` ⟹ une imprécision de `TOLERANCE_Z` sur `z` donne une imprécision de
 *   `TOLERANCE_Z·σ` sur `a`) — voir `tolerancePourA`.
 * - `TOLERANCE_EFFECTIF = 1` — un effectif estimé (population × probabilité, arrondi à l'entier) :
 *   ±1 personne autour de l'entier le plus proche de la référence, tolère un arrondi intermédiaire
 *   légèrement différent de la probabilité côté élève (spec : "tolérance sur l'arrondi").
 */
export const TOLERANCE_PROBABILITE = 0.00005;
export const TOLERANCE_Z = 0.005;
export const TOLERANCE_EFFECTIF = 1;

export function tolerancePourA(sigma: number): number {
  return TOLERANCE_Z * sigma;
}

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

/** Compare un champ `choix` (bouton, jamais de saisie libre) — jamais `parse_error`, mirroir
 * `diagnostiquerDEcran2` de `6gen37`. */
function diagnostiquerChoix(valeur: string, attendu: string): StatutVerification {
  return valeur === attendu ? "correct" : "not_equivalent";
}

/** Effectif estimé — arrondi à l'entier le plus proche de la référence, tolérance `±1` (voir
 * en-tête de fichier). */
export function diagnostiquerEffectif(texte: string, referenceReelle: number): StatutVerification {
  const cible = Math.round(referenceReelle);
  return diagnostiquerValeur(texte, cible, TOLERANCE_EFFECTIF + 1e-9);
}

// ============================================================================
// Famille A.
// ============================================================================

function symetrieNecessaireLocale(z: number): boolean {
  return z < 0;
}

export function diagnostiquerAEcran1(exercice: ExerciceLoiNormaleA, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "intervalle") {
    const attenduChoix1 = symetrieNecessaireLocale(exercice.z1) ? "symetrie" : "directe";
    const attenduChoix2 = symetrieNecessaireLocale(exercice.z2) ? "symetrie" : "directe";
    return combinerStatuts(
      diagnostiquerChoix(valeurs[0], attenduChoix1),
      diagnostiquerValeur(valeurs[1], Math.abs(exercice.z1), TOLERANCE_Z),
      diagnostiquerChoix(valeurs[2], attenduChoix2),
      diagnostiquerValeur(valeurs[3], Math.abs(exercice.z2), TOLERANCE_Z),
    );
  }
  const attenduChoix = symetrieNecessaireLocale(exercice.z) ? "symetrie" : "directe";
  return combinerStatuts(diagnostiquerChoix(valeurs[0], attenduChoix), diagnostiquerValeur(valeurs[1], Math.abs(exercice.z), TOLERANCE_Z));
}

export function diagnostiquerAEcran2(_exercice: ExerciceLoiNormaleA, valeurs: string[], probabiliteFinale: number): StatutVerification {
  return diagnostiquerValeur(valeurs[0], probabiliteFinale, TOLERANCE_PROBABILITE);
}

// ============================================================================
// Famille B.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceLoiNormaleB, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "intervalle") {
    return combinerStatuts(diagnostiquerValeur(valeurs[0], (exercice.x1 - exercice.mu) / exercice.sigma, TOLERANCE_Z), diagnostiquerValeur(valeurs[1], (exercice.x2 - exercice.mu) / exercice.sigma, TOLERANCE_Z));
  }
  return diagnostiquerValeur(valeurs[0], (exercice.x - exercice.mu) / exercice.sigma, TOLERANCE_Z);
}

export function diagnostiquerBEcran2(_exercice: ExerciceLoiNormaleB, valeurs: string[], probabiliteFinale: number): StatutVerification {
  return diagnostiquerValeur(valeurs[0], probabiliteFinale, TOLERANCE_PROBABILITE);
}

export function diagnostiquerBEcran3(_exercice: ExerciceLoiNormaleB, valeurs: string[], effectifReference: number): StatutVerification {
  return diagnostiquerEffectif(valeurs[0], effectifReference);
}

// ============================================================================
// Famille C.
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceLoiNormaleC, valeurs: string[], cibleTable: number): StatutVerification {
  return combinerStatuts(diagnostiquerChoix(valeurs[0], exercice.sousType), diagnostiquerValeur(valeurs[1], cibleTable, TOLERANCE_PROBABILITE));
}

export function diagnostiquerCEcran2(_exercice: ExerciceLoiNormaleC, valeurs: string[], tReference: number): StatutVerification {
  return diagnostiquerValeur(valeurs[0], tReference, TOLERANCE_Z);
}

// ============================================================================
// Famille D.
// ============================================================================

export function diagnostiquerDEcran1(exercice: ExerciceLoiNormaleD, valeurs: string[], cibleTable: number): StatutVerification {
  return combinerStatuts(diagnostiquerChoix(valeurs[0], exercice.sousType), diagnostiquerValeur(valeurs[1], cibleTable, TOLERANCE_PROBABILITE));
}

export function diagnostiquerDEcran2(_exercice: ExerciceLoiNormaleD, valeurs: string[], zReference: number): StatutVerification {
  return diagnostiquerValeur(valeurs[0], zReference, TOLERANCE_Z);
}

export function diagnostiquerDEcran3(exercice: ExerciceLoiNormaleD, valeurs: string[], aReference: number): StatutVerification {
  return diagnostiquerValeur(valeurs[0], aReference, tolerancePourA(exercice.sigma));
}

// ============================================================================
// Famille E.
// ============================================================================

export function diagnostiquerEEcran1(exercice: ExerciceLoiNormaleE, valeurs: string[]): StatutVerification {
  return combinerStatuts(diagnostiquerValeur(valeurs[0], exercice.mu, TOLERANCE_Z), diagnostiquerValeur(valeurs[1], exercice.sigma, TOLERANCE_Z));
}

export function diagnostiquerEEcran2(_exercice: ExerciceLoiNormaleE, valeurs: string[], probabiliteFinale: number): StatutVerification {
  return diagnostiquerValeur(valeurs[0], probabiliteFinale, TOLERANCE_PROBABILITE);
}

export function diagnostiquerEEcran3(_exercice: ExerciceLoiNormaleE, valeurs: string[], effectifReference: number): StatutVerification {
  return diagnostiquerEffectif(valeurs[0], effectifReference);
}

// ============================================================================
// Dispatcher générique — reçoit les valeurs de référence CALCULÉES CÔTÉ APPELANT (Couche A,
// `generateurs6e/loiNormale/`) via `ValeursReferenceLoiNormale`, jamais recalculées ici (ce module
// n'importe jamais `generateurs6e/`) — voir en-tête de fichier.
// ============================================================================

/** Toutes les valeurs de référence dérivées (Φ/Φ⁻¹...) nécessaires à la vérification d'UN écran
 * donné — calculées par l'appelant (Couche A) et transmises telles quelles. `undefined` pour les
 * écrans qui n'en ont pas besoin (calculables directement depuis `exercice`). */
export interface ValeursReferenceLoiNormale {
  probabiliteFinale?: number;
  cibleTable?: number;
  tReference?: number;
  zReference?: number;
  aReference?: number;
  effectifReference?: number;
}

export function diagnostiquerEcran(exercice: ExerciceLoiNormale, phase: PhaseLoiNormale, valeurs: string[], ref: ValeursReferenceLoiNormale): StatutVerification {
  switch (phase) {
    case "aEcran1":
      return diagnostiquerAEcran1(exercice as ExerciceLoiNormaleA, valeurs);
    case "aEcran2":
      return diagnostiquerAEcran2(exercice as ExerciceLoiNormaleA, valeurs, ref.probabiliteFinale as number);
    case "bEcran1":
      return diagnostiquerBEcran1(exercice as ExerciceLoiNormaleB, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exercice as ExerciceLoiNormaleB, valeurs, ref.probabiliteFinale as number);
    case "bEcran3":
      return diagnostiquerBEcran3(exercice as ExerciceLoiNormaleB, valeurs, ref.effectifReference as number);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceLoiNormaleC, valeurs, ref.cibleTable as number);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceLoiNormaleC, valeurs, ref.tReference as number);
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceLoiNormaleD, valeurs, ref.cibleTable as number);
    case "dEcran2":
      return diagnostiquerDEcran2(exercice as ExerciceLoiNormaleD, valeurs, ref.zReference as number);
    case "dEcran3":
      return diagnostiquerDEcran3(exercice as ExerciceLoiNormaleD, valeurs, ref.aReference as number);
    case "eEcran1":
      return diagnostiquerEEcran1(exercice as ExerciceLoiNormaleE, valeurs);
    case "eEcran2":
      return diagnostiquerEEcran2(exercice as ExerciceLoiNormaleE, valeurs, ref.probabiliteFinale as number);
    case "eEcran3":
      return diagnostiquerEEcran3(exercice as ExerciceLoiNormaleE, valeurs, ref.effectifReference as number);
  }
}

export function verifierEcran(exercice: ExerciceLoiNormale, phase: PhaseLoiNormale, valeurs: string[], ref: ValeursReferenceLoiNormale): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs, ref) === "correct";
}
