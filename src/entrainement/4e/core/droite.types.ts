/**
 * Couche core — types partagés du nouveau groupe de générateurs sur les droites ("Équation d'une
 * droite", "Lecture graphique — équation d'une droite", "Construction graphique — tracer une droite
 * depuis son équation", "Relations entre droites") — même principe que `core/vecteur.types.ts`
 * (chapitre "Calcul vectoriel") ou `core/triangle.types.ts` (chapitre "Cercle trigonométrique") :
 * les 4 générateurs partagent intentionnellement ces représentations, réutilisation assumée et
 * explicitement demandée par leurs prompts de création respectifs, jamais une coïncidence.
 *
 * `Point`/`Composantes` restent ceux de `core/vecteur.types.ts` — jamais redéfinis ici.
 */

/** Les 4 formes de sortie possibles pour l'équation d'une droite. */
export type FormeSortieDroite = "parametrique" | "implicite" | "explicite_y" | "explicite_x";

/** `x = x0 + t·a`, `y = y0 + t·b`. */
export interface DroiteParametrique {
  x0: number;
  y0: number;
  a: number;
  b: number;
}

/** `a·x + b·y + c = 0`. */
export interface DroiteImplicite {
  a: number;
  b: number;
  c: number;
}

/** `y = m·x + p` — impossible si la droite est verticale (vecteur directeur (0,b)). */
export interface DroiteExpliciteY {
  m: number;
  p: number;
}

/** `x = n·y + q` — impossible si la droite est horizontale (vecteur directeur (a,0)). */
export interface DroiteExpliciteX {
  n: number;
  q: number;
}
