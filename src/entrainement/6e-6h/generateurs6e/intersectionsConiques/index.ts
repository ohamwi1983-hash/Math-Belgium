import type { ExerciceIntersectionsConiques } from "../../core6e/intersectionsConiques.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { tirerParmi } from "./aleatoire";

export { construireFamilleA, resoudreIntersectionDroiteConique } from "./familleA";
export type { OverridesFamilleA, ResultatIntersectionDroiteConique } from "./familleA";
export { construireFamilleB } from "./familleB";
export type { OverridesFamilleB } from "./familleB";

/**
 * Couche A (6e) — point d'entrée `6gen61` ("Intersections : droite-conique et conique-conique").
 * Tirage à 1 niveau : la FAMILLE (A ou B) est tirée équiprobable ; le reste (nature de conique,
 * sous-type de droite, nombre de solutions...) est tiré À L'INTÉRIEUR de `construireFamilleA`
 * (mirroir `identificationConiques/index.ts`, 6gen58 / `equationConiqueCaracteristiques/index.ts`,
 * 6gen59).
 */

export type IdVarianteIntersectionsConiques =
  | "A_ellipse_deuxPoints"
  | "A_ellipse_mediatrice"
  | "A_ellipse_hauteur"
  | "A_hyperbole_deuxPoints"
  | "A_hyperbole_mediatrice"
  | "A_hyperbole_hauteur"
  | "A_cercle_deuxPoints"
  | "A_cercle_mediatrice"
  | "A_cercle_hauteur"
  | "A_ellipse_0solution"
  | "A_ellipse_1solution"
  | "A_ellipse_2solutions"
  | "A_hyperbole_1solution"
  | "A_hyperbole_2solutions"
  | "B_combinaison";

export const CATALOGUE_VARIANTES: { id: IdVarianteIntersectionsConiques; label: string }[] = [
  { id: "A_ellipse_deuxPoints", label: "A — ellipse, droite par 2 points" },
  { id: "A_ellipse_mediatrice", label: "A — ellipse, droite = médiatrice (piège perpendicularité)" },
  { id: "A_ellipse_hauteur", label: "A — ellipse, droite = hauteur (piège perpendicularité)" },
  { id: "A_hyperbole_deuxPoints", label: "A — hyperbole, droite par 2 points" },
  { id: "A_hyperbole_mediatrice", label: "A — hyperbole, droite = médiatrice (piège perpendicularité)" },
  { id: "A_hyperbole_hauteur", label: "A — hyperbole, droite = hauteur (piège perpendicularité)" },
  { id: "A_cercle_deuxPoints", label: "A — cercle, droite par 2 points" },
  { id: "A_cercle_mediatrice", label: "A — cercle, droite = médiatrice (piège perpendicularité)" },
  { id: "A_cercle_hauteur", label: "A — cercle, droite = hauteur (piège perpendicularité)" },
  { id: "A_ellipse_0solution", label: "A — ellipse : 0 solution (droite manquée)" },
  { id: "A_ellipse_1solution", label: "A — ellipse : 1 solution (tangente)" },
  { id: "A_ellipse_2solutions", label: "A — ellipse : 2 solutions (sécante)" },
  { id: "A_hyperbole_1solution", label: "A — hyperbole : 1 solution (tangente)" },
  { id: "A_hyperbole_2solutions", label: "A — hyperbole : 2 solutions (sécante)" },
  { id: "B_combinaison", label: "B — combinaison linéaire λC1+μC2 (cercle caché)" },
];

export function construireAvecVarianteId(id: IdVarianteIntersectionsConiques): ExerciceIntersectionsConiques {
  switch (id) {
    case "A_ellipse_deuxPoints":
      return construireFamilleA({ natureConique: "ellipse", sousTypeDroite: "deuxPoints" });
    case "A_ellipse_mediatrice":
      return construireFamilleA({ natureConique: "ellipse", sousTypeDroite: "mediatrice" });
    case "A_ellipse_hauteur":
      return construireFamilleA({ natureConique: "ellipse", sousTypeDroite: "hauteur" });
    case "A_hyperbole_deuxPoints":
      return construireFamilleA({ natureConique: "hyperbole", sousTypeDroite: "deuxPoints" });
    case "A_hyperbole_mediatrice":
      return construireFamilleA({ natureConique: "hyperbole", sousTypeDroite: "mediatrice" });
    case "A_hyperbole_hauteur":
      return construireFamilleA({ natureConique: "hyperbole", sousTypeDroite: "hauteur" });
    case "A_cercle_deuxPoints":
      return construireFamilleA({ natureConique: "cercle", sousTypeDroite: "deuxPoints" });
    case "A_cercle_mediatrice":
      return construireFamilleA({ natureConique: "cercle", sousTypeDroite: "mediatrice" });
    case "A_cercle_hauteur":
      return construireFamilleA({ natureConique: "cercle", sousTypeDroite: "hauteur" });
    case "A_ellipse_0solution":
      return construireFamilleA({ natureConique: "ellipse", sousTypeDroite: "mediatrice", nombreSolutions: 0 });
    case "A_ellipse_1solution":
      return construireFamilleA({ natureConique: "ellipse", sousTypeDroite: "hauteur", nombreSolutions: 1 });
    case "A_ellipse_2solutions":
      return construireFamilleA({ natureConique: "ellipse", sousTypeDroite: "mediatrice", nombreSolutions: 2 });
    case "A_hyperbole_1solution":
      return construireFamilleA({ natureConique: "hyperbole", sousTypeDroite: "hauteur", nombreSolutions: 1 });
    case "A_hyperbole_2solutions":
      return construireFamilleA({ natureConique: "hyperbole", sousTypeDroite: "mediatrice", nombreSolutions: 2 });
    case "B_combinaison":
      return construireFamilleB();
  }
}

export function genererExerciceIntersectionsConiques(): ExerciceIntersectionsConiques {
  const famille = tirerParmi(["A", "B"] as const);
  return famille === "A" ? construireFamilleA() : construireFamilleB();
}
