import type { ExerciceCP, PartieCP, VarianteCP } from "../../core6e/courbeParametree";
import { entier, melanger, nonNul, parmi } from "../../ui6e/outilsLieuxLotH2";

/**
 * Couche A — générateur de `6gen129` « Courbe paramétrée : élimination et restriction ».
 * `Math.random()` seul (le `?code=` rejoue le tirage). La PARTIE décrite (courbe entière, moitié, arc —
 * le verdict de l'écran 3) est tirée EN PREMIER, à parts égales, puis l'intervalle de t, puis les
 * nombres (entiers petits : figure lisible à 390 px), puis l'ordre des conditions de l'écran 4.
 */

export const CATALOGUE_VARIANTES: { id: VarianteCP; label: string }[] = [
  { id: "cercle", label: "Cercle (a + r cos t ; b + r sin t)" },
  { id: "astroide", label: "Astroïde (A cos³ t ; A sin³ t)" },
  { id: "parabole", label: "Parabole (t ; t², t² ; t⁴, cos t ; cos 2t)" },
  { id: "droite", label: "Droite (t, t², cos² t ; sin² t)" },
];

export function construire(variante: VarianteCP): ExerciceCP {
  const partie = parmi(["entiere", "moitie", "arc"] as const) as PartieCP;
  const indice = entier(0, 3);
  const base: ExerciceCP = { variante, partie, a: 0, b: 0, r: 1, indice, p: 0, q: 0, k: 1, u: 1, v: 1, s: 1, ordre: [] };
  let e: ExerciceCP;
  switch (variante) {
    case "cercle":
      e = { ...base, a: entier(-3, 3), b: entier(-3, 3), r: entier(1, 4) };
      break;
    case "astroide":
      e = { ...base, r: parmi([1, 8]) };
      break;
    case "parabole":
      e = { ...base, p: entier(-3, 3), q: entier(-3, 2), k: parmi([1, 2, -1, -2]), s: parmi([1, -1] as const) };
      break;
    case "droite":
      e = { ...base, p: entier(-3, 3), q: entier(-3, 3), u: nonNul(-3, 3), v: nonNul(-3, 3) };
      break;
  }
  return { ...e, ordre: melanger([0, 1, 2, 3]) };
}

export function construireAvecVariante(id: string): ExerciceCP {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceCP(): ExerciceCP {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
