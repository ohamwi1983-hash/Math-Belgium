import type { ExerciceConiqueB } from "../../core6e/identificationConiques.types";
import { classifierConiqueCentree, elementsConiqueCentree, tirerTripletCanonique } from "./classification";
import type { CategorieConiqueCentree } from "./classification";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille B de `6gen58` : `Ax²+By²+Dx+Ey+F=0`, DÉCENTRÉE (D≠0 et/ou
 * E≠0). Construite "à l'envers" (mission) : on tire d'abord un CENTRE `(h,k)` et une catégorie
 * cible (réutilisant `tirerTripletCanonique`, la MÊME fabrique de triplets `{coeffX,coeffY,M}`
 * "propres" que la famille A sous-type 1 — aucune duplication de cette logique), puis on développe
 * `A(x-h)²+B(y-k)²=M` pour obtenir les coefficients développés `D=-2Ah`, `E=-2Bk`,
 * `F=Ah²+Bk²-M` — toujours des ENTIERS puisque `A,B,h,k,M` le sont tous.
 *
 * `~20%` des instances donnent `∅` après complétion (mission) : la catégorie `"vide"` occupe 2
 * cases sur 9 dans `CATEGORIES_PONDEREES` (≈22%, suffisamment proche).
 */

const CATEGORIES_PONDEREES: CategorieConiqueCentree[] = ["ellipseHorizontal", "ellipseVertical", "cercle", "vide", "vide", "point", "hyperboleHorizontal", "hyperboleVertical", "droitesSecantes"];

/** Centre `(h,k)` non nul (au moins une coordonnée ≠0, garantissant `D≠0` et/ou `E≠0` — condition
 * "décentrée" de la mission). */
function tirerCentreDecentre(): { h: number; k: number } {
  for (;;) {
    const h = tirerEntier(-4, 4);
    const k = tirerEntier(-4, 4);
    if (h !== 0 || k !== 0) return { h, k };
  }
}

export function construireFamilleB(categorie: CategorieConiqueCentree = tirerParmi(CATEGORIES_PONDEREES)): ExerciceConiqueB {
  const { h, k } = tirerCentreDecentre();
  const { coeffX: A, coeffY: B, M } = tirerTripletCanonique(categorie);

  // A(x-h)²+B(y-k)²=M développé : Ax²+By²-2Ah·x-2Bk·y+(Ah²+Bk²-M)=0. `|| 0` normalise un éventuel
  // `-0` JavaScript (h=0 ou k=0 individuellement, l'autre non nul — "décentrée" n'exige qu'UNE des
  // deux coordonnées non nulle) en `0` propre, jamais affiché "-0" (signe non simplifié).
  const D = -2 * A * h || 0;
  const E = -2 * B * k || 0;
  const F = A * h * h + B * k * k - M || 0;

  const nature = classifierConiqueCentree(A, B, M, { x: h, y: k });
  const elements = nature.type === "cercle" || nature.type === "ellipse" || nature.type === "hyperbole" ? elementsConiqueCentree(A, B, M, nature) : {};

  return { famille: "B", A, B, D, E, F, centre: { x: h, y: k }, M, nature, elements };
}
