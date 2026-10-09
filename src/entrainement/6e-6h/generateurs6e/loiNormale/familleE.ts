import type { CoteDemandeE, ExerciceLoiNormaleE } from "../../core6e/loiNormale.types";
import { tirerDecimal } from "./aleatoireDecimal";
import { tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération + logique pure, famille E ("Règle empirique 68-95-99,7 depuis un
 * graphique") de `6gen51`.
 *
 * ============================================================================
 * **INDÉPENDANTE de `Phi`/`PhiInverse` — DÉLIBÉRÉMENT, seule famille de ce générateur dans ce
 * cas, lire avant de modifier**
 * ============================================================================
 * Les pourcentages 68,3%/95,4%/99,7% sont des données AFFICHÉES à l'élève dans l'énoncé (valeurs
 * conventionnelles à 1 décimale, celles enseignées avec la règle empirique — jamais la valeur plus
 * précise `2·Φ(k)-1`, ex. `2·Φ(1)-1≈0,682689` pour `k=1`). Si la vérité de référence utilisait
 * `Phi` ici, la tolérance annoncée (4 décimales) rejetterait à tort une réponse élève calculée
 * CORRECTEMENT à partir du pourcentage AFFICHÉ (`1-0,683=0,317` ≠ `1-0,682689≈0,317311` au-delà de
 * la 3e décimale) — violerait la convention CLAUDE.md "l'annonce de précision doit être la
 * tolérance réellement vérifiée". Donc : `POURCENTAGE_PAR_K` (les 3 constantes conventionnelles)
 * EST la vérité de référence de cette famille, jamais `Phi`.
 */

export const POURCENTAGE_PAR_K: Record<1 | 2 | 3, number> = { 1: 0.683, 2: 0.954, 3: 0.997 };

const MU_MIN = -50;
const MU_MAX = 150;
const SIGMA_MIN = 1;
const SIGMA_MAX = 20;
const K_VALEURS: (1 | 2 | 3)[] = [1, 2, 3];
const COTES: CoteDemandeE[] = ["superieur", "inferieur"];
const POPULATION_MIN = 200;
const POPULATION_MAX = 10000;

function tirerPopulation(): number | undefined {
  if (Math.random() < 0.5) return undefined;
  return Math.round(tirerDecimal(POPULATION_MIN, POPULATION_MAX, 0));
}

export function construireFamilleE(): ExerciceLoiNormaleE {
  const mu = tirerDecimal(MU_MIN, MU_MAX, 2);
  const sigma = tirerDecimal(SIGMA_MIN, SIGMA_MAX, 2);
  const k = tirerParmi(K_VALEURS);
  const unCote = Math.random() < 0.5;
  const population = tirerPopulation();
  if (unCote) {
    return { famille: "E", mu, sigma, k, unCote, coteDemande: tirerParmi(COTES), population };
  }
  return { famille: "E", mu, sigma, k, unCote, population };
}

/** Bornes affichées `[μ-kσ;μ+kσ]` — TOUJOURS recalculées depuis μ/σ/k, jamais stockées (voir
 * en-tête `core6e/loiNormale.types.ts`). */
export function bornesE(mu: number, sigma: number, k: number): { basse: number; haute: number } {
  return { basse: mu - k * sigma, haute: mu + k * sigma };
}

/** σ retrouvé depuis les bornes affichées et `k` (déduit du pourcentage donné) — écran 1, sens
 * inverse de `bornesE` pour σ (μ = simple milieu, ne dépend pas de `k`). */
export function sigmaDepuisBornes(basse: number, haute: number, k: number): number {
  return (haute - basse) / (2 * k);
}
export function muDepuisBornes(basse: number, haute: number): number {
  return (basse + haute) / 2;
}

/** Probabilité finale demandée — écran 2. Piège central : diviser par 2 UNIQUEMENT si la question
 * porte sur un seul côté (`unCote`) — voir en-tête de fichier pour le choix de vérité de référence
 * (jamais `Phi`, toujours `POURCENTAGE_PAR_K`). */
export function probabiliteFinaleE(e: ExerciceLoiNormaleE): number {
  const complementaire = 1 - POURCENTAGE_PAR_K[e.k];
  return e.unCote ? complementaire / 2 : complementaire;
}

/** Effectif estimé — écran 3 (population), valeur BRUTE (voir `effectifEstimeB`, même
 * convention). */
export function effectifEstimeE(probabilite: number, population: number): number {
  return probabilite * population;
}
