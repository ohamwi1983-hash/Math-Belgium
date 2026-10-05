import type { Exercice } from "../../core/generateur.types";
import { randomInt, randomNonZeroInt } from "../secondDegre/aleatoire";

/**
 * ax²+bx+c avec Δ=b²-4ac<0 — parabole sans racine réelle, entièrement au-dessus de Ox si a>0,
 * entièrement en-dessous si a<0 (prompt-cas-non-factorisable.md). Catégorie propre à cet exercice,
 * jamais produite par les 5 familles de l'exercice 1 (toutes garantissent Δ≥0 par construction).
 * C'est aussi la seule catégorie de "Analyse d'une fonction" où `a` peut être négatif : les 3
 * autres techniques (secondDegre/categories/*.ts) tirent toujours `a` positif.
 *
 * Construction : a tiré d'abord, puis `b = a·m` pour un entier `m` tiré indépendamment — jamais
 * b tiré directement au hasard — pour garantir x_S = -b/(2a) = -m/2 toujours demi-entier, comme
 * les 3 autres techniques (mise_en_evidence : x_S = r/2 ; binome_conjugue : x_S = 0 ; produit_remarquable :
 * x_S = r), jamais un rationnel quelconque. `c` est ensuite choisi strictement au-delà du seuil
 * b²/(4a) qui annule Δ (c > seuil si a>0, c < seuil si a<0) — jamais a,b,c tirés au hasard puis
 * rejetés après coup, même principe que le reste du projet. `yS = -Δ/(4a)` (identité valable pour
 * tout a,b,c) a donc toujours le même signe que `a` puisque `-Δ>0` par construction — propriété
 * mathématique, pas un cas particulier à gérer.
 */
export function construireIrreductible(): Omit<Exercice, "formeAffichage"> {
  const a = randomNonZeroInt(-4, 4);
  const m = randomInt(-4, 4);
  const b = a * m;
  const seuil = (b * b) / (4 * a);
  const marge = randomInt(1, 4);
  const c = a > 0 ? Math.ceil(seuil) + marge : Math.floor(seuil) - marge;

  return {
    categorie: "irreductible",
    enonce: { a, b, c },
    solution: {
      racines: [NaN, NaN],
      racinesExactes: true,
    },
  };
}
