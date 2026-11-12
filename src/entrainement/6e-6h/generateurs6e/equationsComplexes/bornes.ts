/**
 * Borne commune des nombres AFFICHÉS par `6gen36` (audit 6e ch. 5, point 25 : « nombres ≤ ~100 ») :
 * les constructeurs tirent à nouveau tant qu'un coefficient de l'énoncé (ou une valeur intermédiaire
 * à calculer, comme Δ) dépasse cette borne en valeur absolue.
 */

import type { ValeurComplexe } from "../../core6e/equationsComplexes.types";

export const BORNE_NOMBRES = 100;

/** Vrai si tous les nombres (réels ou parties de complexes) sont ≤ `borne` en valeur absolue. */
export function dansLaBorne(valeurs: readonly (number | ValeurComplexe)[], borne: number = BORNE_NOMBRES): boolean {
  return valeurs.every((v) => (typeof v === "number" ? Math.abs(v) <= borne : Math.abs(v.re) <= borne && Math.abs(v.im) <= borne));
}

/** Rejoue `construire` jusqu'à obtenir un exercice accepté par `accepter`. */
export function tirerDansLaBorne<T>(construire: () => T, accepter: (e: T) => boolean): T {
  for (;;) {
    const e = construire();
    if (accepter(e)) return e;
  }
}
