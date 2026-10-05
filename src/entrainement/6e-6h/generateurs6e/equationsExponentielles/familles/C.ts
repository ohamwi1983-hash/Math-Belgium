import type { ExerciceEqExpoC, StyleC } from "../../../core6e/equationsExponentielles.types";
import { tirerDeuxDistincts, tirerParmi } from "../aleatoire";
import { tirerBaseCAvecE, tirerBaseCSansE } from "../bases";
import { baseValeur, logBase } from "../rationnel";

/**
 * Famille C — changement de variable `t=base^x`, équation canonique `A·t²+B·t+C=0` — 3 STYLES DE
 * PRÉSENTATION purement visuels de la MÊME équation canonique (voir `core6e/equationsExponentielles.types.ts::ExerciceEqExpoC`
 * pour le détail des 3 formes affichées) :
 *
 * - `"direct"`/`"carreDeguise"` — racines `t1≠t2` tirées LIBREMENT (mélange de signes garanti par
 *   le pool `T_POOL`, qui contient 3 valeurs négatives et 6 positives), coefficient `A` tiré parmi
 *   {1,2,3} pour varier la surface visible ; `B=-A(t1+t2)`, `C=A·t1·t2` (Vieta). `base` peut être
 *   `e` UNIQUEMENT pour `"direct"` (qui affiche `e^{2x}` littéralement, sans disguise) — jamais
 *   pour `"carreDeguise"`, où `base²` doit être un NOMBRE PROPRE affiché tel quel (`e²≈7,389`
 *   serait illisible/disqualifierait l'intérêt pédagogique du déguisement).
 * - `"regroupement"` — le style `base^(2x+1)+(base²)^x=D` n'affiche JAMAIS de terme `B·base^x`
 *   séparé, ce qui force STRUCTURELLEMENT `B=0` (racines OPPOSÉES `t2=-t1`) : `t1` tiré positif
 *   dans le pool, `t2=-t1`. Recombiner `base^(2x+1)=base·(base^x)²` et `(base²)^x=(base^x)²`
 *   donne `base·t²+t²=(base+1)t²` — donc `A=base+1` (jamais choisi librement, DÉRIVÉ de `base`) et
 *   `D=-C=A·t1²`. `base` restreinte à `{2,3,5}` pour ce style (jamais `e`) pour que `A` reste un
 *   ENTIER propre — `A=e+1` rendrait la constante `D` affichée irrationnelle et illisible.
 *
 * Racines TOUJOURS distinctes (jamais de racine double) — le pool `T_POOL` garantit `t1≠t2` par
 * construction (`tirerDeuxDistincts`) pour "direct"/"carreDeguise", et `t1≠-t1` puisque `t1≠0`
 * (pool positif sans 0) pour "regroupement".
 */

const T_POOL = [-3, -2, -1, 1, 2, 3, 4, 5, 9] as const;
const T_POOL_POSITIF = [1, 2, 3, 4, 5, 9] as const;

export function construireC(style: StyleC): ExerciceEqExpoC {
  const base = style === "direct" ? tirerBaseCAvecE() : tirerBaseCSansE();

  let t1: number;
  let t2: number;
  let A: number;
  let B: number;
  let C: number;

  if (style === "regroupement") {
    const t0 = tirerParmi(T_POOL_POSITIF);
    t1 = t0;
    t2 = -t0;
    A = baseValeur(base) + 1;
    B = 0;
    C = -A * t0 * t0;
  } else {
    [t1, t2] = tirerDeuxDistincts(T_POOL);
    A = tirerParmi([1, 2, 3] as const);
    B = -A * (t1 + t2);
    C = A * t1 * t2;
  }

  const solutionsT = [t1, t2].sort((x, y) => x - y);
  const solutionsX = solutionsT
    .filter((t) => t > 0)
    .map((t) => logBase(base, t))
    .sort((x, y) => x - y);

  return { famille: "C", style, base, A, B, C, t1, t2, solutionsT, solutionsX };
}
