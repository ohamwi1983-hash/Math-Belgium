/**
 * `5gen61` — « Composer des polynômes » (5e ch. 1, § 3, processus 2 APPLIQUER). f et g affines ou
 * l'une du second degré (coefficients entiers) : écrire f(g(x)), développer et réduire (f∘g)(x) puis
 * (g∘f)(x), vérifier en un point étage par étage, et — pour deux affines — décider si f∘g = g∘f
 * (verdict tiré 50/50). Une parabole et une affine (non identité) ne commutent jamais
 * (a·m² = m·a impose m = 1, puis p = 0) : pas d'écran « verdict » pour elles.
 */

export type VarianteComposerPolynomes = "affines" | "secondDegre";

export interface ExerciceComposerPolynomes {
  variante: VarianteComposerPolynomes;
  /** Coefficients par degré (indice = degré), entiers. */
  f: number[];
  g: number[];
  fog: number[];
  gof: number[];
  /** Point de vérification et valeurs g(a), f(g(a)). */
  a: number;
  ga: number;
  fga: number;
  /** f∘g = g∘f (deux affines seulement ; toujours faux sinon). */
  commutent: boolean;
  /** Fonction du second degré (variante « secondDegre ») : f ou g. */
  quadratique: "f" | "g" | null;
  cleCollecteur: string;
}
