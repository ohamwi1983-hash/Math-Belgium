import type { Arcfonction } from "../core6e/cyclometrique.types";

/**
 * Couche B (6e) — primitives de dérivation partagées par les 7 familles de `6gen4`. Chaque
 * "reference closure" `(x)=>number` de `verificationDeriveesCyclometriques.ts` compose ces deux
 * fonctions plutôt que de réécrire `1/sqrt(1-x²)`/`-1/sqrt(1-x²)`/`1/(1+x²)` à chaque famille.
 */

/** arcsin/arccos/arctan(u), en RADIANS. */
export function arcfonctionBase(arcfonction: Arcfonction, u: number): number {
  switch (arcfonction) {
    case "arcsin":
      return Math.asin(u);
    case "arccos":
      return Math.acos(u);
    case "arctan":
      return Math.atan(u);
  }
}

/** Dérivée de arcsin/arccos/arctan par rapport à son argument, évaluée en `u`. */
export function arcfonctionDeriveeBase(arcfonction: Arcfonction, u: number): number {
  switch (arcfonction) {
    case "arcsin":
      return 1 / Math.sqrt(1 - u * u);
    case "arccos":
      return -1 / Math.sqrt(1 - u * u);
    case "arctan":
      return 1 / (1 + u * u);
  }
}
