/**
 * Couche core — `5gen56` « Encadrer π comme Archimède » (5e ch. 2, § 1). Cercle de rayon r,
 * polygones réguliers inscrit et circonscrit à n côtés : α = 180°/n, |AB| = 2r sin α,
 * |DE| = 2r tan α, n sin α ≤ π ≤ n tan α ; doublement (2n côtés) ; nombre de côtés à partir duquel
 * la largeur n(tan α − sin α) passe sous un seuil s.
 */

export type VarianteArchimede = "hexagone" | "carre" | "autre";

export interface ExerciceArchimedePi {
  variante: VarianteArchimede;
  n: number;
  r: number;
  /** Demi-angle au centre, en degrés. */
  alphaDeg: number;
  coteInscrit: number;
  coteCirconscrit: number;
  minorant: number;
  majorant: number;
  minorant2: number;
  majorant2: number;
  /** Seuil de largeur et nombre de côtés attendu (premier n·2ᵏ dont la largeur est < seuil). */
  seuil: number;
  nSeuil: number;
  cleCollecteur: string;
}

const RAD = Math.PI / 180;
export const minorantDe = (n: number) => n * Math.sin(Math.PI / n);
export const majorantDe = (n: number) => n * Math.tan(Math.PI / n);
export const largeurDe = (n: number) => majorantDe(n) - minorantDe(n);
export const sinDeg = (d: number) => Math.sin(d * RAD);
export const tanDeg = (d: number) => Math.tan(d * RAD);

/** Arrondi par défaut / par excès au millième (encadrement honnête). */
export const parDefaut = (x: number) => Math.floor(x * 1000 + 1e-9) / 1000;
export const parExces = (x: number) => Math.ceil(x * 1000 - 1e-9) / 1000;

/** Nombres de côtés successifs n, 2n, 4n… jusqu'à nSeuil. */
export function doublements(e: ExerciceArchimedePi): number[] {
  const out: number[] = [];
  for (let k = e.n; k <= e.nSeuil; k *= 2) out.push(k);
  return out;
}
