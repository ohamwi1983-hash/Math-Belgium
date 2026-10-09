import type { ExerciceLoiNormaleD } from "../../core6e/loiNormale.types";
import { arrondi, tirerDecimal } from "./aleatoireDecimal";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { standardiserB } from "./familleB";
import { Phi, PhiInverse } from "./tableNormale";

/**
 * Couche A (6e) — génération + logique pure, famille D ("Générale, sens inverse") de `6gen51` —
 * MIRROIR STRUCTUREL de la famille C (mêmes 3 sous-types "cumulee"/"symetrique"/"encadree", même
 * décomposition écran1(reformuler)/écran2(lire à l'envers)), avec un écran 3 supplémentaire
 * (dé-standardisation `a=μ+z·σ`). `b` (sous-type "encadree") joue exactement le rôle de `k` en
 * famille C, mais en unités de X — standardisé via `standardiserB` (réutilisée telle quelle,
 * Couche A ↔ Couche A libre) avant d'entrer dans `Φ`.
 *
 * `standardiserB`/`Phi`/`PhiInverse` réutilisés tels quels (aucune réimplication) — seule
 * différence avec la famille C : `valeurCibleTableD`/`valeurZD` prennent `mu`/`sigma` en compte
 * pour amener `b` à sa forme standardisée avant de calculer `Φ(b_std)`.
 */

const SOUS_TYPES: ExerciceLoiNormaleD["sousType"][] = ["cumulee", "symetrique", "encadree"];

const MU_MIN = -50;
const MU_MAX = 150;
const SIGMA_MIN = 1;
const SIGMA_MAX = 20;

function tirerPCumulee(): number {
  const zCible = tirerDecimal(-3, 3, 2);
  return arrondi(Phi(zCible), 4);
}

function tirerPSymetrique(): number {
  const zCible = tirerDecimal(0.1, 3, 2);
  return arrondi(Phi(zCible) - 0.5, 4);
}

function tirerEncadree(mu: number, sigma: number): { p: number; b: number } {
  const zB = tirerDecimal(0.5, 2.5, 2);
  const ecart = tirerDecimal(0.2, 3, 2);
  const zCible = Math.max(-3, zB - ecart);
  const p = arrondi(Phi(zB) - Phi(zCible), 4);
  const b = arrondi(mu + zB * sigma, 2);
  return { p, b };
}

export function construireFamilleD(): ExerciceLoiNormaleD {
  const sousType = tirerParmi(SOUS_TYPES);
  const mu = tirerDecimal(MU_MIN, MU_MAX, 2);
  const sigma = tirerDecimal(SIGMA_MIN, SIGMA_MAX, 2);
  if (sousType === "cumulee") return { famille: "D", sousType, mu, sigma, p: tirerPCumulee() };
  if (sousType === "symetrique") return { famille: "D", sousType, mu, sigma, p: tirerPSymetrique() };
  const { p, b } = tirerEncadree(mu, sigma);
  return { famille: "D", sousType, mu, sigma, p, b };
}

/** La valeur cible `Φ(t)=...` à chercher dans la table, après reformulation — écran 1 (mirroir
 * `valeurCibleTableC`, "encadree" utilise `b` standardisé au lieu de `k`). */
export function valeurCibleTableD(e: ExerciceLoiNormaleD): number {
  if (e.sousType === "cumulee") return e.p;
  if (e.sousType === "symetrique") return e.p + 0.5;
  return Phi(standardiserB(e.b, e.mu, e.sigma)) - e.p;
}

/** `z` tel que `Φ(z)` égale la cible correcte de l'écran 1 — écran 2 (mirroir `valeurTC`). */
export function valeurZD(e: ExerciceLoiNormaleD): number {
  return PhiInverse(valeurCibleTableD(e));
}

/** Dé-standardisation `a=μ+z·σ` — écran 3, à partir du `z` CORRECT de l'écran 2. */
export function destandardiserD(e: ExerciceLoiNormaleD, z: number): number {
  return e.mu + z * e.sigma;
}
