import type { Exercice } from "../../core/generateur.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import type { ValeurCellule } from "../../core/signesProduit.types";
import type { GrilleQuotientCubique } from "../../core/inequationRationnelle.types";
import { signeLineaire, signeQuotient, valeurRepresentative } from "./grilleQuotient";

/**
 * Construit la grille de signes attendue pour N(x)/D(x) ◇ 0 (variante "cubique", item b), où
 * N(x) = x·(ax²+bx+c) — le facteur x mis en évidence, toujours en première ligne N (indépendamment
 * de sa position numérique parmi les racines), suivi des 2 racines du facteur quadratique
 * (`quadratique`, coefficient dominant toujours positif par construction — mêmes 3 techniques sans
 * aImpose que les autres facteurs factorisables du projet), triées croissant. `denominateur` est un
 * vrai PolynomeLineaire (k quelconque, signeLineaire le gère nativement, pas besoin d'hypothèse de
 * signe comme pour le numérateur). Racines toutes distinctes (0, q1, q2, p garantis distincts par
 * construction) ⇒ toujours 4 racines, 9 colonnes (2×4+1).
 */
export function construireGrilleQuotientCubique(
  quadratique: Exercice,
  denominateur: PolynomeLineaire,
): { racines: number[]; ce: number; grille: GrilleQuotientCubique } {
  const [q1, q2] = [...quadratique.solution.racines].sort((a, b) => a - b);
  const racines = [0, q1, q2, denominateur.p].sort((a, b) => a - b);
  const nbColonnes = 2 * racines.length + 1;
  const points = Array.from({ length: nbColonnes }, (_, colonne) => valeurRepresentative(racines, colonne));

  const ligneX = points.map((x) => signeLineaire({ k: 1, p: 0 }, x));
  const ligneQ1 = points.map((x) => signeLineaire({ k: 1, p: q1 }, x));
  const ligneQ2 = points.map((x) => signeLineaire({ k: 1, p: q2 }, x));
  const ligneD = points.map((x) => signeLineaire(denominateur, x));

  function signeProduitTroisFacteurs(s1: ValeurCellule, s2: ValeurCellule, s3: ValeurCellule): ValeurCellule {
    if (s1 === "0" || s2 === "0" || s3 === "0") return "0";
    const negatifs = [s1, s2, s3].filter((s) => s === "-").length;
    return negatifs % 2 === 0 ? "+" : "-";
  }

  const ligneQuotient = points.map((_, i) => signeQuotient(signeProduitTroisFacteurs(ligneX[i], ligneQ1[i], ligneQ2[i]), ligneD[i]));

  return {
    racines,
    ce: denominateur.p,
    grille: { lignesNumerateur: [ligneX, ligneQ1, ligneQ2], ligneDenominateur: ligneD, ligneQuotient },
  };
}
