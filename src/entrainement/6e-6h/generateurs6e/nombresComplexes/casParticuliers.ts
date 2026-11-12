/**
 * Réglages communs de tirage de `6gen34` (audit 6e ch. 5, points 17-20) :
 * - les cas particuliers (partie nulle, résultat réel ou imaginaire pur, conjugués…) restent
 *   présents mais à ~10 % seulement — avant, chaque coefficient valait 0 une fois sur 13, si bien
 *   qu'un exercice sur trois environ était dégénéré ;
 * - toute réponse attendue est un entier ou un décimal à au plus 2 décimales (la saisie exige une
 *   forme réduite SANS « / » : un résultat en treizièmes serait impossible à écrire exactement).
 */

import { tirerEntier } from "../calculPrimitives/aleatoire";

export const PROBABILITE_CAS_PARTICULIER = 0.1;

export function tirerCasParticulier(): boolean {
  return Math.random() < PROBABILITE_CAS_PARTICULIER;
}

/** Entier non nul de [min ; max]. */
export function tirerNonNul(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = tirerEntier(min, max);
  return v;
}

/** Vrai si `x` s'écrit exactement avec au plus 2 décimales. */
export function estDecimalCourt(x: number): boolean {
  return Math.abs(Math.round(x * 100) - x * 100) < 1e-9;
}
