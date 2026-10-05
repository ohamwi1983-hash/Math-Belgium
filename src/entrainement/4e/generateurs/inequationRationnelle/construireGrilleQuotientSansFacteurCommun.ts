import type { Exercice } from "../../core/generateur.types";
import type { ValeurCellule } from "../../core/signesProduit.types";
import type { GrilleQuotientSansFacteurCommun } from "../../core/inequationRationnelle.types";
import { signeLineaire, signeQuotient, valeurRepresentative } from "./grilleQuotient";

/**
 * Construit la grille de signes attendue pour numérateur_combiné/D ◇ 0 (variante "sans facteur
 * commun", item f) : contrairement au niveau 4 (2 lignes N + 2 lignes D à partir d'un P2 et de 2
 * PolynomeLineaire), ici numérateur ET dénominateur sont tous deux du 2nd degré, tous deux à
 * coefficient dominant TOUJOURS positif (construireSansFacteurCommun.ts, mêmes 3 techniques sans
 * aImpose que le numérateur combiné des niveaux 3-4) ⇒ les 4 racines (2 par polynôme) sont toutes
 * traitées comme moniques (x-r), sans ligne séparée pour un signe de tête — même raisonnement que
 * construireGrilleQuotientNiveau4 pour son unique P2. Racines toutes distinctes entre numérateur et
 * dénominateur (garanti par la construction, aucun facteur commun) ⇒ toujours 4 racines, 9 colonnes
 * (2×4+1).
 */
export function construireGrilleQuotientSansFacteurCommun(
  numerateur: Exercice,
  denominateur: Exercice,
): { racines: number[]; ce: [number, number]; grille: GrilleQuotientSansFacteurCommun } {
  const [r1, r2] = [...numerateur.solution.racines].sort((a, b) => a - b);
  const [s1, s2] = [...denominateur.solution.racines].sort((a, b) => a - b);
  const racines = [r1, r2, s1, s2].sort((a, b) => a - b);
  const nbColonnes = 2 * racines.length + 1;
  const points = Array.from({ length: nbColonnes }, (_, colonne) => valeurRepresentative(racines, colonne));

  const ligneN1 = points.map((x) => signeLineaire({ k: 1, p: r1 }, x));
  const ligneN2 = points.map((x) => signeLineaire({ k: 1, p: r2 }, x));
  const ligneD1 = points.map((x) => signeLineaire({ k: 1, p: s1 }, x));
  const ligneD2 = points.map((x) => signeLineaire({ k: 1, p: s2 }, x));

  function signeProduitDeuxFacteurs(a: ValeurCellule, b: ValeurCellule): ValeurCellule {
    if (a === "0" || b === "0") return "0";
    return a === b ? "+" : "-";
  }

  const ligneQuotient = points.map((_, i) =>
    signeQuotient(signeProduitDeuxFacteurs(ligneN1[i], ligneN2[i]), signeProduitDeuxFacteurs(ligneD1[i], ligneD2[i])),
  );

  const ce: [number, number] = [s1, s2];

  return {
    racines,
    ce,
    grille: { lignesNumerateur: [ligneN1, ligneN2], lignesDenominateur: [ligneD1, ligneD2], ligneQuotient },
  };
}
