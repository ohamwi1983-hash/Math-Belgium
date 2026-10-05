/**
 * Couche A — "Construction graphique — tracer une droite depuis son équation". Construit un point
 * + vecteur directeur ENTIERS (mêmes petites plages que "Équation d'une droite"/"Lecture
 * graphique"), jamais un tirage-puis-classification, puis dérive UNIQUEMENT la forme de sortie
 * demandée par `variante` (les 3 autres champs restent `null` — jamais calculés inutilement).
 *
 * Contrairement à "Équation d'une droite", ce générateur ne connaît jamais de cas "forme
 * impossible" : `variante` détermine directement les contraintes de tirage du vecteur (jamais
 * vertical si `explicite_y`, jamais horizontal si `explicite_x`), l'équation cible est donc
 * TOUJOURS calculable pour l'exercice généré.
 */
import type { FormeSortieDroite } from "../../core/droite.types";
import type { ExerciceConstructionDroite, VarianteConstructionDroite } from "../../core/constructionDroite.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import {
  expliciteXDepuisPointVecteur,
  expliciteYDepuisPointVecteur,
  implicteDepuisPointVecteur,
  parametriqueDepuisPointVecteur,
} from "../droite/geometrieDroite";

const VARIANTES: VarianteConstructionDroite[] = ["parametrique", "implicite", "explicite_y", "explicite_x"];

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function tirerComposanteNonNulle(): number {
  return randomInt(1, 4) * (Math.random() < 0.5 ? -1 : 1);
}

/** Vecteur directeur toujours non nul sur les deux composantes — garantit `formeExpliciteYPossible`
 * ET `formeExpliciteXPossible` simultanément, sans jamais avoir besoin de distinguer le cas par
 * `variante` (contrairement à "Équation d'une droite", qui force volontairement le cas-piège). */
function tirerVecteur(): Composantes {
  return { x: tirerComposanteNonNulle(), y: tirerComposanteNonNulle() };
}

export function construireExercice(variante: VarianteConstructionDroite): ExerciceConstructionDroite {
  const point: Point = { x: randomInt(-5, 5), y: randomInt(-5, 5) };
  const vecteur = tirerVecteur();
  const referenceImplicite = implicteDepuisPointVecteur(point, vecteur);

  return {
    variante,
    point,
    vecteur,
    referenceImplicite,
    parametrique: variante === "parametrique" ? parametriqueDepuisPointVecteur(point, vecteur) : null,
    implicite: variante === "implicite" ? referenceImplicite : null,
    expliciteY: variante === "explicite_y" ? expliciteYDepuisPointVecteur(point, vecteur) : null,
    expliciteX: variante === "explicite_x" ? expliciteXDepuisPointVecteur(point, vecteur) : null,
  };
}

export const CATALOGUE_VARIANTES: { id: VarianteConstructionDroite; label: string }[] = [
  { id: "parametrique", label: "Représentation paramétrique" },
  { id: "implicite", label: "Équation cartésienne (implicite)" },
  { id: "explicite_y", label: "Équation réduite y = mx + p" },
  { id: "explicite_x", label: "Équation réduite x = ny + q" },
];

export function construireAvecVarianteId(varianteId: VarianteConstructionDroite): ExerciceConstructionDroite {
  return construireExercice(varianteId);
}

export function genererExerciceConstructionDroite(): ExerciceConstructionDroite {
  const variante: FormeSortieDroite = VARIANTES[randomInt(0, VARIANTES.length - 1)];
  return construireExercice(variante);
}
