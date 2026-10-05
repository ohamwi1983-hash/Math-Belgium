import type { ExerciceNiveau2ValeurAbsolue, Fraction } from "../../core/caracteristiquesAlgebriques.types";
import type { Morceau } from "../../core/inequation.types";
import { pgcd, randomInt, randomIntNonNul } from "./aleatoire";

/** Fraction irréductible, dénominateur toujours positif. */
function reduire(num: number, den: number): Fraction {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = pgcd(num, den);
  return { num: num / g, den: den / g };
}

/** Intervalle exact de `ax+b ≥ 0` — toujours une demi-droite fermée (`a` toujours non nul). */
function conditionDepuisPente(a: number, b: number): Morceau {
  const borne = -b / a;
  return a > 0
    ? { crochetGauche: "[", borneGauche: borne, crochetDroit: "[", borneDroite: "+inf" }
    : { crochetGauche: "]", borneGauche: "-inf", crochetDroit: "]", borneDroite: borne };
}

/**
 * Niveau 2, famille `valeur_absolue` — `f(x) = |ax+b| + (cx+d)`. Isoler donne
 * `|ax+b| = -(cx+d)`, qui se sépare en deux branches LINÉAIRES (jamais une équation du 2nd degré,
 * contrairement à `carre`/`racine_carree`) :
 * - branche `ax+b≥0` : `ax+b = -(cx+d)` ⟺ `(a+c)x+(b+d)=0`, racine `-(b+d)/(a+c)` (`a+c≠0` requis).
 * - branche `ax+b<0` : `-(ax+b) = -(cx+d)` ⟺ `ax+b=cx+d` ⟺ `(a-c)x+(b-d)=0`, racine `(d-b)/(a-c)`
 *   (`a≠c` requis).
 * Les deux racines sont TOUJOURS rationnelles exactes (a,b,c,d entiers) — stockées en `Fraction`,
 * jamais recalculées ailleurs. Aucune contrainte de "racines entières" ici (contrairement à
 * `carre`/`inverse`/`racine_carree`) : ces deux racines ne sont jamais saisies dans le champ
 * `EtapeChamp2` (`Number()` uniquement), mais dans un champ tolérant aux fractions
 * (`ReponseResolutionBranches`, `parserNombreOuFraction` — `EtapeResolutionBranches.tsx`) — voir sa
 * section dédiée.
 */
export function construireNiveau2ValeurAbsolue(): ExerciceNiveau2ValeurAbsolue {
  for (let tentative = 0; tentative < 500; tentative++) {
    const a = randomIntNonNul(-4, 4);
    const b = randomInt(-6, 6);
    const c = randomIntNonNul(-4, 4);
    const d = randomInt(-6, 6);
    if (a + c === 0 || a === c) continue; // les deux branches doivent rester résolubles

    return {
      niveau: "niveau2",
      famille: "valeur_absolue",
      a,
      b,
      c,
      d,
      conditionValidite: conditionDepuisPente(a, b),
      racineBranche1: reduire(-(b + d), a + c),
      racineBranche2: reduire(d - b, a - c),
    };
  }
  throw new Error("construireNiveau2ValeurAbsolue : aucune combinaison valide trouvée après 500 tentatives");
}
