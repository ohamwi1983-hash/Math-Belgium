import type { CibleLimiteLog, DirectionX, ExerciceLimiteLogC, ExerciceLimiteLogC1, ExerciceLimiteLogC2, ExerciceLimiteLogC3 } from "../../../core6e/limitesLogarithmiques.types";
import { tirerEntier, tirerParmi } from "../aleatoire";

/**
 * Famille C — limites déterminées simples, parfois déguisées en FI, 3 sous-types calqués sur les 3
 * exemples de la spec source (voir la note de conception dans
 * `core6e/limitesLogarithmiques.types.ts`).
 */

const BASES_SUP = [2, 3, 4, 5] as const;

// ============================================================================
// c1 — f(x) = ln(x+c)/ln(x), x→1± (direction tirée). Numérateur→ln(1+c)>0 (fini, non nul).
// Dénominateur→0, signé par la direction (0+ à droite, 0- à gauche).
// ============================================================================

export function construireC1(): ExerciceLimiteLogC1 {
  const c = tirerEntier(1, 5);
  const direction: "droite" | "gauche" = Math.random() < 0.5 ? "droite" : "gauche";
  const partieNumerateur: CibleLimiteLog = { type: "valeur", valeur: Math.log(1 + c), latex: `\\ln(${1 + c})` };
  const partieDenominateur: CibleLimiteLog = { type: "zero" };
  // Numérateur toujours POSITIF (ln(1+c)>0 car c≥1) : le signe de la limite ne dépend donc que du
  // signe du dénominateur (0+ à droite, 0- à gauche).
  const limiteFinale: CibleLimiteLog = direction === "droite" ? { type: "plus_infini" } : { type: "moins_infini" };
  return { famille: "C", sousType: "c1", c, direction, partieNumerateur, partieDenominateur, limiteFinale };
}

// ============================================================================
// c2 — f(x) = x·base^(coefC/x), base>1, x→±∞ (direction tirée). Forme "∞ × constante non nulle" :
// coefC/x→0 donc base^(coefC/x)→base^0=1 (constante non nulle) TOUJOURS, quelle que soit la
// direction — seul le premier facteur (x) porte le signe de l'infini.
// ============================================================================

export function construireC2(): ExerciceLimiteLogC2 {
  const base = tirerParmi(BASES_SUP);
  const coefC = tirerEntier(1, 4) * (Math.random() < 0.5 ? 1 : -1);
  const direction: DirectionX = Math.random() < 0.5 ? "plus_infini" : "moins_infini";
  const partieFacteur1: CibleLimiteLog = direction === "plus_infini" ? { type: "plus_infini" } : { type: "moins_infini" };
  const partieFacteur2: CibleLimiteLog = { type: "valeur", valeur: 1, latex: "1" };
  const limiteFinale: CibleLimiteLog = partieFacteur1;
  return { famille: "C", sousType: "c2", base, coefC, direction, partieFacteur1, partieFacteur2, limiteFinale };
}

// ============================================================================
// c3 — f(x) = (base^x + q + sin(x)) / ln(1+coefC·x²), base>1, x→0. Numérateur(0) = 1+q, JAMAIS 0
// (q≠−1 : piège central, ressemble à 0/0 mais ne l'est pas). Dénominateur→0+ (ln(1+positif)),
// deux côtés confondus (coefC·x²≥0 quel que soit le signe de x) — limite déterminée, de signe celui
// de 1+q (+∞ ou −∞ selon le tirage, pour ne jamais se deviner).
// ============================================================================

const Q_C3 = [-4, -3, -2, 1, 2, 3] as const;

export function construireC3(): ExerciceLimiteLogC3 {
  const base = tirerParmi([2, 3, 4] as const);
  const q = tirerParmi(Q_C3);
  const coefC = tirerEntier(1, 4);
  const partieNumerateur: CibleLimiteLog = { type: "valeur", valeur: 1 + q, latex: String(1 + q) };
  const partieDenominateur: CibleLimiteLog = { type: "zero" };
  const limiteFinale: CibleLimiteLog = 1 + q > 0 ? { type: "plus_infini" } : { type: "moins_infini" };
  return { famille: "C", sousType: "c3", base, q, coefC, partieNumerateur, partieDenominateur, limiteFinale };
}

const SOUS_TYPES: (() => ExerciceLimiteLogC)[] = [construireC1, construireC2, construireC3];

export function construireC(): ExerciceLimiteLogC {
  return tirerParmi(SOUS_TYPES)();
}

export function construireCSousType(sousType: ExerciceLimiteLogC["sousType"]): ExerciceLimiteLogC {
  switch (sousType) {
    case "c1":
      return construireC1();
    case "c2":
      return construireC2();
    case "c3":
      return construireC3();
  }
}
