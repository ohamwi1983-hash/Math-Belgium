import type { ExerciceDeuxPositions, ExerciceTexteTriangleStandard, OptionReponse, RoleElement } from "../core/texteTriangle.types";
import { valeurCalcul } from "./modeleTexteTriangle";

/**
 * Vérification de gen77. Champs numériques : lecture tolérante (virgule ou point, unité éventuelle
 * recopiée en fin de champ), jamais de filtre de frappe. Statuts : « correct », « faux »,
 * « parse_error » (illisible : aucune tentative comptée).
 * - Angles intérieurs convertis (écran 2) : valeurs exactes (entiers) → tolérance absolue 0,05°.
 * - Résultats calculés (écran 4, angles candidats, distances) : tolérance de gen19/gen58,
 *   max(0,05 ; 1 % de la valeur attendue) — l'élève peut arrondir en cours de route.
 */

export type StatutChamp = "correct" | "faux" | "parse_error";

export function lireNombre(texte: string): number | null {
  const s = texte.trim().replace(/[−–—]/g, "-").replace(/\s+/g, " ");
  const m = /^([+-]?\d+(?:[.,]\d+)?)\s*(°|km|m²|m2|m)?$/i.exec(s);
  if (!m) return null;
  const v = Number(m[1]!.replace(",", "."));
  return Number.isFinite(v) ? v : null;
}

const TOLERANCE_ABSOLUE_MIN = 0.05;
const TOLERANCE_RELATIVE = 0.01;

export function diagnostiquerCalcul(texte: string, attendu: number): StatutChamp {
  const v = lireNombre(texte);
  if (v === null) return "parse_error";
  return Math.abs(v - attendu) <= Math.max(TOLERANCE_ABSOLUE_MIN, Math.abs(attendu) * TOLERANCE_RELATIVE) ? "correct" : "faux";
}

export function diagnostiquerAngleExact(texte: string, attendu: number): StatutChamp {
  const v = lireNombre(texte);
  if (v === null) return "parse_error";
  return Math.abs(v - attendu) <= 0.05 ? "correct" : "faux";
}

/** Écran 2 : un statut par angle à convertir. */
export function diagnostiquerConversions(e: ExerciceTexteTriangleStandard, saisies: string[]): StatutChamp[] {
  return e.conversions.map((c, i) => diagnostiquerAngleExact(saisies[i] ?? "", c.valeur));
}

/** Écran 4 : l'inconnue. */
export function diagnostiquerInconnue(e: ExerciceTexteTriangleStandard, saisie: string): StatutChamp {
  return diagnostiquerCalcul(saisie, valeurCalcul(e.calcul));
}

/** Deux valeurs attendues, dans n'importe quel ordre (angles candidats, distances). Chaque saisie est
 * jugée correcte si elle correspond à l'une des deux valeurs, sans que les deux visent la même. */
export function diagnostiquerPaire(saisies: [string, string], attendues: [number, number]): [StatutChamp, StatutChamp] {
  const lus = saisies.map(lireNombre);
  if (lus[0] === null || lus[1] === null) return [lus[0] === null ? "parse_error" : "faux", lus[1] === null ? "parse_error" : "faux"];
  const direct = saisies.map((s, i) => diagnostiquerCalcul(s, attendues[i]!)) as [StatutChamp, StatutChamp];
  const croise = saisies.map((s, i) => diagnostiquerCalcul(s, attendues[1 - i]!)) as [StatutChamp, StatutChamp];
  const score = (p: StatutChamp[]) => p.filter((x) => x === "correct").length;
  return score(croise) > score(direct) ? croise : direct;
}

export function diagnostiquerCandidats(e: ExerciceDeuxPositions, saisies: [string, string]): [StatutChamp, StatutChamp] {
  return diagnostiquerPaire(saisies, e.candidats);
}

export function diagnostiquerDistances(e: ExerciceDeuxPositions, saisies: [string, string]): [StatutChamp, StatutChamp] {
  return diagnostiquerPaire(saisies, e.distances);
}

/** Écran 1 (standard) : le rôle de chaque élément. */
export function verifierRoles(e: ExerciceTexteTriangleStandard, choix: (RoleElement | null)[]): boolean {
  return e.elements.every((el, i) => choix[i] === el.role);
}

export function verifierOption(options: OptionReponse[], index: number | null): boolean {
  return index !== null && options[index]?.correcte === true;
}
