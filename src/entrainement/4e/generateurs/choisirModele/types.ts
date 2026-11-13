import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";

/**
 * gen69 — « Choisir le bon modèle » (4e, chapitre 3, section `transformer`, processus 3 TRANSFÉRER).
 *
 * Une situation en contexte, une courbe issue d'une fonction de référence transformée, écrite
 * TOUJOURS sous la forme y = a·g(variable − TH) + TV : a porte à la fois le facteur vertical
 * (|a|) et la symétrie d'axe horizontal (a < 0). Les 5 écrans : famille, transformations,
 * expression, utilisation du modèle, sens d'un paramètre.
 */

export type FamilleModele = "carre" | "cube" | "racine_carree" | "racine_cubique" | "inverse" | "valeur_absolue";

export type ContexteModele = "pont" | "jet" | "glacon" | "gaz" | "velo" | "chauffage" | "toboggan";

/** Paramètre interrogé à l'écran 5 : TH (nombre soustrait à la variable), TV (nombre ajouté), a
 * (coefficient multiplicatif). */
export type ParametreModele = "th" | "tv" | "a";

export type PositionEtiquette = "haut" | "bas" | "gauche" | "droite" | "haut-gauche" | "haut-droite" | "bas-gauche" | "bas-droite";

export interface PointMarqueModele {
  x: number;
  y: number;
  position: PositionEtiquette;
}

export type QuestionUtilisation =
  /** Prédire : calculer la valeur du modèle pour une valeur de la variable. */
  | { type: "predire"; x: number; y: number }
  /** Résoudre : trouver la (ou les) valeur(s) de la variable qui donnent `y` (triées). */
  | { type: "resoudre"; y: number; solutions: number[] };

export interface OptionSens {
  id: string;
  correcte: boolean;
  fragments: FragmentConsigne[];
}

export interface ExerciceChoisirModele {
  contexte: ContexteModele;
  famille: FamilleModele;
  /** y = a·g(variable − th) + tv. */
  th: number;
  tv: number;
  a: number;
  /** Fenêtre du graphique : les deux axes partent de 0. */
  fenetre: { xMax: number; yMax: number; pasX: number; pasY: number };
  /** Domaine de la situation : tracé de la courbe et vérification par échantillonnage. */
  domaine: [number, number];
  /** Points clés marqués (coordonnées affichées), dont le point caractéristique s'il est sur la
   * courbe (pas pour « inverse » : son point caractéristique est le centre des asymptotes). */
  points: PointMarqueModele[];
  /** Indice, dans `points`, du point qui sert à lire le facteur (comparé au point caractéristique). */
  indexLecture: number;
  /** Asymptote horizontale tracée en pointillés (inverse avec TV ≠ 0). */
  asymptoteH: number | null;
  question4: QuestionUtilisation;
  parametre5: ParametreModele;
  /** 4 options mélangées, une seule correcte. */
  options5: OptionSens[];
}
