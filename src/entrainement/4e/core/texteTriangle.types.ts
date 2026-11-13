/**
 * Couche core — gen77 « Du texte au triangle : problèmes en contexte » (4e, chapitre 5, section
 * « triangulation », processus 3 TRANSFÉRER). Pendant à UN SEUL triangle de gen58 (« Triangles
 * liés », deux triangles) : un énoncé réaliste (navigation avec des caps, angles d'élévation ou de
 * dépression, distance inaccessible, parcelle, position radar), un seul triangle quelconque à
 * résoudre. La vraie difficulté : traduire la donnée du texte (cap, élévation, dépression,
 * relèvement) en angle INTÉRIEUR du triangle.
 *
 * Deux structures :
 * - `ExerciceTexteTriangleStandard` — cinq écrans : identifier les éléments du triangle
 *   (appariement), convertir les angles du texte en angles intérieurs, choisir la loi, calculer,
 *   répondre avec l'unité et l'arrondi demandés (phrase-réponse) ;
 * - `ExerciceDeuxPositions` — « deux positions possibles » (cas ambigu en contexte, famille validée
 *   par l'utilisateur) : un radar connaît la distance du mobile, un autre poste un angle non compris.
 *   L'existence de deux positions FAIT PARTIE de la situation (toujours deux) ; l'élève calcule les
 *   deux angles candidats, les deux distances, puis tranche grâce à une information supplémentaire de
 *   l'énoncé. Calcul local à ce générateur (gen74, moteur pur du cas ambigu, n'est pas sur la branche).
 *
 * Angles en DEGRÉS (convention du chapitre). Valeurs exactes gardées (aucun arrondi intermédiaire).
 */

export type VarianteTexteTriangle = "trajets" | "deuxBateaux" | "elevation" | "depression" | "distanceInaccessible" | "parcelle" | "deuxPositions";

/** Loi qui résout le triangle (écran 3). */
export type LoiTexteTriangle = "sinus" | "cosinus" | "aire";

/**
 * Conversion d'une donnée du texte en angle intérieur :
 * - `virage` : angle au point de virage = 180° − écart des deux caps ;
 * - `ecartCaps` : angle au point de départ commun = écart des deux caps ;
 * - `supplementaire` : angle d'élévation pris au point le plus proche → angle intérieur 180° − β ;
 * - `differenceVisees` : angle au sommet visé = β − α (somme des angles du triangle) ;
 * - `alternes` : angle de dépression = angle intérieur au point visé (angles alternes-internes) ;
 * - `somme` : troisième angle = 180° − les deux autres ;
 * - `releveEst` / `releveOuest` : relèvement (cap) depuis une extrémité d'une base orientée est-ouest
 *   → angle avec la base (90° − θ depuis l'extrémité ouest, θ − 270° depuis l'extrémité est).
 */
export type TypeConversion = "virage" | "ecartCaps" | "supplementaire" | "differenceVisees" | "alternes" | "somme" | "releveEst" | "releveOuest";

/** Point nommé de la figure (coordonnées réelles, axe des y vers le haut, nord = +y). */
export interface PointFigure {
  nom: string;
  x: number;
  y: number;
}

/** Rôle d'un élément du triangle à l'écran 1. */
export type RoleElement = "donne" | "convertir" | "cherche";

export interface ElementTriangle {
  /** LaTeX court : « PV », « \widehat{PVA} ». */
  latex: string;
  role: RoleElement;
}

/** Une donnée du triangle (côté ou angle) nommée. */
export interface Grandeur {
  latex: string;
  valeur: number;
}

export interface ConversionAngle {
  /** Angle intérieur visé, en LaTeX (« \widehat{PVA} »). */
  latex: string;
  valeur: number;
  type: TypeConversion;
  /** Calcul en LaTeX, SANS le résultat (« 180^\circ - (125^\circ - 40^\circ) ») : aide 2 et corrigé. */
  calculLatex: string;
  /** Explication en texte brut (corrigé, aide 1), terminée par « : ». */
  justification: string;
  /** Calcul numérique intermédiaire du corrigé, quand `calculLatex` reste symbolique
   * (« 180^\circ - 50^\circ - 60^\circ » après « 180^\circ - \widehat{CAB} - \widehat{CBA} »). */
  detailLatex?: string;
}

/** Calcul final de l'écran 4 (triangle standard). */
export type CalculTriangle =
  | { loi: "cosinus"; cote1: Grandeur; cote2: Grandeur; angle: Grandeur }
  | { loi: "sinus"; coteConnu: Grandeur; angleOpposeConnu: Grandeur; angleOpposeCherche: Grandeur }
  | { loi: "aire"; cote1: Grandeur; cote2: Grandeur; angle: Grandeur };

/** Précision demandée par l'énoncé : nombre de décimales (0 = à l'unité près, −1 = à la dizaine). */
export interface Precision {
  decimales: -1 | 0 | 1 | 2;
  /** « au dixième de kilomètre près », « au mètre près »… */
  texte: string;
}

/** Une formulation de la réponse (écran 5) ; une seule `correcte`. */
export interface OptionReponse {
  texte: string;
  correcte: boolean;
}

interface Commun {
  /** Énoncé narratif (texte brut, virgule décimale, unités). */
  contexte: string;
  /** Question finale, précision d'arrondi comprise. */
  question: string;
  /** Nom du triangle (« PVA »). */
  triangle: string;
  points: PointFigure[];
  /** Vrai : nord indiqué sur la figure (caps, relèvements). */
  avecNord: boolean;
  unite: string;
  precision: Precision;
  /** Options de l'écran 5, ordre fixé à la génération. */
  options: OptionReponse[];
}

export interface ExerciceTexteTriangleStandard extends Commun {
  variante: Exclude<VarianteTexteTriangle, "deuxPositions">;
  /** Écran 1 : éléments du triangle et leur rôle. */
  elements: ElementTriangle[];
  conversions: ConversionAngle[];
  calcul: CalculTriangle;
  /** Inconnue (LaTeX « PA », ou « \mathcal{A} » pour une aire) et sa valeur exacte. */
  inconnue: Grandeur;
  /** Sous-type de la situation (forme d'équilibre) : « nord », « releve »… ou « direct ». */
  sousType: string;
  /** Résultat obtenu avec l'erreur de conversion typique (distracteur de l'écran 5, ligne « Piège »). */
  piege: { valeur: number; description: string };
  /** Données brutes du texte, pour la figure (caps, élévations…) : nom → valeur en degrés. */
  angles: Record<string, number>;
  /** Longueurs données (affichées sur la figure) : [extrémité 1, extrémité 2, valeur]. */
  longueurs: [string, string, number][];
  /** Côté cherché sur la figure ([extrémité 1, extrémité 2]) ; `null` pour une aire. */
  segmentCherche: [string, string] | null;
}

/** Information supplémentaire qui tranche entre les deux positions. */
export type TypeInfoPositions = "distanceMax" | "distanceMin" | "angleMin" | "angleMax";

export interface ExerciceDeuxPositions extends Commun {
  variante: "deuxPositions";
  /** Noms : poste qui mesure la distance (R), poste qui mesure l'angle (P), mobile (B). */
  noms: { R: string; P: string; B: string };
  /** Libellés en texte brut (« le radar », « le phare », « le bateau »). */
  libelles: { R: string; P: string; B: string };
  /** Distance RP (côté opposé à B), distance RB (côté opposé à P), angle en P (non compris). */
  RP: number;
  RB: number;
  angleP: number;
  /** Angles candidats en B : [aigu, obtus = 180° − aigu]. */
  candidats: [number, number];
  /** Angles en R correspondants. */
  anglesR: [number, number];
  /** Distances PB correspondantes (la première, avec l'angle aigu, est la plus grande). */
  distances: [number, number];
  info: { type: TypeInfoPositions; seuil: number; texte: string };
  /** Indice (0 ou 1) de la position retenue. */
  retenue: 0 | 1;
  /** Options de l'écran 1 (configuration des données). */
  optionsConfiguration: OptionReponse[];
}

export type ExerciceTexteTriangle = ExerciceTexteTriangleStandard | ExerciceDeuxPositions;
