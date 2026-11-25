import type { ExerciceMC, VarianteMC } from "../../core6e/miroirsContexte";
import { entier, parmi } from "../../ui6e/outilsConiquesLotH2";

/**
 * Couche A — générateur de `6gen140` « Miroirs en contexte ». `Math.random()` seul (le `?code=` rejoue le
 * tirage). Nombres choisis pour des réponses exactes simples : antenne 16h | D² (distance focale entière),
 * phare 16f | D² (profondeur entière), triplets pythagoriciens (a ; c ; b) pour le lithotriteur et
 * (c ; a ; b) pour le Cassegrain (b entier), points rationnels de la parabole pour `ftfp` (x_P ≠ p/2 : le
 * triangle FPT n'est jamais rectangle, la propriété ne se lit pas sur un cas particulier).
 */

export const CATALOGUE_VARIANTES: { id: VarianteMC; label: string }[] = [
  { id: "antenne", label: "Antenne satellite : diamètre et profondeur" },
  { id: "phare", label: "Phare : lampe au foyer, profondeur du réflecteur" },
  { id: "ftfp", label: "Réflecteur : tangente, point T et rayon réfléchi (FT = FP)" },
  { id: "lithotriteur", label: "Lithotriteur : générateur et calcul rénal" },
  { id: "cassegrain", label: "Télescope Cassegrain : miroir secondaire" },
];

const ZERO = { x: 0, y: 0 };
const base = (variante: VarianteMC): ExerciceMC => ({ variante, D: 0, h: 0, f: 0, a: 0, b: 0, c: 0, p: 0, P: ZERO });

/** Triplets (hypoténuse ; côté ; côté). */
const TRIPLETS: [number, number, number][] = [
  [5, 3, 4],
  [5, 4, 3],
  [13, 5, 12],
  [13, 12, 5],
  [17, 8, 15],
  [17, 15, 8],
  [25, 7, 24],
  [25, 24, 7],
];

export function construire(variante: VarianteMC): ExerciceMC {
  const e = base(variante);
  for (;;) {
    switch (variante) {
      case "antenne": {
        const D = parmi([40, 48, 60, 64, 72, 80, 90, 96, 100, 120]);
        const h = entier(4, 16);
        if ((D * D) % (16 * h) !== 0) continue;
        return { ...e, D, h };
      }
      case "phare": {
        const f = entier(2, 6);
        const D = 2 * entier(5, 14);
        if ((D * D) % (16 * f) !== 0) continue;
        return { ...e, D, f };
      }
      case "lithotriteur": {
        const [a, c, b] = parmi(TRIPLETS);
        const k = a <= 5 ? parmi([2, 3, 4]) : a <= 13 ? parmi([1, 2]) : 1;
        if (k * a > 30) continue;
        return { ...e, a: k * a, c: k * c, b: k * b };
      }
      case "cassegrain": {
        const [c, a, b] = parmi(TRIPLETS);
        if (a < b && Math.random() < 0.5) continue;
        const k = c <= 5 ? parmi([4, 5, 6, 8]) : c <= 13 ? parmi([2, 3]) : parmi([1, 2]);
        return { ...e, a: k * a, b: k * b, c: k * c };
      }
      case "ftfp": {
        const p = parmi([2, 4, 6]);
        const y = parmi([1, -1]) * entier(1, 8);
        const x = (y * y) / (2 * p);
        if (Math.abs(x - p / 2) < 1e-9 || x > 12 || x < 0.4) continue;
        return { ...e, p, P: { x, y } };
      }
    }
  }
}

export function construireAvecVariante(id: string): ExerciceMC {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceMC(): ExerciceMC {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
