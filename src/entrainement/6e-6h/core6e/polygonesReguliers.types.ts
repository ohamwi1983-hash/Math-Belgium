import type { PointEntier } from "./lirePlacerPlanComplexe.types";

export type { PointEntier };

/**
 * Couche core (6e) — types de `6gen97` « Polygones réguliers et racines n-ièmes » (chapitre 5
 * « Nombres complexes », section « Racines n-ièmes d'un nombre complexe », processus 3).
 *
 * Trois variantes (catalogue), une chaîne FIXE de 4 écrans par variante :
 * - `sommets` — polygone régulier de centre C (affixe c) et de sommet Z₀ = A (affixe a), n = 3, 4,
 *   6 ou 8 sommets numérotés dans le sens trigonométrique : relation zₖ = c + (a − c)·e^{2ikπ/n}
 *   (choix fermé), a − c et l'angle 2π/n, puis les affixes EXACTES de Z₁, Z₂ (et Z₃) ;
 * - `mesures` — polygone régulier de centre O inscrit dans le cercle passant par Z₀ (affixe a) :
 *   rayon r = |a|, côté |z₁ − z₀| = 2r·sin(π/n), périmètre, aire (n = 3, 4 ou 6) ;
 * - `somme-nulle` — somme S des n racines n-ièmes de l'unité (somme géométrique, deux choix fermés
 *   pour la justification), puis somme des affixes des sommets d'un polygone régulier = n·c, et
 *   somme des sommets autres que A (n de 3 à 8).
 * Toutes les données sont des points à coordonnées ENTIÈRES ; toutes les réponses sont exactes.
 */

export type IdVariantePolygones = "sommets" | "mesures" | "somme-nulle";

export type NSommets = 3 | 4 | 6 | 8;
export type NMesures = 3 | 4 | 6;

export interface ExerciceSommets {
  variante: "sommets";
  n: NSommets;
  /** Centre C (affixe c). */
  c: PointEntier;
  /** Sommet Z₀ = A (affixe a). */
  a: PointEntier;
}

export interface ExerciceMesures {
  variante: "mesures";
  n: NMesures;
  /** Sommet Z₀ (affixe z₀ = a) ; centre O. */
  a: PointEntier;
}

export interface ExerciceSommeNulle {
  variante: "somme-nulle";
  /** De 3 à 8. */
  n: number;
  c: PointEntier;
  a: PointEntier;
}

export type ExercicePolygones = ExerciceSommets | ExerciceMesures | ExerciceSommeNulle;
