import type { ExerciceCercles, FamilleCercles } from "../../core6e/cercles.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD } from "./familleD";
import { construireDepuisTriangle, construireFamilleE } from "./familleE";
import { construireFamilleF } from "./familleF";
import { construireFamilleG } from "./familleG";

export { construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleD, construireFamilleE, construireDepuisTriangle, construireFamilleF, construireFamilleG };

/**
 * Couche A (6e) — point d'entrée `6gen55` ("Cercles", chapitre "Lieux géométriques"). Aucune
 * famille n'a de sous-type (contrairement à `6gen43`) — tirage à un seul niveau, ÉQUIPROBABLE entre
 * les 7 familles A à G.
 */

export type IdVarianteCercles = FamilleCercles;

export const CATALOGUE_VARIANTES: { id: IdVarianteCercles; label: string }[] = [
  { id: "A", label: "A — Cercle par 3 points" },
  { id: "B", label: "B — Cercle par 2 points, rayon donné" },
  { id: "C", label: "C — Cercle par 2 points, centre sur une droite donnée" },
  { id: "D", label: "D — Cercle tangent à un axe en un point donné" },
  { id: "E", label: "E — Cercle inscrit à un triangle" },
  { id: "F", label: "F — Cercle avec corde de longueur donnée" },
  { id: "G", label: "G — Cercles tangents à 3 droites (réutilise E)" },
];

export function construireAvecVarianteId(id: IdVarianteCercles): ExerciceCercles {
  switch (id) {
    case "A":
      return construireFamilleA();
    case "B":
      return construireFamilleB();
    case "C":
      return construireFamilleC();
    case "D":
      return construireFamilleD();
    case "E":
      return construireFamilleE();
    case "F":
      return construireFamilleF();
    case "G":
      return construireFamilleG();
  }
}

const FAMILLES: FamilleCercles[] = ["A", "B", "C", "D", "E", "F", "G"];

export function genererExerciceCercles(): ExerciceCercles {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return construireAvecVarianteId(famille);
}
