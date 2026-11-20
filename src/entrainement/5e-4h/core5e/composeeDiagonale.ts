/**
 * `5gen63` — « Composée sur un seul repère (droite y = x) » (5e ch. 1, § 4, processus 2 APPLIQUER).
 * Cf, Cg et la droite y = x dans le même repère (même échelle en x et en y, quadrillage d'une unité,
 * graphes COMPLETS, extrémités pleines ou creuses). On lit la première image, on la reporte sur
 * l'axe horizontal par la diagonale, on décide si la composée existe (verdict 50/50), puis on lit sa
 * valeur.
 */

export type VarianteComposeeDiagonale = "fog" | "gof" | "ff";

/** Fonction affine par morceaux : valeurs ENTIÈRES aux abscisses entières de [debut ; debut + n]. */
export interface CourbeEntiere {
  debut: number;
  valeurs: number[];
  /** Extrémité gauche / droite exclue (rond vide). */
  ouverteG: boolean;
  ouverteD: boolean;
}

export interface ExerciceComposeeDiagonale {
  variante: VarianteComposeeDiagonale;
  f: CourbeEntiere;
  g: CourbeEntiere;
  a: number;
  /** Première image v = I(a) (I = fonction intérieure). */
  v: number;
  existe: boolean;
  /** Valeur finale O(v) (null si elle n'existe pas). */
  w: number | null;
  cleCollecteur: string;
}

export const FENETRE = { min: -6, max: 6 };

export function finCourbe(c: CourbeEntiere): number {
  return c.debut + c.valeurs.length - 1;
}

/** x appartient-il au domaine de la courbe (graphe complet) ? */
export function dansDomaine(c: CourbeEntiere, x: number): boolean {
  const fin = finCourbe(c);
  if (x < c.debut || x > fin) return false;
  if (x === c.debut && c.ouverteG) return false;
  if (x === fin && c.ouverteD) return false;
  return true;
}

/** Valeur en un x du domaine (interpolation entre deux abscisses entières). */
export function valeurCourbe(c: CourbeEntiere, x: number): number | null {
  if (!dansDomaine(c, x)) return null;
  const i = Math.floor(x - c.debut);
  if (i === c.valeurs.length - 1) return c.valeurs[i];
  const t = x - c.debut - i;
  return c.valeurs[i] + t * (c.valeurs[i + 1] - c.valeurs[i]);
}
