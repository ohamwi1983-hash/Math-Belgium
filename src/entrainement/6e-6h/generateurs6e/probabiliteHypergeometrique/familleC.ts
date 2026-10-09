import type { CategorieHypergeoC, ExerciceHypergeoC } from "../../core6e/probabiliteHypergeometrique.types";
import { calculerHypergeo, dansPlageAcceptable } from "./familleA";
import { tirerEntier } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Hypergéométrique à 2 catégories croisées — loto +
 * bonus") de `6gen47`. Contexte type loto : `n1` numéros tirés parmi `N1` (dont `K1` numéros
 * cochés par le joueur), ET, INDÉPENDAMMENT, `n2` numéros bonus tirés parmi `N2` (dont `K2`
 * cochés) — 2 applications de la MÊME formule hypergéométrique que la famille A
 * (`calculerHypergeo`, réutilisée directement, jamais réimplémentée), combinées par
 * multiplication (2 tirages réellement indépendants — jeu principal et jeu bonus n'ont aucune
 * boule/numéro en commun).
 *
 * **Bornes de probabilité par catégorie plus SERRÉES que la famille A** (`[0.2, 0.9]` au lieu de
 * `[0.03, 0.9]`) — un produit de 2 facteurs chacun proche du plancher de la famille A (`0.03`)
 * donnerait un produit `≈0.0009`, EN DESSOUS de la tolérance 0,01 (voir en-tête `familleA.ts`
 * pour la même préoccupation) : `0.2*0.2=0.04` reste confortablement au-dessus.
 */

interface PlageEntiers {
  min: number;
  max: number;
}

interface PlagesCategorie {
  population: PlageEntiers;
  succes: PlageEntiers;
  tirage: PlageEntiers;
}

const PLAGES_PRINCIPAL: PlagesCategorie = { population: { min: 15, max: 25 }, succes: { min: 4, max: 8 }, tirage: { min: 3, max: 5 } };
const PLAGES_BONUS: PlagesCategorie = { population: { min: 6, max: 10 }, succes: { min: 1, max: 3 }, tirage: { min: 1, max: 2 } };

const PROBABILITE_FACTEUR_MIN = 0.2;
const PROBABILITE_FACTEUR_MAX = 0.9;
const ESSAIS_MAX = 40;

function construireCategorie(plages: PlagesCategorie): CategorieHypergeoC {
  let derniere: CategorieHypergeoC | null = null;
  for (let essai = 0; essai < ESSAIS_MAX; essai++) {
    const N = tirerEntier(plages.population.min, plages.population.max);
    const n = tirerEntier(plages.tirage.min, Math.min(plages.tirage.max, N - 1));
    const KMax = Math.min(plages.succes.max, N - 1);
    const K = tirerEntier(plages.succes.min, Math.max(plages.succes.min, KMax));
    const kMin = Math.max(0, n - (N - K));
    const kMax = Math.min(K, n);
    const k = tirerEntier(kMin, kMax);
    const { numerateurFacteur1, numerateurFacteur2, denominateur, probabilite } = calculerHypergeo(N, K, n, k);
    derniere = { N, K, n, k, numerateur: numerateurFacteur1 * numerateurFacteur2, denominateur, probabilite };
    if (dansPlageAcceptable(probabilite, PROBABILITE_FACTEUR_MIN, PROBABILITE_FACTEUR_MAX)) return derniere;
  }
  /* c8 ignore next */
  return derniere as CategorieHypergeoC;
}

export function construireFamilleC(): ExerciceHypergeoC {
  const principal = construireCategorie(PLAGES_PRINCIPAL);
  const bonus = construireCategorie(PLAGES_BONUS);
  const numerateurCombine = principal.numerateur * bonus.numerateur;
  const denominateurCombine = principal.denominateur * bonus.denominateur;
  const probabiliteCombinee = principal.probabilite * bonus.probabilite;
  return { famille: "C", principal, bonus, numerateurCombine, denominateurCombine, probabiliteCombinee };
}
