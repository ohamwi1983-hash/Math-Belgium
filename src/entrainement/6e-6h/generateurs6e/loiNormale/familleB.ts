import type { ExerciceLoiNormaleB } from "../../core6e/loiNormale.types";
import { arrondi, tirerDecimal } from "./aleatoireDecimal";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { Phi } from "./tableNormale";

/**
 * Couche A (6e) — génération + logique pure, famille B ("Générale N(μ,σ), sens direct + estimation
 * d'effectif") de `6gen51`. Réutilise `Phi` (`tableNormale.ts`) comme famille A — voir en-tête
 * `familleA.ts` pour la séparation écran1 (standardisation)/écran2 (probabilité, calculée
 * directement, jamais par recomposition manuelle).
 *
 * `population` optionnel (~50% des tirages) pilote l'existence de l'écran 3 (voir
 * `moteur6e/typesLoiNormale.ts`, `phaseApres` prend `exercice` en 2e paramètre — mirroir
 * `typesCalculAires.ts`/6gen26, "longueur de chaîne d'écrans variable").
 */

const SOUS_TYPES: ExerciceLoiNormaleB["sousType"][] = ["inferieur", "superieur", "intervalle"];

const MU_MIN = -50;
const MU_MAX = 150;
const SIGMA_MIN = 1;
const SIGMA_MAX = 20;
const Z_CIBLE_MIN = -2.5;
const Z_CIBLE_MAX = 2.5;
const POPULATION_MIN = 200;
const POPULATION_MAX = 10000;

function tirerX(mu: number, sigma: number): number {
  const zCible = tirerDecimal(Z_CIBLE_MIN, Z_CIBLE_MAX, 2);
  return arrondi(mu + zCible * sigma, 2);
}

function tirerPopulation(): number | undefined {
  if (Math.random() < 0.5) return undefined;
  return Math.round(tirerDecimal(POPULATION_MIN, POPULATION_MAX, 0));
}

export function construireFamilleB(): ExerciceLoiNormaleB {
  const sousType = tirerParmi(SOUS_TYPES);
  const mu = tirerDecimal(MU_MIN, MU_MAX, 2);
  const sigma = tirerDecimal(SIGMA_MIN, SIGMA_MAX, 2);
  const population = tirerPopulation();

  if (sousType === "intervalle") {
    let x1 = tirerX(mu, sigma);
    let x2 = tirerX(mu, sigma);
    if (x1 === x2) x2 += 0.01;
    if (x1 > x2) [x1, x2] = [x2, x1];
    return { famille: "B", sousType, mu, sigma, x1, x2, population };
  }
  return { famille: "B", sousType, mu, sigma, x: tirerX(mu, sigma), population };
}

/** Standardisation `z=(x-μ)/σ` — écran 1, réutilisée telle quelle par la famille D (dé-
 * standardisation inverse) et le format UI. */
export function standardiserB(x: number, mu: number, sigma: number): number {
  return (x - mu) / sigma;
}

/** Probabilité finale — écran 2, calculée directement via `Phi` (voir en-tête `familleA.ts`). */
export function probabiliteFinaleB(e: ExerciceLoiNormaleB): number {
  if (e.sousType === "intervalle") {
    return Phi(standardiserB(e.x2, e.mu, e.sigma)) - Phi(standardiserB(e.x1, e.mu, e.sigma));
  }
  const z = standardiserB(e.x, e.mu, e.sigma);
  return e.sousType === "inferieur" ? Phi(z) : 1 - Phi(z);
}

/** Effectif estimé — écran 3 (population). Valeur BRUTE (non arrondie) : l'arrondi à l'entier est
 * le travail de l'élève, la tolérance de vérification s'applique autour de cette valeur (voir
 * `moteur6e/verificationLoiNormale.ts`, `TOLERANCE_EFFECTIF`). */
export function effectifEstimeB(probabilite: number, population: number): number {
  return probabilite * population;
}
