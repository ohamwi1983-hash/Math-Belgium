import type { Point } from "./vecteur.types";

/**
 * Contrat de `gen53` — « Construction de la parabole au compas et à l'équerre ».
 *
 * Repère LOCAL (jamais montré à l'élève, aucune grille ni coordonnée à l'écran) : directrice
 * d : y = 0, foyer F = (0 ; h), pied de la perpendiculaire K = (0 ; 0), sommet S = (0 ; h/2), axe
 * x = 0. La parabole a pour équation locale y = (x² + h²) / (2h). `theta` n'est qu'un angle de
 * RENDU (Mafs `<Transform rotate>`, figure papier) : la directrice n'est jamais horizontale ni
 * verticale à l'écran, donc aucun alignement avec le bord de l'écran ou de la feuille ne remplace
 * l'équerre.
 *
 * Deux méthodes (variante) :
 * - `cercle` : pour une ouverture r du compas, le cercle de centre F et de rayon r coupe la parallèle
 *   à d située à la distance r (du côté de F) en deux points de la parabole ;
 * - `mediatrice` : pour un point H de d, la perpendiculaire à d en H coupe la médiatrice de [FH] en
 *   un point de la parabole (son symétrique par rapport à l'axe en est un autre).
 */
export type MethodeConstructionParabole = "cercle" | "mediatrice";

export interface ExerciceConstructionParabole {
  methode: MethodeConstructionParabole;
  /** Distance du foyer à la directrice, dans l'unité locale. */
  h: number;
  /** Angle de rendu (radians). */
  theta: number;
  /** Méthode `mediatrice` : abscisses locales des points H₁, H₂, H₃ de d (H₁ = point guidé). Vide
   * pour la méthode `cercle`. */
  abscissesH: number[];
}

export type GenerateurExerciceConstructionParabole = () => ExerciceConstructionParabole;

export type { Point };
