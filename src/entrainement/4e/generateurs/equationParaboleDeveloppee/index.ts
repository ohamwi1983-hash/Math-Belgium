/**
 * Couche A — "Sommet, foyer, p et directrice d'une parabole depuis l'équation développée". 2
 * variantes MÉLANGÉES : `"vertical"` (x seul au carré) et `"horizontal"` (y seul au carré).
 *
 * Construction — direction sommet/foyer → équation développée (jamais l'inverse, plus fiable pour
 * garantir une équation "propre", coefficients entiers), même principe que "Centre et rayon d'un
 * cercle depuis l'équation développée" :
 *  - S entier, décalage entier non nul le long de l'axe → F entier, p=2×décalage (composante
 *    SIGNÉE), directrice symétrique de F par rapport à S (`2×S_axe - F_axe`).
 *  - a entier strictement positif (coefficient devant le terme carré, jamais 0 — le sens
 *    d'ouverture est déjà entièrement porté par p, jamais doublé par un a négatif).
 *  - bCarre=-2a·S_carré, bAutre=-2a·p, c=-a(2p·S_autre+S_carré²) : coefficients TOUJOURS entiers
 *    par construction (produits/sommes d'entiers).
 */
import type { ExerciceEquationParaboleDeveloppee } from "../../core/equationParaboleDeveloppee.types";
import type { OrientationParabole } from "../../core/equationParabole.types";
import type { Point } from "../../core/vecteur.types";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const BORNE_SOMMET = 3;
const BORNE_DECALAGE = 4;
const VALEURS_A = [1, 2, 3, 4];

function tirerDecalage(): number {
  let d = 0;
  while (d === 0) d = randomInt(-BORNE_DECALAGE, BORNE_DECALAGE);
  return d;
}

export function construireExercice(variante: OrientationParabole): ExerciceEquationParaboleDeveloppee {
  const sommet: Point = { x: randomInt(-BORNE_SOMMET, BORNE_SOMMET), y: randomInt(-BORNE_SOMMET, BORNE_SOMMET) };
  const decalage = tirerDecalage();
  const a = VALEURS_A[randomInt(0, VALEURS_A.length - 1)]!;

  const sommetCarre = variante === "vertical" ? sommet.x : sommet.y;
  const sommetAutre = variante === "vertical" ? sommet.y : sommet.x;

  const foyer: Point = variante === "vertical" ? { x: sommet.x, y: sommet.y + decalage } : { x: sommet.x + decalage, y: sommet.y };
  const p = 2 * decalage;
  const directrice = 2 * sommetAutre - (variante === "vertical" ? foyer.y : foyer.x);

  const bCarre = -2 * a * sommetCarre;
  const bAutre = -2 * a * p;
  const c = -a * (2 * p * sommetAutre + sommetCarre * sommetCarre);

  return { variante, a, bCarre, bAutre, c, sommet, foyer, p, directrice };
}

export const CATALOGUE_VARIANTES: { id: OrientationParabole; label: string }[] = [
  { id: "vertical", label: "Axe vertical" },
  { id: "horizontal", label: "Axe horizontal" },
];

export function construireAvecVarianteId(varianteId: OrientationParabole): ExerciceEquationParaboleDeveloppee {
  return construireExercice(varianteId);
}

export function genererExerciceEquationParaboleDeveloppee(): ExerciceEquationParaboleDeveloppee {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)]!.id;
  return construireAvecVarianteId(varianteId);
}
