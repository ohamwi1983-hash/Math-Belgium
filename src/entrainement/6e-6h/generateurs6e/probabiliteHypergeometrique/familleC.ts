import type { CategorieHypergeoC, ExerciceHypergeoC } from "../../core6e/probabiliteHypergeometrique.types";
import { calculerHypergeo, dansPlageAcceptable } from "./familleA";
import { tirerEntier } from "./aleatoire";

/**
 * Famille C de `6gen47` — deux tirages indépendants (numéros principaux, numéros bonus) : produit de
 * deux probabilités hypergéométriques. Audit (§ 2 n° 22) : « exactement 0 bon numéro bonus » sortait
 * dans 54 % des exercices ; le nombre de bons numéros bonus (0, ou au moins 1) est maintenant tiré
 * d'abord, à parts égales.
 */

interface Plages {
  N: [number, number];
  K: [number, number];
  n: [number, number];
}

const PRINCIPAL: Plages = { N: [15, 25], K: [4, 8], n: [3, 5] };
const BONUS: Plages = { N: [6, 10], K: [2, 4], n: [1, 3] };

function categorie(pl: Plages, kVoulu: "zero" | "positif" | "libre", min: number, max: number): CategorieHypergeoC {
  let derniere: CategorieHypergeoC | null = null;
  for (let essai = 0; essai < 200; essai++) {
    const N = tirerEntier(pl.N[0], pl.N[1]);
    const K = tirerEntier(pl.K[0], Math.min(pl.K[1], N - 2));
    const n = tirerEntier(pl.n[0], Math.min(pl.n[1], N - K));
    const kMin = Math.max(kVoulu === "positif" ? 1 : 0, n - (N - K));
    const kMax = kVoulu === "zero" ? 0 : Math.min(K, n);
    if (kMin > kMax) continue;
    const k = tirerEntier(kMin, kMax);
    const c = calculerHypergeo(N, K, n, k);
    derniere = { N, K, n, k, numerateur: c.numerateurFacteur1 * c.numerateurFacteur2, denominateur: c.denominateur, probabilite: c.probabilite };
    if (dansPlageAcceptable(c.probabilite, min, max)) return derniere;
  }
  return derniere as CategorieHypergeoC;
}

export function construireFamilleC(): ExerciceHypergeoC {
  const principal = categorie(PRINCIPAL, "positif", 0.15, 0.9);
  const bonus = categorie(BONUS, Math.random() < 0.5 ? "zero" : "positif", 0.15, 0.9);
  return {
    famille: "C",
    principal,
    bonus,
    numerateurCombine: principal.numerateur * bonus.numerateur,
    denominateurCombine: principal.denominateur * bonus.denominateur,
    probabiliteCombinee: principal.probabilite * bonus.probabilite,
  };
}
