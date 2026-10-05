/**
 * Couche A — "Équation d'une parabole depuis un graphe". 2 variantes MÉLANGÉES dans le même
 * générateur (jamais deux générateurs séparés) : `"vertical"` (axe vertical, directrice
 * horizontale) et `"horizontal"` (axe horizontal, directrice verticale).
 *
 * Exactitude par construction — S et F toujours entiers (jamais approximatifs) : le sommet est
 * tiré directement, puis le foyer est dérivé du sommet par un décalage entier non nul le long de
 * l'axe déterminé par la variante — garantit S≠F (sinon p=0, dégénéré) sans contrainte de
 * génération supplémentaire. `p=2×décalage` tombe automatiquement sur un entier pair, composante
 * SIGNÉE (jamais `|SF|`) : le signe du décalage encode le sens d'ouverture de la parabole.
 */
import type { ExerciceEquationParabole, OrientationParabole } from "../../core/equationParabole.types";
import type { Point } from "../../core/vecteur.types";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const BORNE_SOMMET = 3;
const BORNE_DECALAGE = 4;

/** Décalage entier non nul (jamais 0 — S≠F garanti). */
function tirerDecalage(): number {
  let d = 0;
  while (d === 0) d = randomInt(-BORNE_DECALAGE, BORNE_DECALAGE);
  return d;
}

export function construireExercice(variante: OrientationParabole): ExerciceEquationParabole {
  const sommet: Point = { x: randomInt(-BORNE_SOMMET, BORNE_SOMMET), y: randomInt(-BORNE_SOMMET, BORNE_SOMMET) };
  const decalage = tirerDecalage();
  const foyer: Point = variante === "vertical" ? { x: sommet.x, y: sommet.y + decalage } : { x: sommet.x + decalage, y: sommet.y };
  const p = 2 * decalage;

  return { variante, sommet, foyer, p };
}

export const CATALOGUE_VARIANTES: { id: OrientationParabole; label: string }[] = [
  { id: "vertical", label: "Axe vertical" },
  { id: "horizontal", label: "Axe horizontal" },
];

export function construireAvecVarianteId(varianteId: OrientationParabole): ExerciceEquationParabole {
  return construireExercice(varianteId);
}

export function genererExerciceEquationParabole(): ExerciceEquationParabole {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)]!.id;
  return construireAvecVarianteId(varianteId);
}
