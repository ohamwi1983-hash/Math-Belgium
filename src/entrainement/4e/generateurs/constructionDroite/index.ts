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

/** Part des droites parallèles à un axe (x = k, y = k) — le cours insiste sur ces deux cas, jamais
 * tirés auparavant (0 sur 40 000 — audit chapitre 7, point 18). */
const PROBABILITE_PARALLELE_AXE = 0.15;

/** Vecteur directeur : le plus souvent non nul sur les deux composantes, sinon parallèle à un axe —
 * jamais une direction incompatible avec la forme affichée (jamais vertical pour `explicite_y`, qui
 * reçoit alors une horizontale « y = p » ; jamais horizontal pour `explicite_x`, qui reçoit alors
 * une verticale « x = q »). */
function tirerVecteur(variante: VarianteConstructionDroite): Composantes {
  if (Math.random() < PROBABILITE_PARALLELE_AXE) {
    const horizontal = variante === "explicite_y" ? true : variante === "explicite_x" ? false : Math.random() < 0.5;
    return horizontal ? { x: 1, y: 0 } : { x: 0, y: 1 };
  }
  return { x: tirerComposanteNonNulle(), y: tirerComposanteNonNulle() };
}

export function construireExercice(variante: VarianteConstructionDroite): ExerciceConstructionDroite {
  const point: Point = { x: randomInt(-5, 5), y: randomInt(-5, 5) };
  const vecteur = tirerVecteur(variante);
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
