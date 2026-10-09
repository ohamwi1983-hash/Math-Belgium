import type { Comparateur } from "../../core6e/inequationsLogarithmiques.types";

/**
 * Couche A (6e) — petites primitives PURES autour de `Comparateur`, partagées par les 6 familles
 * de `6gen15` — réplique `generateurs6e/inequationsExponentielles/comparateur.ts` (6gen10), même
 * principe de duplication assumée entre générateurs (voir `aleatoire.ts`).
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

/** `gauche [c] droite` — évalué numériquement, utilisé pour la génération ET la cross-vérification
 * indépendante dans les tests. */
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
