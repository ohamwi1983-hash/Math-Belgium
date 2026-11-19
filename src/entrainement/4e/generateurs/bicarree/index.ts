import type { CatalogueVarianteEntree } from "../../../export/genererFeuilleExercices";
import type { ExerciceBicarree, VarianteBicarree } from "../../core/bicarree.types";
import { choisir, entierAlea, tirerPondere, type Poly2 } from "../../moteur/algebreTransfertSecondDegre";

/**
 * Générateur de gen116. Le nombre de valeurs de t gardées est tiré AVANT les nombres (2 : 50 %,
 * 1 : 40 %, 0 : 10 %) ; une valeur gardée donne x² = t − k > 0, carré parfait (70 %) ou non
 * (racines √n) ; une valeur rejetée donne x² < 0. t₁ + t₂ ≠ 0 et t₁t₂ ≠ 0 : (E) a ses trois termes.
 */

export const CATALOGUE_VARIANTES: CatalogueVarianteEntree[] = [
  { id: "bicarree", label: "Bicarrée ax⁴ + bx² + c = 0" },
  { id: "changement", label: "Changement de variable u = x² + k" },
];

const CARRES = [1, 4, 9, 16, 25];
const NON_CARRES = [2, 3, 5, 6, 7];

export function construireAvecVariante(id: string): ExerciceBicarree {
  const variante = id as VarianteBicarree;
  const gardees = tirerPondere<0 | 1 | 2>([
    [2, 50],
    [1, 40],
    [0, 10],
  ]);
  for (;;) {
    const a = choisir([1, 1, 1, 2, -1]);
    const k = variante === "bicarree" ? 0 : choisir([-3, -2, -1, 1, 2, 3]);
    const garde = () => (Math.random() < 0.7 ? choisir(CARRES) : choisir(NON_CARRES));
    const vs = [gardees >= 1 ? garde() : -entierAlea(1, 6), gardees >= 2 ? garde() : -entierAlea(1, 6)];
    const [t1, t2] = vs.map((v) => v + k).sort((x, y) => x - y) as [number, number];
    if (t1 === t2 || t1 + t2 === 0 || t1 * t2 === 0) continue;
    const b = -a * (t1 + t2);
    const c = a * t1 * t2;
    if (Math.abs(b) > 30 || Math.abs(c) > 60) continue;
    return { variante, a, k, t1, t2 };
  }
}

export function genererExerciceBicarree(): ExerciceBicarree {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}

/** Équation en t : a t² + b t + c = 0. */
export function trinomeT(e: ExerciceBicarree): Poly2 {
  return [e.a, -e.a * (e.t1 + e.t2), e.a * e.t1 * e.t2];
}

/** Valeurs de t gardées (x² = t − k > 0). */
export function tGardees(e: ExerciceBicarree): number[] {
  return [e.t1, e.t2].filter((t) => t - e.k > 0);
}

/** Solutions en x, triées. */
export function solutionsX(e: ExerciceBicarree): number[] {
  return tGardees(e)
    .flatMap((t) => [-Math.sqrt(t - e.k), Math.sqrt(t - e.k)])
    .sort((x, y) => x - y);
}
