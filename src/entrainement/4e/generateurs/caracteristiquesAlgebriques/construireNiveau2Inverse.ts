import type { ExerciceNiveau2Quadratique } from "../../core/caracteristiquesAlgebriques.types";
import { construireExerciceClassifie } from "../equationRationnelle/construireExerciceClassifie";
import { randomInt, randomIntNonNul } from "./aleatoire";

/**
 * Niveau 2, famille `inverse` — `f(x) = 1/(ax+b) + (cx+d)`. Les zéros résolvent
 * `1/(ax+b) = -(cx+d)`, qui — après produit en croix (valide, `ax+b≠0` déjà exclu par la CE) —
 * développe en `ac·x² + (ad+bc)x + (bd+1) = 0` : contrairement à `carre`, cette équation est
 * BILINÉAIRE en (b,d) une fois (a,c) fixés (le terme `bd` dans le coefficient constant couple les
 * deux inconnues), donc pas d'inversion directe possible comme pour `carre` — recherche par essais
 * successifs (a,b,c,d petits entiers, `a≠0`, `c≠0`), retenue si le discriminant de l'équation
 * dérivée est un carré parfait ET ses deux racines sont entières (nécessaire : `EtapeChamp2`,
 * réutilisé tel quel pour cette famille, ne parse que des nombres bruts, jamais des fractions) —
 * même principe de recherche déjà établi ailleurs dans le projet (`construireDeuxDenominateurs`,
 * `chercherEquationSimplifiee`), plages croissantes en cas d'échec prolongé. Taux de succès
 * empirique ~1,5% à la plage [-4,4] (donc quelques dizaines de tentatives suffisent en pratique).
 */
export function construireNiveau2Inverse(): ExerciceNiveau2Quadratique {
  const plages = [4, 6, 8, 10];
  for (const borne of plages) {
    for (let tentative = 0; tentative < 3000; tentative++) {
      const a = randomIntNonNul(-borne, borne);
      const b = randomInt(-borne, borne);
      const c = randomIntNonNul(-borne, borne);
      const d = randomInt(-borne, borne);

      const A = a * c;
      const B = a * d + b * c;
      const C = b * d + 1;
      const discriminant = B * B - 4 * A * C;
      if (discriminant < 0) continue;

      const racineDiscriminant = Math.sqrt(discriminant);
      if (!Number.isInteger(racineDiscriminant)) continue;

      const r1 = (-B - racineDiscriminant) / (2 * A);
      const r2 = (-B + racineDiscriminant) / (2 * A);
      if (!Number.isInteger(r1) || !Number.isInteger(r2)) continue;

      const zeros = construireExerciceClassifie(A, r1, r2);
      return { niveau: "niveau2", famille: "inverse", a, b, c, d, zeros };
    }
  }
  throw new Error("construireNiveau2Inverse : aucune combinaison valide trouvée après recherche exhaustive");
}
