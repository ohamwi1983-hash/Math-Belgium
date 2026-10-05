import type { Exercice } from "../../core/generateur.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import type { ValeurCellule } from "../../core/signesProduit.types";
import type { GrilleQuotientNiveau4 } from "../../core/inequationRationnelle.types";
import { signeLineaire, signeQuotient, valeurRepresentative } from "./grilleQuotient";

/**
 * Construit la grille de signes attendue pour P2_1/(P1_2·P1_4) ◇ 0 (niveau 4) : P2_1 (2nd degré,
 * coefficient dominant TOUJOURS positif — voir construireNiveau4.ts, qui rejette et rééchantillonne
 * tout tirage produisant `a≤0`, même convention que construireFacteurFactorisable/niveau3) apporte
 * 2 lignes N traitées comme moniques (x-r1)/(x-r2), sans ligne séparée pour le signe de `a` :
 * signeProduitDeuxFacteurs ci-dessous ne serait PAS correcte si `a` pouvait être négatif (le signe
 * réel du numérateur est `a·(x-r1)·(x-r2)`, pas seulement `(x-r1)·(x-r2)`), d'où l'exigence stricte
 * `a>0` côté construction.
 *
 * P1_2 et P1_4 apportent chacun une ligne D (signeLineaire directement, gère nativement un
 * coefficient négatif — un dénominateur, contrairement au numérateur ci-dessus, n'a pas besoin
 * d'être positif : diviser inverse déjà le signe correctement, voir signeQuotient). Racines toutes
 * distinctes (garanti par la construction) ⇒ 4 racines, 9 colonnes (2×4+1).
 */
export function construireGrilleQuotientNiveau4(
  p2_1: Exercice,
  p1_2: PolynomeLineaire,
  p1_4: PolynomeLineaire,
): { racines: number[]; ce: [number, number]; grille: GrilleQuotientNiveau4 } {
  const [r1, r2] = [...p2_1.solution.racines].sort((a, b) => a - b);
  const racines = [r1, r2, p1_2.p, p1_4.p].sort((a, b) => a - b);
  const nbColonnes = 2 * racines.length + 1;
  const points = Array.from({ length: nbColonnes }, (_, colonne) => valeurRepresentative(racines, colonne));

  const ligneN1 = points.map((x) => signeLineaire({ k: 1, p: r1 }, x));
  const ligneN2 = points.map((x) => signeLineaire({ k: 1, p: r2 }, x));
  const ligneD1 = points.map((x) => signeLineaire(p1_2, x));
  const ligneD2 = points.map((x) => signeLineaire(p1_4, x));

  function signeProduitDeuxFacteurs(s1: ValeurCellule, s2: ValeurCellule): ValeurCellule {
    if (s1 === "0" || s2 === "0") return "0";
    return s1 === s2 ? "+" : "-";
  }

  const ligneQuotient = points.map((_, i) =>
    signeQuotient(signeProduitDeuxFacteurs(ligneN1[i], ligneN2[i]), signeProduitDeuxFacteurs(ligneD1[i], ligneD2[i])),
  );

  const ce: [number, number] = [p1_2.p, p1_4.p].sort((a, b) => a - b) as [number, number];

  return {
    racines,
    ce,
    grille: { lignesNumerateur: [ligneN1, ligneN2], lignesDenominateur: [ligneD1, ligneD2], ligneQuotient },
  };
}
