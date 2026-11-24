import type { ExerciceFamilleC, ZoneVennTrois } from "../core6e/probabilitesEnsembles.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { diagnostiquerProbabilite } from "./verificationProbabilites";

/**
 * Couche B (6e) — vérification de la famille C de `6gen30` (diagramme de Venn à trois ensembles).
 * Toutes les quantités se calculent depuis les effectifs ENTIERS des 8 zones (`zones`).
 *
 * Écrans (champs dans cet ordre) :
 * - `cEcran1` (du centre vers les intersections) : n(A∩B∩C), puis « A et B seulement »,
 *   « A et C seulement », « B et C seulement » (zones 111, 110, 101, 011) ;
 * - `cEcran2` (zones d'un seul ensemble, puis l'extérieur) : zones 100, 010, 001, 000 ;
 * - `cEcran3` : la probabilité demandée (réunion, « exactement un », « au moins deux ») ;
 * - `cEcran4` : la probabilité conditionnelle.
 * Effectifs : un entier (espaces de milliers et « − – — » lus) ; une saisie qui n'est pas un entier
 * est ILLISIBLE (`parse_error`), jamais jugée fausse.
 */

export const ZONES_ECRAN1_C: readonly ZoneVennTrois[] = ["111", "110", "101", "011"];
export const ZONES_ECRAN2_C: readonly ZoneVennTrois[] = ["100", "010", "001", "000"];
export const NOMS_C = ["A", "B", "C"] as const;

function dans(zone: ZoneVennTrois, i: number): boolean {
  return zone[i] === "1";
}

function somme(e: ExerciceFamilleC, filtre: (z: ZoneVennTrois) => boolean): number {
  return (Object.keys(e.zones) as ZoneVennTrois[]).filter(filtre).reduce((acc, z) => acc + e.zones[z], 0);
}

/** n(X) pour X = A, B, C (indice 0, 1, 2). */
export function effectifEnsembleC(e: ExerciceFamilleC, i: number): number {
  return somme(e, (z) => dans(z, i));
}

/** n(X ∩ Y) (les deux zones qui contiennent X et Y : « X et Y seulement » et le centre). */
export function effectifInterC(e: ExerciceFamilleC, i: number, j: number): number {
  return somme(e, (z) => dans(z, i) && dans(z, j));
}

export function nombreEnsembles(z: ZoneVennTrois): number {
  return [...z].filter((c) => c === "1").length;
}

/** Zones de la demande de l'écran 3 (numérateur). */
export function zonesDemandeC(e: ExerciceFamilleC): ZoneVennTrois[] {
  const toutes = Object.keys(e.zones) as ZoneVennTrois[];
  if (e.demandeEcran3 === "union") return toutes.filter((z) => z !== "000");
  if (e.demandeEcran3 === "exactementUn") return toutes.filter((z) => nombreEnsembles(z) === 1);
  return toutes.filter((z) => nombreEnsembles(z) >= 2);
}

/** Numérateur et dénominateur (effectifs) de la probabilité de l'écran 3. */
export function fractionEcran3C(e: ExerciceFamilleC): [number, number] {
  return [zonesDemandeC(e).reduce((acc, z) => acc + e.zones[z], 0), e.total];
}

/** Zones de la condition et de l'intersection « événement ∩ condition » de l'écran 4. */
export function zonesConditionnelleC(e: ExerciceFamilleC): { condition: ZoneVennTrois[]; favorables: ZoneVennTrois[] } {
  const toutes = Object.keys(e.zones) as ZoneVennTrois[];
  const c = e.conditionnelle;
  const condition = c.type === "XsachantNonY" ? toutes.filter((z) => !dans(z, c.y)) : toutes.filter((z) => nombreEnsembles(z) >= 2);
  return { condition, favorables: condition.filter((z) => dans(z, c.x)) };
}

export function fractionEcran4C(e: ExerciceFamilleC): [number, number] {
  const { condition, favorables } = zonesConditionnelleC(e);
  const n = (zs: ZoneVennTrois[]) => zs.reduce((acc, z) => acc + e.zones[z], 0);
  return [n(favorables), n(condition)];
}

function diagnostiquerEffectif(texte: string, attendu: number): StatutVerification {
  const propre = normaliserSigneMoins(texte).replace(/[\s  ]/g, "");
  if (!/^-?\d+$/.test(propre)) return "parse_error";
  return Number(propre) === attendu ? "correct" : "not_equivalent";
}

function pireStatut(statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function statutsChampsC(e: ExerciceFamilleC, phase: "cEcran1" | "cEcran2" | "cEcran3" | "cEcran4", valeurs: string[]): StatutVerification[] {
  if (phase === "cEcran1") return ZONES_ECRAN1_C.map((z, i) => diagnostiquerEffectif(valeurs[i] ?? "", e.zones[z]));
  if (phase === "cEcran2") return ZONES_ECRAN2_C.map((z, i) => diagnostiquerEffectif(valeurs[i] ?? "", e.zones[z]));
  const [n, d] = phase === "cEcran3" ? fractionEcran3C(e) : fractionEcran4C(e);
  return [diagnostiquerProbabilite(valeurs[0] ?? "", n / d)];
}

export function diagnostiquerEcranC(e: ExerciceFamilleC, phase: "cEcran1" | "cEcran2" | "cEcran3" | "cEcran4", valeurs: string[]): StatutVerification {
  return pireStatut(statutsChampsC(e, phase, valeurs));
}
