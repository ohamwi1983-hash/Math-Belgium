/**
 * Couche core (6e) — types de `6gen81` « Aires de formes réelles » (chapitre 4, section `aires`,
 * processus 3 TRANSFÉRER). Quatre situations concrètes, chacune modélisée par un arc de parabole
 * (ou deux) :
 * - `mur` : pignon rectangulaire surmonté d'un fronton en arc de parabole → surface à peindre,
 *   litres de peinture, nombre de pots (arrondi à l'unité SUPÉRIEURE), coût ;
 * - `vitrail` : lentille de verre coloré entre deux arcs de parabole (intersections à trouver) →
 *   verre coloré, verre clair, coût (conversion dm² → m²) ;
 * - `section` : section d'un canal, d'un tunnel ou d'une gouttière en arc de parabole → aire de la
 *   section, puis volume = aire × longueur (m³, ou litres pour la gouttière) ;
 * - `parcelle` : terrain entre une route, deux clôtures et une rivière (parabole) → aire en u.a.,
 *   en m² (1 u.a. = 100 m²), valeur du terrain.
 *
 * `modele` : la fonction est DONNÉE (repère superposé au schéma) ou À RETROUVER à partir de trois
 * points lisibles (sommet et deux pieds : y = a(x − x₁)(x − x₂), ou sommet et un point : forme
 * canonique). `calcul` : `exacte` (cotes entières, résultats faisables à la main) ou
 * `calculatrice` (cotes décimales, intersections irrationnelles).
 */

export type CalculFormesReelles = "exacte" | "calculatrice";
export type ModeleFormesReelles = "donnee" | "retrouver";
/** Repère du schéma (fonction donnée) ou du corrigé (fonction à retrouver) : origine au pied gauche
 * de l'arc, ou au milieu de sa base. */
export type RepereArc = "pied" | "milieu";

export interface ExerciceMurFormesReelles {
  situation: "mur";
  modele: ModeleFormesReelles;
  calcul: CalculFormesReelles;
  /** Largeur du mur (m) = base de l'arc. */
  L: number;
  /** Hauteur de la partie rectangulaire (m). */
  h: number;
  /** Flèche de l'arc : hauteur du sommet au-dessus du rectangle (m). */
  k: number;
  repere: RepereArc;
  /** Rendement de la peinture (m² par litre) ; deux couches. */
  rendement: number;
  /** Contenance d'un pot (L). */
  contenance: number;
  /** Prix d'un pot (€). */
  prixPot: number;
}

export interface ExerciceVitrailFormesReelles {
  situation: "vitrail";
  modele: "donnee";
  calcul: CalculFormesReelles;
  /** Panneau rectangulaire W × H (dm). */
  W: number;
  H: number;
  /** Axe de symétrie de la lentille x = m ; intersections en m ± √s. */
  m: number;
  s: number;
  /** f − g = −A((x − m)² − s), A > 0. */
  A: number;
  /** g(x) = c(x − m)² + d (arc inférieur ; c = 0 : bord horizontal). */
  c: number;
  d: number;
  /** Prix du verre coloré et du verre clair (€/m²). */
  prixColore: number;
  prixClair: number;
}

export type ContexteSection = "canal" | "tunnel" | "gouttiere";

export interface ExerciceSectionFormesReelles {
  situation: "section";
  contexte: ContexteSection;
  modele: ModeleFormesReelles;
  calcul: CalculFormesReelles;
  /** Largeur de la section (m ; cm pour la gouttière). */
  W: number;
  /** Profondeur (canal, gouttière) ou hauteur (tunnel) au milieu (m ; cm pour la gouttière). */
  D: number;
  /** Longueur de l'ouvrage (m, gouttière comprise). */
  longueur: number;
  repere: RepereArc;
}

export interface ExerciceParcelleFormesReelles {
  situation: "parcelle";
  modele: ModeleFormesReelles;
  calcul: CalculFormesReelles;
  /** Berge : f(x) = alpha(x − m)² + k (alpha < 0), en unités du repère (1 unité = 10 m). */
  alpha: number;
  m: number;
  k: number;
  /** Clôtures en x = a et x = b (unités du repère). */
  a: number;
  b: number;
  /** Prix du terrain (€/m²). */
  prix: number;
}

export type ExerciceAiresFormesReelles = ExerciceMurFormesReelles | ExerciceVitrailFormesReelles | ExerciceSectionFormesReelles | ExerciceParcelleFormesReelles;
