import type { ExerciceEqExpoC, StyleC } from "../../../core6e/equationsExponentielles.types";
import { tirerDeuxDistincts, tirerParmi } from "../aleatoire";
import { tirerBaseCSansE } from "../bases";
import { baseValeur } from "../rationnel";

/**
 * Famille C — changement de variable `t=base^x`, équation canonique `A·t²+B·t+C=0`, trois styles de
 * présentation (direct, carré déguisé, regroupement). Décision de l'utilisateur (audit 6e ch. 2) :
 * pas de logarithme au chapitre 2 — chaque valeur positive de t est une PUISSANCE EXACTE de la base,
 * x s'obtient « par même base ». Base entière {2, 3, 5}. Racines toujours distinctes ; deux racines
 * négatives (tous les coefficients positifs) = « aucune solution », un cas particulier.
 * `regroupement` (`base^(2x+1)+(base²)^x=D`) : B = 0, racines opposées, A = base + 1.
 */

/** Valeurs négatives de t (rejetées : une exponentielle est strictement positive). */
const T_NEGATIFS = [-3, -2, -1] as const;

/** Puissances de la base utilisées comme valeurs positives de t : x est alors un entier, obtenu
 * « par même base » (décision de l'utilisateur : pas de logarithme au chapitre 2 — plus de log_b).
 * Puissances bornées pour garder des coefficients lisibles (b² pour 2 et 3 seulement). */
function puissancesPositives(b: number): number[] {
  return b === 2 ? [1, 2, 4] : b === 3 ? [1, 3, 9] : [1, b];
}

export function construireC(style: StyleC): ExerciceEqExpoC {
  // Base entière {2, 3, 5} pour les trois styles : avec la base e, une valeur t = eᵏ rendrait les
  // coefficients irrationnels.
  const base = tirerBaseCSansE();
  const b = baseValeur(base);
  const positives = puissancesPositives(b);

  let t1: number;
  let t2: number;
  let A: number;
  let B: number;
  let C: number;

  if (style === "regroupement") {
    const t0 = tirerParmi(positives);
    t1 = t0;
    t2 = -t0;
    A = b + 1;
    B = 0;
    C = -A * t0 * t0;
  } else {
    // Issues : deux racines positives (40 %), une positive et une négative (50 %), deux négatives
    // (10 % : « aucune solution », cas particulier — tous les coefficients sont alors positifs).
    const r = Math.random();
    if (r < 0.4) [t1, t2] = tirerDeuxDistincts(positives);
    else if (r < 0.9) [t1, t2] = [tirerParmi(positives), tirerParmi(T_NEGATIFS)];
    else [t1, t2] = tirerDeuxDistincts(T_NEGATIFS);
    A = tirerParmi([1, 2, 3] as const);
    B = -A * (t1 + t2);
    C = A * t1 * t2;
  }

  const solutionsT = [t1, t2].sort((x, y) => x - y);
  const solutionsX = solutionsT
    .filter((t) => t > 0)
    .map((t) => Math.round(Math.log(t) / Math.log(b)))
    .sort((x, y) => x - y);

  return { famille: "C", style, base, A, B, C, t1, t2, solutionsT, solutionsX };
}
