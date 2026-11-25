import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import { lirePourcent, lireValeurVA } from "./lectureVariablesAleatoires";

/**
 * Jugement commun d'une valeur saisie (6gen116–6gen122). La saisie est LUE avant tout verdict :
 * illisible → `parse_error` (aucune tentative, l'écran le dit). Une valeur est juste si elle tombe à
 * `tol` près d'une des références (la lecture de la table ET la valeur exacte de la calculatrice,
 * quand elles diffèrent : l'élève qui suit le cours n'est jamais refusé, l'audit G13 l'interdit).
 */

export interface OptionsValeur {
  /** Écart admis autour de chaque référence. */
  tol: number;
  /** Réponse demandée en pourcentage : « 95,4 », « 95,4 % » et « 0,954 » sont lus. */
  pourcent?: boolean;
}

/** Valeurs candidates de la saisie (deux lectures pour un pourcentage sans « % »). */
export function valeursLues(brut: string, pourcent = false): number[] | null {
  if (pourcent) return lirePourcent(brut);
  const lu = lireValeurVA(brut);
  return lu ? [lu.v] : null;
}

export function proche(brut: string, refs: number[], o: OptionsValeur): boolean {
  const vals = valeursLues(brut, o.pourcent);
  if (!vals) return false;
  return vals.some((v) => refs.some((r) => Math.abs(v - r) <= o.tol + 1e-9));
}

export function statutValeur(brut: string, refs: number[], o: OptionsValeur): StatutVerification {
  if (!valeursLues(brut, o.pourcent)) return "parse_error";
  return proche(brut, refs, o) ? "correct" : "not_equivalent";
}

/**
 * Décimal écrit avec MOINS de `decMin` décimales, proche d'une référence (à `ecart` près) mais pas
 * juste : valeur trop arrondie → message, AUCUNE tentative.
 */
export function tropArrondie(brut: string, refs: number[], o: OptionsValeur & { decMin: number; ecart: number; message: string }): string | null {
  const lu = lireValeurVA(brut);
  if (!lu || lu.dec === null || lu.dec >= o.decMin) return null;
  if (proche(brut, refs, o)) return null;
  const vals = valeursLues(brut, o.pourcent) ?? [];
  return vals.some((v) => refs.some((r) => Math.abs(v - r) <= o.ecart)) ? o.message : null;
}

/** Le premier piège (valeur fausse typique) que la saisie désigne, ou `null`. */
export function piegeDesigne<M>(brut: string, juste: number[], pieges: { x: number; message: M }[], o: OptionsValeur): M | null {
  if (proche(brut, juste, o)) return null;
  for (const p of pieges) if (!juste.some((j) => Math.abs(j - p.x) <= o.tol + 1e-9) && proche(brut, [p.x], o)) return p.message;
  return null;
}
