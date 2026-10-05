import type { ExerciceNiveau2RacineCarree } from "../../core/caracteristiquesAlgebriques.types";
import type { Morceau } from "../../core/inequation.types";
import { construireExerciceClassifie } from "../equationRationnelle/construireExerciceClassifie";
import { randomInt, randomIntNonNul } from "./aleatoire";

/**
 * Intervalle exact de `cx+d ≤ 0` (équivalent à la condition de validité `-(cx+d)≥0` de cette
 * famille) — toujours une demi-droite FERMÉE à son extrémité finie (`≤`/`≥`, jamais stricte),
 * jamais `ℝ`/`∅` (`c` toujours non nul par construction, niveau 2).
 */
function conditionDepuisPente(c: number, d: number): Morceau {
  const borne = -d / c;
  return c > 0
    ? { crochetGauche: "]", borneGauche: "-inf", crochetDroit: "]", borneDroite: borne }
    : { crochetGauche: "[", borneGauche: borne, crochetDroit: "[", borneDroite: "+inf" };
}

/**
 * Niveau 2, famille `racine_carree` — `f(x) = √(ax+b) + (cx+d)`. Isoler donne `√(ax+b) = -(cx+d)`,
 * valide uniquement sous la condition `-(cx+d)≥0` (le carré n'est réversible que dans ce sens) ;
 * élever au carré donne `ax+b = (cx+d)²`, qui développe en `c²x² + (2cd-a)x + (d²-b) = 0` — même
 * principe "racines d'abord" que `carre` (voir sa section dédiée), mais avec les rôles de
 * `(a,b)`/`(c,d)` échangés : c'est `(c,d)` qui est fixé en premier ici (coefficient dominant
 * `A=c²`, toujours un carré parfait), et `(a,b)` qui se déduit par inversion directe des racines
 * choisies. Contrairement à `carre` (où `c`/`d` apparaissent avec un coefficient `+1` dans
 * `B=2ab+c`/`C=b²+d`, une simple soustraction suffit), `a`/`b` apparaissent ici avec un coefficient
 * `-1` dans `B=2cd-a`/`C=d²-b` — l'inversion doit donc changer de signe : `a=2cd-B`, `b=d²-C`
 * (jamais `B-2cd`/`C-d²`, qui recouvrerait `-a`/`-b` — piège confirmé empiriquement avant correctif
 * par un test dédié, `construireNiveau2RacineCarree.test.ts`, qui vérifiait `ax+b=(cx+d)²` à chaque
 * racine embarquée par évaluation numérique indépendante).
 */
export function construireNiveau2RacineCarree(): ExerciceNiveau2RacineCarree {
  for (let tentative = 0; tentative < 500; tentative++) {
    const c = randomIntNonNul(-3, 3);
    const d = randomInt(-5, 5);
    const r1 = randomInt(-6, 6);
    const r2 = randomInt(-6, 6);
    const A = c * c;
    const zeros = construireExerciceClassifie(A, r1, r2);
    const a = 2 * c * d - zeros.enonce.b;
    const b = d * d - zeros.enonce.c;
    if (a === 0) continue; // P1 dégénérerait en constante — exclu, a toujours non nul

    return {
      niveau: "niveau2",
      famille: "racine_carree",
      a,
      b,
      c,
      d,
      zeros,
      conditionValidite: conditionDepuisPente(c, d),
    };
  }
  throw new Error("construireNiveau2RacineCarree : aucune combinaison valide trouvée après 500 tentatives");
}
