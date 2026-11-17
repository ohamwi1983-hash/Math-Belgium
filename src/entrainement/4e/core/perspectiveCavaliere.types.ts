import type { Point3D } from "./geometrieEspace.types";

/**
 * Contrat de gen104 — « Dessiner en perspective cavalière » (4e, chapitre 8 « Géométrie dans
 * l'espace », section `cavaliere`).
 *
 * Le dessin se fait sur un quadrillage dont le carreau mesure 1 cm. Coordonnées du DESSIN en
 * centimètres (`x` vers la droite, `y` vers le haut) : un point de l'espace (x ; y ; z) — x largeur,
 * y profondeur, z hauteur, comme le reste du chapitre — se dessine en
 * (x + y·√2/4 ; z + y·√2/4) : fuyantes à 45°, réduites de moitié (convention du cours). La face
 * avant (y = 0) tombe donc sur les nœuds du quadrillage ; un sommet arrière, JAMAIS (son décalage
 * vaut p·√2/4, irrationnel pour toute profondeur p entière non nulle).
 */

export type VariantePerspectiveCavaliere = "pave" | "prisme" | "pyramide";

export interface PointDessin {
  x: number;
  y: number;
}

/** Comment se place un sommet que l'élève construit. */
export type ReferenceSommet =
  /** Au bout de la fuyante issue d'un sommet de la face avant (même largeur, même hauteur). */
  | { type: "fuyante"; depuis: string }
  /** Sommet d'une pyramide : à la verticale du centre de la base, à la hauteur réelle. */
  | { type: "hauteur" };

export interface SommetCavaliere {
  nom: string;
  espace: Point3D;
  /** Position exacte sur le dessin (cm). */
  dessin: PointDessin;
  /** Sommet déjà dessiné dans l'énoncé (face avant, ou arête [AB] de la pyramide). */
  donne: boolean;
  reference: ReferenceSommet | null;
}

export interface AreteCavaliere {
  /** Noms triés, ex. « A-D ». */
  cle: string;
  a: string;
  b: string;
  cachee: boolean;
}

export interface CadreDessin {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface ExercicePerspectiveCavaliere {
  variante: VariantePerspectiveCavaliere;
  /** Pavé droit dont les trois dimensions sont égales. */
  cube: boolean;
  /** Dimensions réelles en cm : largeur (gauche-droite), hauteur, profondeur. */
  longueur: number;
  hauteur: number;
  profondeur: number;
  /** Prisme : abscisse du sommet C de la face avant (triangle A(0 ; 0), B(L ; 0), C(c ; h)). */
  abscisseSommet: number | null;
  sommets: SommetCavaliere[];
  aretes: AreteCavaliere[];
  /** Face de gauche vue (prisme, pyramide basse) : alors le sommet D est sur le contour du dessin et
   * une seule arête est cachée. Toujours `false` pour le pavé (D caché, trois arêtes cachées). */
  gaucheVue: boolean;
  /** Écran 1 : le premier sommet arrière à placer (une fuyante). */
  premier: string;
  /** Écran 2 : les sommets suivants (pavé, prisme : les autres sommets arrière ; pyramide : S). */
  suivants: string[];
  /** Pyramide : sommet de la base complété automatiquement après l'écran 1 (même fuyante). */
  completes: string[];
  /** Vecteur de la fuyante exacte sur le dessin : (p·√2/4 ; p·√2/4). */
  fuyante: PointDessin;
  /** Pyramide : centre de la base sur le dessin (rencontre des diagonales). */
  centreBase: PointDessin | null;
  /** Cadre de l'écran : place pour les pièges (fuyante non réduite, mauvais sens). */
  cadreEcran: CadreDessin;
  /** Cadre du papier (énoncé et corrigé) : le solide et un carreau de marge. */
  cadrePapier: CadreDessin;
}
