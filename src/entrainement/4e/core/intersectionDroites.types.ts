import type { DroiteExpliciteX, DroiteExpliciteY, DroiteImplicite, DroiteParametrique } from "./droite.types";
import type { Composantes, Point } from "./vecteur.types";

export type VarianteIntersectionDroites = "cart_cart" | "param_cart" | "param_param";

export type ConclusionIntersectionDroites = "secantes" | "paralleles_distinctes" | "confondues";

export type FormeLigneCartesienne = "implicite" | "explicite_y" | "explicite_x";

/**
 * Une des deux droites du couple — le couple (point, vecteur directeur) reste TOUJOURS la seule
 * source de vérité géométrique (colinéarité, appartenance, intersection), quelle que soit la forme
 * affichée. `implicite` est TOUJOURS calculable (jamais de cas "forme impossible" ici — le vecteur
 * directeur a toujours ses deux composantes non nulles, garanti à la génération, contrairement à
 * "Équation d'une droite") et sert de référence cartésienne canonique pour l'écran 1 comme pour le
 * calcul de l'intersection cart_cart. Un seul des 3 champs `xxxAffichee` est non-null à la fois,
 * selon `forme` — même patron que `ExerciceEquationDroite` ("un seul champ non-null à la fois").
 */
export interface LigneIntersection {
  point: Point;
  vecteur: Composantes;
  implicite: DroiteImplicite;
  forme: FormeLigneCartesienne | "parametrique";
  parametriqueAffichee: DroiteParametrique | null;
  expliciteYAffichee: DroiteExpliciteY | null;
  expliciteXAffichee: DroiteExpliciteX | null;
}

export interface ExerciceIntersectionDroites {
  variante: VarianteIntersectionDroites;
  d1: LigneIntersection;
  d2: LigneIntersection;
  /** Vérité terrain de l'écran 1, sous-étape 1 — vecteurs directeurs colinéaires ou non. */
  colineaires: boolean;
  /** Vérité terrain de l'écran 1 — le cas réellement présenté (secantes/paralleles_distinctes/confondues). */
  conclusion: ConclusionIntersectionDroites;
  /** Non-null ssi `conclusion === "secantes"` — jamais recalculé différemment ailleurs. */
  point: Point | null;
  /** Paramètre de `d1` au point d'intersection — non-null ssi `d1.forme === "parametrique"` ET `conclusion === "secantes"`. */
  tAttendu: number | null;
  /** Paramètre de `d2` au point d'intersection — non-null ssi `d2.forme === "parametrique"` ET `conclusion === "secantes"`. */
  sAttendu: number | null;
}

export type GenerateurExerciceIntersectionDroites = () => ExerciceIntersectionDroites;
