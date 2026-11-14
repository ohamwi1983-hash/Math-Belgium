import type { ExerciceEchellesLogarithmiques } from "../core6e/echellesLogarithmiques.types";
import { typeQuestion } from "../core6e/echellesLogarithmiques.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import type { PhaseEchelles } from "./typesEchellesLogarithmiques";

/**
 * Couche B (6e) — vérification de `6gen90`. N'importe rien de `generateurs6e/`. Toutes les valeurs
 * attendues viennent de `modeleEchelles` (source UNIQUE : écran, récapitulatif, corrigé et barème
 * en dérivent). La saisie passe par `diagnostiquerValeur` (expressions exactes acceptées :
 * « 10*log(2) », « 10^(2,7) », fractions, virgule décimale) ; « 1 000 000 » (espaces des milliers)
 * se lit 1000000.
 *
 * Tolérances : écart sur l'échelle (type « facteur ») demandé exact ou au centième → 0,006 ;
 * logarithme d'un rapport (décimal exact) → 0,001 ; réponse finale arrondie à 10^(−d) → 0,6·10^(−d)
 * (l'arrondi annoncé, plus une marge pour un écart intermédiaire arrondi au centième) ; nombre
 * entier de sources → comparaison entière.
 */

export interface ModeleEchelles {
  /** Écart sur l'échelle (> 0) ou logarithme du rapport. */
  calcul: number;
  /** Réponse en contexte (valeur exacte, avant arrondi). */
  reponse: number;
  /** Nombre de décimales demandées pour la réponse. */
  decimalesReponse: number;
  tolerances: { calcul: number; reponse: number };
}

/** Coefficient c de l'écart sur l'échelle pour un facteur k : écart = c·log(k). */
export function coefficientFacteur(e: ExerciceEchellesLogarithmiques): number {
  switch (e.variante) {
    case "db-sources":
    case "db-reduire":
    case "db-combien":
      return 10;
    case "seisme-magnitude":
      return 1 / 1.5;
    case "etoiles-magnitude":
      return 2.5;
    default:
      return 1;
  }
}

/** Coefficient c' du logarithme du rapport pour un écart Δ sur l'échelle : log(rapport) = c'·Δ. */
export function coefficientRapport(e: ExerciceEchellesLogarithmiques): number {
  switch (e.variante) {
    case "db-comparer":
    case "db-combien":
      return 0.1;
    case "seisme-energie":
      return 1.5;
    case "etoiles-eclat":
      return 0.4;
    default:
      return 1;
  }
}

/** Signe de l'effet sur l'échelle (type « facteur ») : +1 si le niveau augmente. */
export function signeFacteur(e: ExerciceEchellesLogarithmiques): number {
  if (e.variante === "db-reduire") return -1;
  if (e.variante === "etoiles-magnitude") return e.sens === "moins" ? 1 : -1;
  return 1;
}

function arrondi(x: number, d: number): number {
  const f = 10 ** d;
  return Math.round(x * f) / f;
}

/** Écart Δ (> 0) entre les deux valeurs de l'échelle, débarrassé des erreurs flottantes. */
export function ecartEchelle(e: ExerciceEchellesLogarithmiques): number {
  return arrondi(e.v2 - e.v1, 6);
}

export function modeleEchelles(e: ExerciceEchellesLogarithmiques): ModeleEchelles {
  const type = typeQuestion(e.variante);
  if (type === "facteur") {
    const calcul = coefficientFacteur(e) * Math.log10(e.k);
    const d = e.variante === "ph-diluer" || e.variante === "etoiles-magnitude" ? 2 : 1;
    return { calcul, reponse: e.v1 + signeFacteur(e) * calcul, decimalesReponse: d, tolerances: { calcul: 0.006, reponse: 0.6 * 10 ** -d } };
  }
  const calcul = arrondi(coefficientRapport(e) * ecartEchelle(e), 6);
  const rapport = Number.isInteger(calcul) ? 10 ** calcul : Math.pow(10, calcul);
  if (type === "combien") {
    return { calcul, reponse: Math.ceil(rapport - 1e-9), decimalesReponse: 0, tolerances: { calcul: 0.001, reponse: 0.01 } };
  }
  const d = rapport < 100 ? 1 : 0;
  return { calcul, reponse: rapport, decimalesReponse: d, tolerances: { calcul: 0.001, reponse: 0.6 * 10 ** -d } };
}

/** Identifiant de l'option correcte de l'écran « traduire » : toujours l'option canonique 0. */
export const ID_TRADUIRE_CORRECT = "0";

export function diagnostiquerEcran(e: ExerciceEchellesLogarithmiques, phase: PhaseEchelles, valeurs: string[]): StatutVerification {
  const texte = valeurs[0] ?? "";
  if (phase === "traduire") return texte === ID_TRADUIRE_CORRECT ? "correct" : "not_equivalent";
  const m = modeleEchelles(e);
  const sansMilliers = texte.replace(/(\d)[\s  ]+(?=\d{3}(?!\d))/g, "$1");
  return diagnostiquerValeur(sansMilliers, m[phase], m.tolerances[phase]);
}

export function verifierEcran(e: ExerciceEchellesLogarithmiques, phase: PhaseEchelles, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}
