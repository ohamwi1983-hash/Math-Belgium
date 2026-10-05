import type { ExerciceIneqCf, ExerciceIneqCk, SousTypeC } from "../../../core6e/inequationsExponentielles.types";
import { tirerEntier, tirerParmi } from "../aleatoire";
import { baseEntiere, BASE_E } from "../rationnel";

/**
 * Famille C — TOUJOURS ℝ, 2 sous-types (voir `core6e/inequationsExponentielles.types.ts`).
 *
 * `f` — `x·(base^x−1) ≥ 0`, `base>1` (peut être `e`), `comparateur` toujours `">="` (jamais tiré).
 *
 * `k` — `base1^(g(x)) [comparateur] base2^(2g(x))`, `g(x)=a(x-x0)²+m0` — construction "CIBLE
 * D'ABORD" : `a>0`, `x0` (vertex entier), `m0>0` (marge minimale positive) choisis EN PREMIER,
 * `b=-2a·x0`, `c=a·x0²+m0` DÉRIVÉS — discriminant `b²-4ac = 4a²x0² - 4a(a·x0²+m0) = -4a·m0 < 0`
 * GARANTI (`a>0`, `m0>0`), AUCUN retry nécessaire (preuve algébrique directe, cross-vérifiée par
 * test). `base1<base2²` GARANTI par construction : `base2` tirée en premier, `base1` tirée dans
 * `[2, base2²-1]` (jamais un retry). `comparateur` restreint à `{"<","<="}` (jamais `">"`/`">="`,
 * voir la doc du type core — sinon la conclusion "toujours ℝ" serait rompue).
 */

const POOL_BASE_F = [baseEntiere(2), baseEntiere(3), baseEntiere(5), baseEntiere(7), BASE_E];
const POOL_BASE2_K = [2, 3, 4] as const;

export function construireCf(): ExerciceIneqCf {
  const base = tirerParmi(POOL_BASE_F);
  return { famille: "C", sousType: "f", base, comparateur: ">=" };
}

export function construireCk(): ExerciceIneqCk {
  const base2Val = tirerParmi(POOL_BASE2_K);
  const base1Val = tirerEntier(2, base2Val * base2Val - 1);
  const base1 = baseEntiere(base1Val);
  const base2 = baseEntiere(base2Val);

  const a = tirerParmi([1, 2, 3] as const);
  const x0 = tirerEntier(-3, 3);
  const m0 = tirerEntier(1, 4);
  const b = -2 * a * x0;
  const c = a * x0 * x0 + m0;

  const comparateur = tirerParmi(["<", "<="] as const);

  return { famille: "C", sousType: "k", base1, base2, a, b, c, comparateur };
}

export function construireC(sousType: SousTypeC) {
  return sousType === "f" ? construireCf() : construireCk();
}
