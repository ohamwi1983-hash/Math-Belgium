import type { ExerciceDomaineDeriveeE, ExerciceDomaineDeriveeEJ, ExerciceDomaineDeriveeEM, ExerciceDomaineDeriveeEN, FormeGA } from "../../../core6e/domaineDeriveeExponentielles.types";
import { ensembleReel } from "../../ensembleReel";
import { tirerBaseAvecE, tirerEntier, tirerParmi } from "../aleatoire";

const BASES = [2, 3, 4, 5, 6, 7, 8, 9] as const;
const TENTATIVES_MAX = 200;

/**
 * Famille E — simplifier AVANT de dériver (3 écrans : domaine, simplifier, dérivée). Domaine
 * TOUJOURS ℝ (spec explicite, les 3 sous-types sont des exponentielles pures, jamais de
 * restriction). "Cible d'abord" : chaque sous-type dérive sa forme SIMPLIFIÉE directement des
 * paramètres tirés, jamais l'inverse.
 *
 * Sous-type "j" — base^g(x)/base^h(x) (même base) → se simplifie en base^(g(x)−h(x)). g/h "affines
 * ou quadratiques simples" (spec) : réutilise `FormeGA` (famille A) restreinte à `affine` ou
 * `puissance` avec exposant=2 UNIQUEMENT (jamais 3, "quadratique" pas "cubique"). Reroll si g≡h
 * (même forme, exposant devient trivialement 0).
 *
 * Sous-type "m" — (base^x−1)/base^x → se simplifie en 1−base^(−x). f'(x)=ln(base)·base^(−x).
 *
 * Sous-type "n" — (base1^x−c)/base2^x, bases DIFFÉRENTES (spec) → se simplifie en
 * (base1/base2)^x − c·(1/base2)^x. Plage de `c` non fournie par la spec pour ce sous-type — reprise
 * de la même convention `{1,2,3}` que le reste du générateur (signalé, voir CLAUDE.md).
 */
export function construireE(): ExerciceDomaineDeriveeE {
  const r = Math.random();
  if (r < 1 / 3) return construireJ();
  if (r < 2 / 3) return construireM();
  return construireN();
}

function tirerFormeGA2(): FormeGA {
  return Math.random() < 0.5 ? { type: "affine", m: tirerParmi([-3, -2, -1, 1, 2, 3] as const), n: tirerEntier(-3, 3) } : { type: "puissance", exposant: 2 };
}

function memesFormesGA(a: FormeGA, b: FormeGA): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "affine" && b.type === "affine") return a.m === b.m && a.n === b.n;
  return true; // deux "puissance" (exposant toujours 2 ici) sont toujours identiques.
}

function construireJ(): ExerciceDomaineDeriveeEJ {
  const { base, baseEstE } = tirerBaseAvecE(2, 9);
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const g = tirerFormeGA2();
    const h = tirerFormeGA2();
    if (memesFormesGA(g, h)) continue;
    return { famille: "E", sousType: "j", domaine: ensembleReel(), base, baseEstE, g, h };
  }
  throw new Error("construireJ : aucune paire (g,h) distincte trouvée après retirage");
}

function construireM(): ExerciceDomaineDeriveeEM {
  const { base, baseEstE } = tirerBaseAvecE(2, 9);
  return { famille: "E", sousType: "m", domaine: ensembleReel(), base, baseEstE };
}

function construireN(): ExerciceDomaineDeriveeEN {
  const base1 = tirerParmi(BASES);
  const base2 = tirerParmi(BASES.filter((b) => b !== base1));
  const c = tirerParmi([1, 2, 3] as const);
  return { famille: "E", sousType: "n", domaine: ensembleReel(), base1, base2, c };
}

function evaluerGA(g: FormeGA, x: number): number {
  return g.type === "affine" ? g.m * x + g.n : x * x;
}

export function evaluerFE(exercice: ExerciceDomaineDeriveeE, x: number): number {
  if (exercice.sousType === "j") {
    return Math.pow(exercice.base, evaluerGA(exercice.g, x)) / Math.pow(exercice.base, evaluerGA(exercice.h, x));
  }
  if (exercice.sousType === "m") {
    return (Math.pow(exercice.base, x) - 1) / Math.pow(exercice.base, x);
  }
  return (Math.pow(exercice.base1, x) - exercice.c) / Math.pow(exercice.base2, x);
}

export { evaluerGA };
