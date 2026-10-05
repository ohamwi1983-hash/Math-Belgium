import type { Comparateur } from "../../core6e/inequationsExponentielles.types";

/**
 * Couche A (6e) — petites primitives PURES autour de `Comparateur`, partagées par les 5 familles
 * de `6gen10` (`inverserComparateur` porte le "sens préservé/inversé" central aux familles
 * A/D/E) — voir design decision #4 (un type/helper partagé, jamais 5 représentations ad hoc).
 */
export const COMPARATEURS: readonly Comparateur[] = [">", "<", ">=", "<="];

export function tirerComparateur(candidats: readonly Comparateur[] = COMPARATEURS): Comparateur {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

export function inverserComparateur(c: Comparateur): Comparateur {
  switch (c) {
    case ">":
      return "<";
    case "<":
      return ">";
    case ">=":
      return "<=";
    case "<=":
      return ">=";
  }
}

export function comparateurNonStrict(c: Comparateur): boolean {
  return c === ">=" || c === "<=";
}

export function comparateurVersLeBas(c: Comparateur): boolean {
  return c === "<" || c === "<=";
}

/** `gauche [c] droite` — évalué numériquement, utilisé pour la génération (construction de
 * `EnsembleReelGuide`) ET pour la cross-vérification indépendante dans les tests. */
export function estVraiPourValeur(gauche: number, c: Comparateur, droite: number): boolean {
  switch (c) {
    case ">":
      return gauche > droite;
    case "<":
      return gauche < droite;
    case ">=":
      return gauche >= droite;
    case "<=":
      return gauche <= droite;
  }
}
