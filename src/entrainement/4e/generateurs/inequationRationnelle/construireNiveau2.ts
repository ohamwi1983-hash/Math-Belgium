import type { Symbole } from "../../core/inequation.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import type { ExerciceInequationRationnelleNiveau2 } from "../../core/inequationRationnelle.types";
import { randomInt, randomNonZeroInt } from "../secondDegre/aleatoire";
import { construireFacteurLineaire } from "../signesProduit/construireFacteurLineaire";
import { classifierSolutionQuotient, construireGrilleQuotient, extraireSignesZonesQuotient } from "./grilleQuotient";

const SYMBOLES: Symbole[] = ["<", ">", "≤", "≥"];

/**
 * P1_1 = P1_3 + k·P1_2 (section 1 de la spec) — construit "à l'envers" comme le reste du projet :
 * P1_3/P1_2 sont choisis en premier (le couple qu'on retrouvera après combinaison), puis P1_1 en
 * est déduit. Retourne null si le résultat serait dégénéré (coefficient dominant nul — P1_1 ne
 * serait alors plus un vrai polynôme du 1er degré) ou si la racine ne tombe pas sur un entier
 * (préférence du projet pour des exemples à coefficients entiers, comme tous les autres
 * générateurs) — dans les deux cas, l'appelant retire un nouveau triplet (P1_3, P1_2, k).
 */
function construireNumerateurAvantCombinaison(p1_3: PolynomeLineaire, p1_2: PolynomeLineaire, k: number): PolynomeLineaire | null {
  const nouveauK = p1_3.k + k * p1_2.k;
  if (nouveauK === 0) return null;
  const nouveauNumerateurDeP = p1_3.k * p1_3.p + k * p1_2.k * p1_2.p;
  if (nouveauNumerateurDeP % nouveauK !== 0) return null;
  return { k: nouveauK, p: nouveauNumerateurDeP / nouveauK };
}

/**
 * Construit un exercice de niveau 2 (section 1 de la spec) : P1_1/P1_2 ◇ k, k ≠ 0 — sinon c'est le
 * niveau 1 (exclu explicitement par le tirage `randomNonZeroInt`). Réutilise construireFacteurLineaire
 * (générateur "tableau de signes à plusieurs facteurs") pour P1_3 et P1_2, exactement comme
 * construireNiveau1 — la racine de P1_2 exclut activement celle de P1_3, garantissant des racines
 * toujours distinctes. La grille/CE/racines/solution sont calculées sur (P1_3, P1_2) — le couple
 * post-combinaison — via les mêmes fonctions que le niveau 1 (construireGrilleQuotient,
 * classifierSolutionQuotient), aucune duplication de logique.
 */
export function construireNiveau2(): ExerciceInequationRationnelleNiveau2 {
  let numerateurAvantCombinaison: PolynomeLineaire | null = null;
  let p1_3: PolynomeLineaire = { k: 1, p: 0 };
  let p1_2: PolynomeLineaire = { k: 1, p: 0 };
  let k = 1;

  while (numerateurAvantCombinaison === null) {
    const { facteur: facteurP1_3, racine: racineP1_3 } = construireFacteurLineaire([]);
    const { facteur: facteurP1_2 } = construireFacteurLineaire([racineP1_3]);
    p1_3 = facteurP1_3.polynome;
    p1_2 = facteurP1_2.polynome;
    k = randomNonZeroInt(-5, 5);
    numerateurAvantCombinaison = construireNumerateurAvantCombinaison(p1_3, p1_2, k);
  }

  const symbole = SYMBOLES[randomInt(0, SYMBOLES.length - 1)];
  const { racines, ce, grille } = construireGrilleQuotient(p1_3, p1_2);
  const zones = extraireSignesZonesQuotient(grille.ligneQuotient);
  const solution = classifierSolutionQuotient(racines, ce, zones, symbole);

  return {
    niveau: "niveau2",
    numerateur: p1_3,
    denominateur: p1_2,
    numerateurAvantCombinaison,
    k,
    symbole,
    ce,
    racines,
    grille,
    solution,
  };
}
