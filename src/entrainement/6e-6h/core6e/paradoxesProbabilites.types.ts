/**
 * Couche A (6e) — types de `6gen76` « Quand l'intuition se trompe » (audit 6e ch. 6, décision M,
 * fiche P3) : trois paradoxes classiques, format COURT de motivation (4 écrans).
 *
 * - `mere` : paris du chevalier de Méré — au moins un 6 en 4 lancers d'un dé contre au moins un
 *   double six en k lancers de deux dés (k = 24 ou 25). Piège : la proportionnalité 4 × 1/6 = 24 × 1/36.
 * - `montyHall` : n portes (3, 4 ou 5), l'animateur ouvre une porte à chèvre ; garder ou changer.
 *   Piège : « il reste des portes fermées équiprobables, ça revient au même ».
 * - `deuxEnfants` : « au moins un garçon » (1/3) contre « l'aîné (ou le cadet) est un garçon » (1/2).
 *   Piège : traiter les compositions {2 garçons, 1 garçon et 1 fille, 2 filles} comme équiprobables.
 */

export type FamilleParadoxe = "mere" | "montyHall" | "deuxEnfants";

export interface ExerciceMere {
  famille: "mere";
  /** Nombre de lancers de DEUX dés du pari 2 (le pari 1 est toujours « 4 lancers d'un dé »). */
  kLancersDouble: 24 | 25;
  /** Ordre d'affichage des options de la conclusion (indices dans la liste canonique). */
  ordreConclusion: number[];
}

export interface ExerciceMontyHall {
  famille: "montyHall";
  nPortes: 3 | 4 | 5;
  /** Porte choisie au départ (1 à n) et porte ouverte par l'animateur (≠ porteChoisie). */
  porteChoisie: number;
  porteOuverte: number;
  ordreConclusion: number[];
}

export interface ExerciceDeuxEnfants {
  famille: "deuxEnfants";
  /** Information reçue : « au moins un des deux » ou le sexe d'un enfant DÉSIGNÉ par son rang. */
  information: "auMoinsUn" | "rang";
  rang: "aine" | "cadet";
  sexe: "garcon" | "fille";
  ordreConclusion: number[];
}

export type ExerciceParadoxesProbabilites = ExerciceMere | ExerciceMontyHall | ExerciceDeuxEnfants;
