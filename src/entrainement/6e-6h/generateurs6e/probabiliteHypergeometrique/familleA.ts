import { coefficientBinomial } from "../combinatoire";
import type { ExerciceHypergeoA, SousTypeHypergeoA } from "../../core6e/probabiliteHypergeometrique.types";
import { tirerEntier, tirerParmi } from "./aleatoire";
import { tirerEntreeContexteA } from "./contextesA";
import type { EntreeContexteA } from "./contextesA";

/**
 * Couche A (6e) — génération, famille A ("Hypergéométrique de base, composition sans ordre") de
 * `6gen47`. Population totale `N` (dont `K` "succès"), tirage de `n` éléments SANS remise,
 * probabilité d'obtenir exactement `k` succès :
 *
 *   P(k succès) = C(K,k)·C(N−K,n−k) / C(N,n)
 *
 * — réutilise DIRECTEMENT `coefficientBinomial` de `generateurs6e/combinatoire.ts` (fondation
 * partagée établie par 6gen43/44, voir en-tête de ce fichier), jamais réimplémenté.
 *
 * 3 sous-types (mission) : "aucun" (k=0), "tous" (k=n), "exactement" (0<k<n, cas général) — TOUS
 * la même formule, seul `k` change de nature dans l'énoncé.
 *
 * ============================================================================
 * **Rejet des tirages à probabilité trop proche de 0 ou 1 — divergence documentée de la tolérance
 * établie**
 * ============================================================================
 * `moteur6e/verificationProbabilites.ts` (6gen30, réutilisé tel quel ici — voir en-tête
 * `moteur6e/verificationProbabiliteHypergeometrique.ts`) fixe la tolérance à 0,01 en s'appuyant
 * sur l'observation que "l'écart minimal entre deux valeurs de probabilité DISTINCTES générées
 * reste toujours ≥1/100, jamais en dessous" pour les dénominateurs typiques du chapitre 8 (52
 * cartes, 16/36 dés). Ce générateur est structurellement différent : le dénominateur naturel d'une
 * probabilité hypergéométrique est `C(N,n)`, qui croît vite et peut donner des probabilités très
 * proches de 0 pour un `N`/`n` par ailleurs raisonnables (ex. `C(2,2)/C(30,2)≈0,0023`) — une
 * réponse "0" saisie par réflexe serait alors ACCEPTÉE À TORT (`|0,0023−0|=0,0023≤0,01`). Plutôt
 * que de resserrer la tolérance (casserait la cohérence avec `diagnostiquerValeur`, utilisée sans
 * wrapper ailleurs sur ce chantier), ce fichier REJETTE par tirage répété (`essaiMax` tentatives,
 * repli sur le dernier tirage au-delà — improbable vu la marge des plages de `contextesA.ts`) tout
 * tirage dont la probabilité finale sort de `[PROBABILITE_MIN_ACCEPTABLE,
 * PROBABILITE_MAX_ACCEPTABLE]` — value réellement dans l'esprit de la convention d'origine
 * ("dénominateurs modestes, écarts significatifs ≥0,01"), généralisée ici par un filtre explicite
 * plutôt qu'un simple choix de petits dénominateurs (impossible à garantir a priori avec une
 * formule à 2 coefficients binomiaux).
 */

const PROBABILITE_MIN_ACCEPTABLE = 0.03;
const PROBABILITE_MAX_ACCEPTABLE = 0.9;
const ESSAIS_MAX = 40;

export function dansPlageAcceptable(p: number, min = PROBABILITE_MIN_ACCEPTABLE, max = PROBABILITE_MAX_ACCEPTABLE): boolean {
  return p >= min && p <= max;
}

export interface CalculHypergeo {
  numerateurFacteur1: number;
  numerateurFacteur2: number;
  denominateur: number;
  probabilite: number;
}

export function calculerHypergeo(N: number, K: number, n: number, k: number): CalculHypergeo {
  const numerateurFacteur1 = coefficientBinomial(K, k);
  const numerateurFacteur2 = coefficientBinomial(N - K, n - k);
  const denominateur = coefficientBinomial(N, n);
  const probabilite = (numerateurFacteur1 * numerateurFacteur2) / denominateur;
  return { numerateurFacteur1, numerateurFacteur2, denominateur, probabilite };
}

function construireDepuisEntree(entree: EntreeContexteA, sousType: SousTypeHypergeoA): ExerciceHypergeoA {
  const N = tirerEntier(entree.populationRange.min, entree.populationRange.max);

  if (sousType === "aucun") {
    const n = tirerEntier(entree.tirageRange.min, Math.min(entree.tirageRange.max, N - 1));
    const KMax = Math.min(entree.succesRange.max, N - n);
    const K = tirerEntier(entree.succesRange.min, Math.max(entree.succesRange.min, KMax));
    const k = 0;
    return { famille: "A", sousType, contexte: entree.contexte, N, K, n, k, ...calculerHypergeo(N, K, n, k) };
  }

  if (sousType === "tous") {
    // P(tous)=C(K,n)/C(N,n) ne reste dans une plage raisonnable QUE si `n` est petit et `K` grand
    // (relativement à `N`) — un `n` qui grimpe jusqu'à `K` (comme pour les autres sous-types) donne
    // quasi toujours une probabilité minuscule (`1/C(N,K)`, voir en-tête de fichier). `n` est donc
    // délibérément tiré petit (2-3) plutôt que dans `tirageRange` du contexte, et `K` biaisé vers
    // le haut de `succesRange` — décision propre à ce sous-type.
    const succesMedian = Math.ceil((entree.succesRange.min + entree.succesRange.max) / 2);
    const K = tirerEntier(Math.min(succesMedian, entree.succesRange.max), Math.min(entree.succesRange.max, N - 1));
    const n = tirerEntier(2, Math.min(3, K));
    const k = n;
    return { famille: "A", sousType, contexte: entree.contexte, N, K, n, k, ...calculerHypergeo(N, K, n, k) };
  }

  // "exactement" — préfère un k strictement intérieur (0<k<n) quand la plage le permet.
  const n = tirerEntier(entree.tirageRange.min, Math.min(entree.tirageRange.max, N - 1));
  const KMax = Math.min(entree.succesRange.max, N - 1);
  const K = tirerEntier(entree.succesRange.min, Math.max(entree.succesRange.min, KMax));
  const kMin = Math.max(0, n - (N - K));
  const kMax = Math.min(K, n);
  const candidatsInterieurs: number[] = [];
  for (let k = kMin; k <= kMax; k++) if (k > 0 && k < n) candidatsInterieurs.push(k);
  const k = candidatsInterieurs.length > 0 ? tirerParmi(candidatsInterieurs) : tirerEntier(kMin, kMax);
  return { famille: "A", sousType, contexte: entree.contexte, N, K, n, k, ...calculerHypergeo(N, K, n, k) };
}

function construireAvecSousType(sousType: SousTypeHypergeoA): ExerciceHypergeoA {
  let dernier: ExerciceHypergeoA | null = null;
  for (let essai = 0; essai < ESSAIS_MAX; essai++) {
    const entree = tirerEntreeContexteA();
    const exercice = construireDepuisEntree(entree, sousType);
    dernier = exercice;
    if (dansPlageAcceptable(exercice.probabilite)) return exercice;
  }
  /* c8 ignore next */
  return dernier as ExerciceHypergeoA;
}

export function construireAucun(): ExerciceHypergeoA {
  return construireAvecSousType("aucun");
}
export function construireTous(): ExerciceHypergeoA {
  return construireAvecSousType("tous");
}
export function construireExactement(): ExerciceHypergeoA {
  return construireAvecSousType("exactement");
}

const CONSTRUCTEURS_A: (() => ExerciceHypergeoA)[] = [construireAucun, construireTous, construireExactement];

export function construireFamilleA(): ExerciceHypergeoA {
  return tirerParmi(CONSTRUCTEURS_A)();
}
