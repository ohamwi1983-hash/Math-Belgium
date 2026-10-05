import type { Exercice } from "../../core/generateur.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import type { ValeurCellule } from "../../core/signesProduit.types";
import type { GrilleQuotientNiveau3 } from "../../core/inequationRationnelle.types";
import { signeLineaire, signeQuotient, valeurRepresentative } from "./grilleQuotient";

/**
 * Construit la grille de signes attendue pour P2_1/P1_2 ◇ 0 (niveau 3) : P2_1 (2nd degré,
 * coefficient dominant toujours positif par construction — voir construireNiveau3.ts, ce qui
 * permet de traiter ses 2 racines comme deux lignes N moniques, sans ligne séparée pour le signe
 * du coefficient dominant, même principe que construireFacteurFactorisable — signesProduit)
 * apporte 2 lignes N (une par racine, réutilise signeLineaire avec un polynôme monique {k:1,p:r}),
 * P1_2 une ligne D (signeLineaire directement — gère nativement un coefficient négatif, aucune
 * décomposition nécessaire puisqu'il n'y a qu'un seul facteur). Racines toutes distinctes
 * (garanti par la construction) ⇒ 3 racines, 7 colonnes (2×3+1).
 */
export function construireGrilleQuotientNiveau3(
  p2_1: Exercice,
  p1_2: PolynomeLineaire,
): { racines: number[]; ce: number; grille: GrilleQuotientNiveau3 } {
  const [r1, r2] = [...p2_1.solution.racines].sort((a, b) => a - b);
  const racines = [r1, r2, p1_2.p].sort((a, b) => a - b);
  const nbColonnes = 2 * racines.length + 1;
  const points = Array.from({ length: nbColonnes }, (_, colonne) => valeurRepresentative(racines, colonne));

  const ligneN1 = points.map((x) => signeLineaire({ k: 1, p: r1 }, x));
  const ligneN2 = points.map((x) => signeLineaire({ k: 1, p: r2 }, x));
  const ligneDenominateur = points.map((x) => signeLineaire(p1_2, x));

  function signeProduitNumerateur(n1: ValeurCellule, n2: ValeurCellule): ValeurCellule {
    if (n1 === "0" || n2 === "0") return "0";
    return n1 === n2 ? "+" : "-";
  }

  const ligneQuotient = points.map((_, i) => signeQuotient(signeProduitNumerateur(ligneN1[i], ligneN2[i]), ligneDenominateur[i]));

  return {
    racines,
    ce: p1_2.p,
    grille: { lignesNumerateur: [ligneN1, ligneN2], ligneDenominateur, ligneQuotient },
  };
}
