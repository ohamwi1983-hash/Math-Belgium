import type { ExerciceNiveau2Cubique } from "../../core/caracteristiquesAlgebriques.types";
import { randomInt, randomIntNonNul } from "./aleatoire";
import { FORMES_P3, construireP3 } from "./construireP3";

/**
 * Niveau 2, famille `racine_cubique` — `f(x) = ∛(ax+b) + (cx+d)`. Résoudre les zéros revient à
 * résoudre `P3 := (ax+b) + (cx+d)³ = 0` — ici c'est `k=(cx+d)` qui est élevé au cube (le côté
 * "libre" `(p,q)` de `construireP3` vaut donc `(c,d)`), et `P1=(ax+b)` qui se déduit (`(u,v)=(a,b)`)
 * — voir `construireP3.ts` pour le détail complet des 3 formes retenues. `d≠0` est requis pour la
 * forme 3 (sinon `u=-3cd²=0`, `P1` dégénérerait) ; `a≠0` (=`u≠0`) est revérifié après coup pour les
 * 3 formes uniformément (couvre aussi la forme 4, dont la contrainte `c²≠3d²` équivaut exactement
 * à `u≠0` — voir CLAUDE.md).
 */
export function construireNiveau2RacineCubique(): ExerciceNiveau2Cubique {
  for (let tentative = 0; tentative < 500; tentative++) {
    const forme = FORMES_P3[randomInt(0, FORMES_P3.length - 1)];
    const c = randomIntNonNul(-3, 3);
    const d = randomInt(-4, 4);
    if (forme === "forme3" && d === 0) continue;

    const uLibre = randomIntNonNul(-4, 4);
    const { u: a, v: b, factorisation } = construireP3(forme, c, d, uLibre);
    if (a === 0) continue;

    return { niveau: "niveau2", famille: "racine_cubique", a, b, c, d, factorisationP3: factorisation };
  }
  throw new Error("construireNiveau2RacineCubique : aucune combinaison valide trouvée après 500 tentatives");
}
