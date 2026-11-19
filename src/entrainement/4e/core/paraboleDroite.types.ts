import type { Poly2, Symbole } from "../moteur/algebreTransfertSecondDegre";

/**
 * gen118 — « Parabole et droite : intersection et position » (4e, chapitre 2, § 2, processus 2
 * APPLIQUER). f(x) = ax² + bx + c, g(x) = mx + p (droite oblique, ou horizontale y = k).
 * h = f − g est le trinôme qui décide de tout : ses racines sont les abscisses des points communs,
 * son signe la position. Le nombre de points communs (2, 1 ou 0) est un VERDICT, tiré au hasard
 * avant les nombres (jamais dans le profil).
 */

export type VarianteParaboleDroite = "oblique" | "horizontale";

export interface ExerciceParaboleDroite {
  variante: VarianteParaboleDroite;
  f: Poly2;
  /** g(x) = g[0]·x + g[1]. */
  g: [number, number];
  /** h = f − g. */
  h: Poly2;
  /** Abscisses des points communs, triées (0, 1 ou 2). */
  communs: number[];
  /** Inéquation demandée : f(x) ◇ g(x). */
  symbole: Symbole;
}
