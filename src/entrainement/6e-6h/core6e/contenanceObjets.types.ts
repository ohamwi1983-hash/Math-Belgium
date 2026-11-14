/**
 * Couche core (6e) — contrat de `6gen83` « Contenance d'objets de révolution » (chapitre 4,
 * « Intégrales et primitives », section `volumes`, processus 3 TRANSFÉRER : la méthode des disques
 * de 6gen27 appliquée à un objet du quotidien).
 *
 * **Convention de repère (identique au cours et à 6gen27)** : l'axe de l'objet est l'axe des
 * abscisses ; x est la position le long de cet axe (en cm) et f(x) le RAYON INTÉRIEUR (en cm) à la
 * position x. La contenance est le volume engendré par la rotation de la courbe de f autour de
 * l'axe des abscisses : V = π∫ₐᵇ [f(x)]² dx (cm³). Origine de x : le fond intérieur (verre, vase,
 * pot) ou le milieu de l'objet (tonneau, flacon : profil symétrique, bornes −H et H).
 *
 * Tous les profils ont un carré [f(x)]² POLYNOMIAL à coefficients rationnels (racine, binôme
 * parabolique, demi-ellipse, droite) : le carré, la primitive et le volume sont donc EXACTS
 * (multiple rationnel de π) — `Frac` porte ces coefficients sans erreur d'arrondi.
 */

export interface Frac {
  num: number;
  den: number;
}

export type ObjetContenance = "verre" | "vase" | "tonneau" | "flacon" | "pot";

/** Question de transfert (dernier écran) : hauteur du liquide pour une quantité donnée, nombre de
 * récipients, ou comparaison avec un second modèle d'objet. */
export type TransfertContenance = "hauteur" | "nombre" | "comparer";

/** Profil intérieur — les paramètres suffisent à tout reconstruire (`moteur6e`, `ui6e`). */
export type ProfilContenance =
  /** f(x) = √(a·x), x ∈ [0 ; h] — coupe de verre (paraboloïde). */
  | { type: "racine"; a: number }
  /** f(x) = r + x²/n, x ∈ [0 ; h] — vase évasé (profil parabolique). */
  | { type: "parabole"; r: number; n: number }
  /** f(x) = R − x²/n, x ∈ [−H ; H] — tonneau bombé (profil parabolique). */
  | { type: "bombe"; R: number; n: number }
  /** f(x) = (b/a)·√(a² − x²), x ∈ [−a ; a] — flacon ellipsoïdal (demi-ellipse). */
  | { type: "ellipse"; a: number; b: number }
  /** f(x) = r + (R − r)·x/h, x ∈ [0 ; h] — pot de fleurs (tronc de cône). */
  | { type: "droite"; r: number; R: number; h: number };

/** Second objet de la comparaison : cône (verre conique) ou cylindre, cotes en DIAMÈTRE. */
export interface SecondObjet {
  forme: "cone" | "cylindre";
  /** Diamètre (cm) — l'élève doit en prendre la moitié. */
  diametre: number;
  /** Profondeur / hauteur intérieure (cm). */
  hauteur: number;
}

export interface ExerciceContenanceObjets {
  objet: ObjetContenance;
  transfert: TransfertContenance;
  profil: ProfilContenance;
  /** Bornes de l'intégrale (cm). */
  a: number;
  b: number;
  /** Cote « parasite » qui ne fait pas partie de la cavité (pied du verre, épaisseur du fond,
   * bouchon du flacon) — 0 pour le tonneau. */
  horsCavite: number;
  /** Hauteur totale de l'objet (cm), cotée sur le schéma. */
  hauteurTotale: number;
  /** [f(x)]² : coefficients (indice = degré). */
  carre: Frac[];
  /** V/π, exact. */
  volumeSurPi: Frac;
  /** Ordre d'affichage des 4 options du modèle (indices dans la liste canonique, 0 = correcte). */
  ordreModele: number[];
  // --- Transfert « hauteur » ---
  /** Fraction de la contenance (verre, valeur exacte) ou `null` si la quantité est donnée (`quantite`). */
  fraction: Frac | null;
  /** Quantité versée dans l'unité du contexte (cL pour le verre, L pour le pot) ; 0 si sans objet. */
  quantite: number;
  /** Hauteur atteinte (cm), mesurée depuis la borne inférieure. */
  hauteurLiquide: number;
  // --- Transfert « nombre » ---
  /** Quantité disponible (verre/tonneau/flacon/pot : on remplit ; vase : contenance d'un verre versé). */
  source: { libelle: string; cm3: number } | null;
  /** `floor` : récipients remplis complètement ; `ceil` : récipients nécessaires (vase). */
  arrondi: "floor" | "ceil";
  nombre: number;
  // --- Transfert « comparer » ---
  second: SecondObjet | null;
  /** V₂/π, exact. */
  secondSurPi: Frac | null;
  /** Vrai si l'objet du profil f contient le plus. */
  premierPlusGrand: boolean;
}
