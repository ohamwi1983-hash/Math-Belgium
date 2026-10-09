import type { ExerciceLimiteLogB, ExerciceLimiteLogB1, ExerciceLimiteLogB2 } from "../../../core6e/limitesLogarithmiques.types";
import { tirerEntierNonNul, tirerParmi } from "../aleatoire";

/**
 * Famille B — 0/0 via ln(1+u)/u→1, base du log qui tend vers 1, 2 sous-types.
 *
 * **Sous-type "quotient"** — f(x) = log_{(x/x0)^k}(mx+n), x→x0. Voir la note de conception dans
 * `core6e/limitesLogarithmiques.types.ts` pour la réinterprétation `(x/x0)^k` (au lieu de `x^k` tel
 * que littéralement écrit dans la spec source, incohérent pour x0≠1). Dérivation (u=x/x0−1,
 * x→x0 ⟺ u→0) :
 *   log_{(x/x0)^k}(mx+n) = ln(mx+n) / (k·ln(x/x0)) = ln(mx+n) / (k·ln(1+u))
 * Et mx+n = m·x0·(1+u)+n = (m·x0+n) + m·x0·u = 1 + m·x0·u (car m·x0+n=1 par construction), donc :
 *   f = ln(1+m·x0·u) / (k·ln(1+u))
 * En divisant haut et bas par u : [m·x0·(ln(1+m·x0·u)/(m·x0·u))] / [k·(ln(1+u)/u)] → (m·x0·1)/(k·1)
 * = m·x0/k quand u→0 (les deux rapports ln(1+t)/t→1).
 *
 * **Sous-type "produit"** — f(x) = (x−x0)·log_{x/x0}(k), x→x0. Forme 0×∞. Dérivation (même u) :
 * x−x0 = x0·u, log_{x/x0}(k) = ln(k)/ln(x/x0) = ln(k)/ln(1+u), donc :
 *   f = x0·u·ln(k)/ln(1+u) = x0·ln(k)·[u/ln(1+u)] → x0·ln(k) quand u→0 (u/ln(1+u)→1, forme
 *   réciproque de ln(1+u)/u→1, tout aussi valide).
 */

const X0_CANDIDATS = [1, 2] as const;
const K_QUOTIENT = [1, 2, 3] as const;
const K_PRODUIT = [2, 3, 4, 5] as const;

export function construireBQuotient(): ExerciceLimiteLogB1 {
  const k = tirerParmi(K_QUOTIENT);
  const x0 = tirerParmi(X0_CANDIDATS);
  const m = tirerEntierNonNul(-3, 3);
  const n = 1 - m * x0;
  const limiteFinale = (m * x0) / k;
  return { famille: "B", sousType: "quotient", k, x0, m, n, limiteFinale };
}

export function construireBProduit(): ExerciceLimiteLogB2 {
  const k = tirerParmi(K_PRODUIT);
  const x0 = tirerParmi(X0_CANDIDATS);
  const limiteFinale = x0 * Math.log(k);
  return { famille: "B", sousType: "produit", k, x0, limiteFinale };
}

export function construireB(): ExerciceLimiteLogB {
  return Math.random() < 0.5 ? construireBQuotient() : construireBProduit();
}

export function construireBSousType(sousType: ExerciceLimiteLogB["sousType"]): ExerciceLimiteLogB {
  return sousType === "quotient" ? construireBQuotient() : construireBProduit();
}
