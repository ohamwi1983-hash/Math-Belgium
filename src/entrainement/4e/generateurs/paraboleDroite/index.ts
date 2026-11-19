import type { CatalogueVarianteEntree } from "../../../export/genererFeuilleExercices";
import type { ExerciceParaboleDroite, VarianteParaboleDroite } from "../../core/paraboleDroite.types";
import { choisir, entierAlea, tirerPondere, type Poly2, type Symbole } from "../../moteur/algebreTransfertSecondDegre";

/**
 * Générateur de gen118. Le nombre de points communs est tiré AVANT les nombres (2 : 70 %, 1 —
 * droite tangente : 15 %, 0 : 15 %), puis h = f − g est construit à racines entières (ou sans
 * racine : A[(x − x₀)² + q]), la droite est tirée et f = g + h. Coordonnées entières.
 */

export const CATALOGUE_VARIANTES: CatalogueVarianteEntree[] = [
  { id: "oblique", label: "Droite oblique y = mx + p" },
  { id: "horizontale", label: "Droite horizontale y = k" },
];

export function evaluerG(g: [number, number], x: number): number {
  return g[0] * x + g[1];
}

export function construireAvecVariante(id: string): ExerciceParaboleDroite {
  const variante = id as VarianteParaboleDroite;
  const nombre = tirerPondere<0 | 1 | 2>([
    [2, 70],
    [1, 15],
    [0, 15],
  ]);
  const symbole = choisir<Symbole>(["<", ">", "≤", "≥"]);
  for (;;) {
    const A = choisir([1, 1, -1, -1, 2, -2]);
    let h: Poly2;
    let communs: number[];
    if (nombre === 2) {
      const x1 = entierAlea(-5, 4);
      const x2 = entierAlea(x1 + 1, Math.min(6, x1 + 7));
      h = [A, -A * (x1 + x2), A * x1 * x2];
      communs = [x1, x2];
    } else if (nombre === 1) {
      const r = entierAlea(-4, 4);
      h = [A, -2 * A * r, A * r * r];
      communs = [r];
    } else {
      const x0 = entierAlea(-3, 3);
      const q = entierAlea(1, 4);
      h = [A, -2 * A * x0, A * (x0 * x0 + q)];
      communs = [];
    }
    const g: [number, number] = variante === "oblique" ? [choisir([-3, -2, -1, 1, 2, 3]), entierAlea(-5, 5)] : [0, entierAlea(-6, 6)];
    const f: Poly2 = [h[0], h[1] + g[0], h[2] + g[1]];
    if (f[1] === 0 && f[2] === 0) continue;
    if (Math.abs(f[1]) > 12 || Math.abs(f[2]) > 20 || Math.abs(h[2]) > 30) continue;
    if (communs.some((x) => Math.abs(evaluerG(g, x)) > 15)) continue;
    return { variante, f, g, h, communs, symbole };
  }
}

export function genererExerciceParaboleDroite(): ExerciceParaboleDroite {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
