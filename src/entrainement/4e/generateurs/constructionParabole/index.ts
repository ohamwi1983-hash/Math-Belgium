/**
 * Couche A — `gen53`, « Construction de la parabole au compas et à l'équerre ».
 *
 * Tirage : la méthode (variante), l'angle de rendu `theta` (rejeté à moins de 15° d'un multiple de
 * π/2 : directrice franchement oblique) et, pour la méthode de la médiatrice, les trois points H de
 * la directrice. `h` est fixe : sans grille ni coordonnée à l'écran, la distance F–d ne change que
 * l'échelle de la figure.
 *
 * Points H (méthode médiatrice) : trois distances à K distinctes parmi 1 ; 1,5 ; 2,5 et 3,5 unités
 * (h = 2), dont au moins une ≤ 1,5 (un point près du sommet) et au moins une ≥ 2,5, chacune
 * d'un côté de l'axe tiré au hasard. Le symétrique de chaque point construit complète la courbe.
 */
import type { ExerciceConstructionParabole, MethodeConstructionParabole } from "../../core/constructionParabole.types";

export const H_CONSTRUCTION_PARABOLE = 2;

export const CATALOGUE_VARIANTES: { id: MethodeConstructionParabole; label: string }[] = [
  { id: "cercle", label: "Méthode du cercle et de la parallèle" },
  { id: "mediatrice", label: "Méthode de la médiatrice" },
];

const DISTANCES_H = [1, 1.5, 2.5, 3.5];
const ECART_MIN_ANGLE_DROIT = Math.PI / 12;

function melanger<T>(valeurs: T[]): T[] {
  const copie = [...valeurs];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

function tirerTheta(): number {
  for (;;) {
    const theta = Math.random() * 2 * Math.PI;
    const reste = theta % (Math.PI / 2);
    if (reste >= ECART_MIN_ANGLE_DROIT && reste <= Math.PI / 2 - ECART_MIN_ANGLE_DROIT) return theta;
  }
}

function tirerAbscissesH(): number[] {
  for (;;) {
    const distances = melanger(DISTANCES_H).slice(0, 3);
    if (Math.min(...distances) > 1.5 || Math.max(...distances) < 2.5) continue;
    return distances.map((d) => (Math.random() < 0.5 ? -d : d));
  }
}

export function construireAvecVarianteId(id: string): ExerciceConstructionParabole {
  const methode: MethodeConstructionParabole = id === "mediatrice" ? "mediatrice" : "cercle";
  return {
    methode,
    h: H_CONSTRUCTION_PARABOLE,
    theta: tirerTheta(),
    abscissesH: methode === "mediatrice" ? tirerAbscissesH() : [],
  };
}

export function genererExerciceConstructionParabole(): ExerciceConstructionParabole {
  return construireAvecVarianteId(Math.random() < 0.5 ? "cercle" : "mediatrice");
}
