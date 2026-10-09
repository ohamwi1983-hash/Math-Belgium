import type { CibleLimiteLog, DirectionX, ExerciceLimiteLogA, ExerciceLimiteLogA1, ExerciceLimiteLogA2, ExerciceLimiteLogA3, ExerciceLimiteLogA4, ExerciceLimiteLogA5 } from "../../../core6e/limitesLogarithmiques.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";

/**
 * Famille A — croissances comparées, 2 écrans (dominance, conclure), 5 sous-types. Toute la
 * hiérarchie utilisée ici (log≪polynôme≪exponentielle(base>1), exponentielle(base<1)→0
 * négligeable) est NOUVELLE dans ce chapitre (complète celle déjà vue en 6gen6 en y ajoutant le
 * logarithme comme échelon le plus bas).
 *
 * **Simplification assumée pour tous les sous-types** : les coefficients "structurants" (base d'un
 * logarithme/d'une exponentielle, coefficient d'un terme exponentiel) sont toujours POSITIFS —
 * seul le signe éventuel d'un terme purement additif (`b`/`c`) varie librement (déjà géré
 * correctement par `formatSommeTermes`, `ui6e/formatLimitesLogarithmiques.ts`). Le signe d'un
 * coefficient dominant n'a aucune incidence sur la CATÉGORIE de croissance ni sur le VERDICT
 * log≪polynôme≪exponentielle — seule la mise en forme LaTeX d'un coefficient multipliant un terme
 * exponentiel (`c·base^x`) demande une convention d'écriture supplémentaire (`\\cdot`), évitée en
 * gardant ce coefficient positif.
 */

const BASES_SUP = [2, 3, 4, 5] as const;
const BASES_INF = [0.5, 0.4, 0.3, 0.2] as const;
const DEGRES = [1, 2, 3] as const;

// ============================================================================
// Sous-type 1 — f(x) = k·ln(x) / (a·x^d + b), x→+∞. Toujours → 0.
// ============================================================================

export function construireA1(): ExerciceLimiteLogA1 {
  const k = tirerEntierNonNul(-4, 4);
  const a = tirerEntierNonNul(1, 4);
  const d = tirerParmi(DEGRES);
  const b = tirerEntier(-4, 4);
  return { famille: "A", sousType: "sous1", k, a, d, b, dominanceNumerateur: "log", dominanceDenominateur: "polynome", limiteGlobale: { type: "zero" } };
}

// ============================================================================
// Sous-type 2 — f(x) = base^x / (q·x^d), base>1, q>0, x→±∞ (direction tirée).
// ============================================================================

export function construireA2(): ExerciceLimiteLogA2 {
  const base = tirerParmi(BASES_SUP);
  const q = tirerEntier(1, 4);
  const d = tirerParmi(DEGRES);
  const direction: DirectionX = Math.random() < 0.5 ? "plus_infini" : "moins_infini";
  const limiteGlobale: CibleLimiteLog = direction === "plus_infini" ? { type: "plus_infini" } : { type: "zero" };
  return { famille: "A", sousType: "sous2", base, q, d, direction, dominanceNumerateur: "exponentielle", dominanceDenominateur: "polynome", limiteGlobale };
}

// ============================================================================
// Sous-type 3 — f(x) = (p1·x^d1·ln(x)) / (p2·x^d2·log_base(x)), x→+∞. Après réécriture
// log_base(x)=ln(x)/ln(base), le ln(x) se simplifie exactement : f(x) = (p1·ln(base)/p2)·x^(d1-d2).
// ============================================================================

export function construireA3(): ExerciceLimiteLogA3 {
  const p1 = tirerEntierNonNul(-3, 3);
  const p2 = tirerEntierNonNul(-3, 3);
  const d1 = tirerParmi(DEGRES);
  const d2 = tirerParmi(DEGRES);
  const base = tirerParmi(BASES_SUP);

  const facteur = (p1 * Math.log(base)) / p2;
  let limiteGlobale: CibleLimiteLog;
  if (d1 > d2) limiteGlobale = facteur > 0 ? { type: "plus_infini" } : { type: "moins_infini" };
  else if (d1 === d2) limiteGlobale = { type: "valeur", valeur: facteur };
  else limiteGlobale = { type: "zero" };

  return { famille: "A", sousType: "sous3", p1, d1, p2, d2, base, dominanceNumerateur: "log", dominanceDenominateur: "log", limiteGlobale };
}

// ============================================================================
// Sous-type 4 — f(x) = (a·x^d+c+log_base1(x)) / (a·x^d+c+log_base2(x)), MÊME polynôme des deux
// côtés, x→+∞. Toujours → 1 (logs négligeables des deux côtés, quelles que soient leurs bases).
// ============================================================================

export function construireA4(): ExerciceLimiteLogA4 {
  const a = tirerEntierNonNul(1, 4);
  const d = tirerParmi(DEGRES);
  const c = tirerEntier(-4, 4);
  const [base1, base2] = tirerDeuxBasesDistinctes();
  return { famille: "A", sousType: "sous4", a, d, c, base1, base2, dominanceNumerateur: "polynome", dominanceDenominateur: "polynome", limiteGlobale: { type: "valeur", valeur: 1 } };
}

function tirerDeuxBasesDistinctes(): [number, number] {
  const b1 = tirerParmi(BASES_SUP);
  let b2 = tirerParmi(BASES_SUP);
  while (b2 === b1) b2 = tirerParmi(BASES_SUP);
  return [b1, b2];
}

// ============================================================================
// Sous-type 5 — f(x) = (a1·x^d1+c1·base1^x) / (a2·x^d2+c2·base2^x), base1<1 (négligeable),
// base2>1 (dominant), x→+∞. Toujours → 0.
// ============================================================================

export function construireA5(): ExerciceLimiteLogA5 {
  const a1 = tirerEntierNonNul(1, 4);
  const d1 = tirerParmi(DEGRES);
  const c1 = tirerEntier(1, 4);
  const base1 = tirerParmi(BASES_INF);
  const a2 = tirerEntierNonNul(1, 4);
  const d2 = tirerParmi(DEGRES);
  const c2 = tirerEntier(1, 4);
  const base2 = tirerParmi(BASES_SUP);
  return { famille: "A", sousType: "sous5", a1, d1, c1, base1, a2, d2, c2, base2, dominanceNumerateur: "polynome", dominanceDenominateur: "exponentielle", limiteGlobale: { type: "zero" } };
}

// ============================================================================
// Tirage équiprobable parmi les 5 sous-types.
// ============================================================================

const SOUS_TYPES: (() => ExerciceLimiteLogA)[] = [construireA1, construireA2, construireA3, construireA4, construireA5];

export function construireA(): ExerciceLimiteLogA {
  return tirerParmi(SOUS_TYPES)();
}

export function construireASousType(sousType: ExerciceLimiteLogA["sousType"]): ExerciceLimiteLogA {
  switch (sousType) {
    case "sous1":
      return construireA1();
    case "sous2":
      return construireA2();
    case "sous3":
      return construireA3();
    case "sous4":
      return construireA4();
    case "sous5":
      return construireA5();
  }
}
