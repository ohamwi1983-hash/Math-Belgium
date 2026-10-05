import type { ExerciceNiveau2Cubique } from "../../core/caracteristiquesAlgebriques.types";
import { randomInt, randomIntNonNul } from "./aleatoire";
import { FORMES_P3, construireP3 } from "./construireP3";

/**
 * Niveau 2, famille `cube` — `f(x) = (ax+b)³ + (cx+d)`. Résoudre les zéros revient à résoudre
 * `P3 := (ax+b)³ + (cx+d) = 0` — miroir exact de `racine_cubique` (voir sa section dédiée), rôles
 * de `P1` et `k` inversés : ici c'est `P1=(ax+b)` qui est élevé au cube (`(p,q)=(a,b)`, choisi
 * librement, `a≠0` toujours garanti), et `k=(cx+d)` qui se déduit (`(u,v)=(c,d)`) — mêmes formules
 * génériques (`construireP3.ts`), seul le rôle physique change. `b≠0` requis pour la forme 3
 * (sinon `u=-3ab²=0`, `k` dégénérerait en constante — niveau 1) ; `c≠0` (=`u≠0`) revérifié après
 * coup pour les 3 formes (couvre la contrainte `a²≠3b²` de la forme 4).
 */
export function construireNiveau2Cube(): ExerciceNiveau2Cubique {
  for (let tentative = 0; tentative < 500; tentative++) {
    const forme = FORMES_P3[randomInt(0, FORMES_P3.length - 1)];
    const a = randomIntNonNul(-3, 3);
    const b = randomInt(-4, 4);
    if (forme === "forme3" && b === 0) continue;

    const uLibre = randomIntNonNul(-4, 4);
    const { u: c, v: d, factorisation } = construireP3(forme, a, b, uLibre);
    if (c === 0) continue;

    return { niveau: "niveau2", famille: "cube", a, b, c, d, factorisationP3: factorisation };
  }
  throw new Error("construireNiveau2Cube : aucune combinaison valide trouvée après 500 tentatives");
}
