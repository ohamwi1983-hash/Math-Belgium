import type { ExerciceTangenteExpo, IdSigne, VarianteTangenteExpo } from "../../core6e/tangenteExponentielle";
import type { Rat } from "../../ui6e/nombresExpoLotG";
import { rat, ratMul, ratPow } from "../../ui6e/nombresExpoLotG";

/**
 * Couche A — générateur de `6gen149` « Tangente à une exponentielle et nombre ln a ». `Math.random()`
 * seul (`?code=`).
 *
 * - `en-zero` : sens tiré d'abord (verdict 50/50), puis la base parmi 2, 3, 5, 10, 1,5, 2,5 ou 0,5,
 *   1/3, 2/3, 0,2, 0,8, 0,1 ; options du verdict mélangées.
 * - `en-x0` : a ∈ {2, 3, 4, 5, 1/2, 1/3, 1/4}, k ∈ {±1, ±2, ±3, 5}, x₀ ∈ {−2, −1, 2, 3} (x₀ = 1 : image immédiate) avec
 *   |f(x₀)| ≤ 40 et un dénominateur ≤ 16 (image exacte calculable sans calculatrice).
 * - `base-e` : k ∈ {±1, ±2, 3}, m ∈ {1, 2, 3, −1, −2}, x₀ ∈ {−1, 1, 2} avec 1 ≤ |m·x₀| ≤ 3.
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

function melanger<T>(t: readonly T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

const BASES_SUP_ZERO: Rat[] = [rat(2), rat(3), rat(5), rat(10), rat(3, 2), rat(5, 2)];
const BASES_INF_ZERO: Rat[] = [rat(1, 2), rat(1, 3), rat(2, 3), rat(1, 5), rat(4, 5), rat(1, 10)];
const BASES_X0: Rat[] = [rat(2), rat(3), rat(4), rat(5), rat(1, 2), rat(1, 3), rat(1, 4)];

const ORDRE: IdSigne[] = ["positive", "negative", "nulle"];

export function construire(variante: VarianteTangenteExpo): ExerciceTangenteExpo {
  const ordreSigne = melanger(ORDRE);
  if (variante === "en-zero") {
    const sup = Math.random() < 0.5;
    const base = parmi(sup ? BASES_SUP_ZERO : BASES_INF_ZERO);
    return { variante, base, k: 1, m: 1, x0: 0, ordreSigne, cleCollecteur: `${variante}/${sup ? "sup" : "inf"}` };
  }
  if (variante === "en-x0") {
    for (;;) {
      const base = parmi(BASES_X0);
      const k = parmi([1, 2, 3, 5, -1, -2, -3]);
      const x0 = parmi([-2, -1, 2, 3]);
      const img = ratMul(rat(k), ratPow(base, x0));
      if (Math.abs(img.num / img.den) > 40 || img.den > 16) continue;
      return { variante, base, k, m: 1, x0, ordreSigne, cleCollecteur: `${variante}/${base.num > base.den ? "sup" : "inf"}/x0${x0 < 0 ? "-" : "+"}` };
    }
  }
  for (;;) {
    const k = parmi([1, 2, 3, -1, -2]);
    const m = parmi([1, 2, 3, -1, -2]);
    const x0 = parmi([-1, 1, 2]);
    if (Math.abs(m * x0) > 3) continue;
    return { variante, base: null, k, m, x0, ordreSigne, cleCollecteur: `${variante}/m${m === 1 ? 1 : "≠1"}` };
  }
}

/** Catalogue dev — libellés neutres (ce que l'écran montre), jamais la réponse. */
export const CATALOGUE_VARIANTES: { id: VarianteTangenteExpo; label: string }[] = [
  { id: "en-zero", label: "Tangente en (0 ; 1) à aˣ : signe, pente ln a, équation" },
  { id: "en-x0", label: "Tangente à k·aˣ en un point d'abscisse x₀" },
  { id: "base-e", label: "Tangente à k·eᵐˣ en un point d'abscisse x₀" },
];

export function construireAvecVarianteId(id: VarianteTangenteExpo): ExerciceTangenteExpo {
  return construire(id);
}

export function genererExerciceTangenteExpo(): ExerciceTangenteExpo {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
