import type { Exercice } from "../../core/generateur.types";
import type { FacteurQuadratiqueFactorisable } from "../../core/signesProduit.types";
import { construireProduitRemarquable } from "../secondDegre/categories/produitRemarquable";
import { randomInt } from "../secondDegre/aleatoire";

const TENTATIVES_MAX = 50;

/**
 * Facteur « carré » a(x−r)² (catégorie produit_remarquable, racine double — audit gen5) : même
 * parcours que tout facteur factorisable (réduction si |a|>1, méthode, factorisation, racine), mais
 * une seule ligne « (x−r)² » dans le tableau et une seule colonne pour r (grille.ts). Mêmes bornes
 * que `construireFacteurFactorisable` (|a| ≤ 4, signe tiré au hasard ; r ∈ [−5 ; 5] non nul), r
 * toujours distincte des racines des autres facteurs.
 */
export function construireFacteurCarre(racinesExclues: number[]): { facteur: FacteurQuadratiqueFactorisable; racine: number } {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const magnitude = randomInt(1, 4);
    const a = randomInt(0, 1) === 0 ? magnitude : -magnitude;
    const brut = construireProduitRemarquable({ aImpose: a });
    const r = brut.solution.racines[0];
    if (racinesExclues.includes(r)) continue;
    const exercice: Exercice = { ...brut, formeAffichage: "canonique" };
    return { facteur: { type: "quadratique_factorisable", exercice }, racine: r };
  }
  throw new Error("construireFacteurCarre : aucune racine double sans collision trouvée");
}
