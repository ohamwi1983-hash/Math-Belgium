import type { ExerciceKE, VarianteKE } from "../../core6e/orbitesKepler";
import { RAYON_TERRE } from "../../core6e/orbitesKepler";
import { parmi } from "../../ui6e/outilsConiquesLotH2";

/**
 * Couche A — générateur de `6gen141` « Orbites et ellipses : Kepler ». `Math.random()` seul (le `?code=`
 * rejoue le tirage). Triplets pythagoriciens (a ; c ; b) multipliés par une échelle : b entier, e = c/a
 * fraction simple. Planète ou astéroïde (millions de km) : c petit devant a (e ≈ 0,1–0,3) ; comète (UA) :
 * c proche de a (e ≥ 0,9) ; satellite (km) : périgée à au moins 300 km d'altitude.
 */

export const CATALOGUE_VARIANTES: { id: VarianteKE; label: string }[] = [
  { id: "planete", label: "Planète ou astéroïde (périhélie et aphélie)" },
  { id: "comete", label: "Comète très excentrique (UA)" },
  { id: "satellite", label: "Satellite de la Terre (altitudes)" },
];

const PLANETES: [number, number, number][] = [
  [61, 11, 60],
  [41, 9, 40],
  [85, 13, 84],
  [113, 15, 112],
  [145, 17, 144],
  [25, 7, 24],
  [181, 19, 180],
  [65, 16, 63],
];
const COMETES: [number, number, number][] = [
  [13, 12, 5],
  [25, 24, 7],
  [41, 40, 9],
  [61, 60, 11],
  [85, 84, 13],
  [113, 112, 15],
  [145, 144, 17],
];
const SATELLITES: [number, number, number][] = [
  [10000, 2800, 9600],
  [12200, 2200, 12000],
  [10250, 2250, 10000],
  [13000, 5000, 12000],
  [8500, 1300, 8400],
  [11300, 1500, 11200],
  [8700, 1020, 8640],
  [9750, 2400, 9450],
  [11100, 3600, 10500],
];

export function construire(variante: VarianteKE): ExerciceKE {
  if (variante === "satellite") {
    const [a, c, b] = parmi(SATELLITES);
    return { variante, a, c, b, R: RAYON_TERRE };
  }
  if (variante === "comete") {
    const [a, c, b] = parmi(COMETES);
    const k = a <= 13 ? parmi([1, 2, 3]) : a <= 25 ? parmi([1, 2]) : 1;
    return { variante, a: k * a, c: k * c, b: k * b, R: 0 };
  }
  const [a, c, b] = parmi(PLANETES);
  const k = a <= 41 ? parmi([2, 3, 4]) : a <= 85 ? parmi([1, 2]) : 1;
  if (k * a > 300) return construire(variante);
  return { variante, a: k * a, c: k * c, b: k * b, R: 0 };
}

export function construireAvecVariante(id: string): ExerciceKE {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceKE(): ExerciceKE {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
