/**
 * Types de gen110 — « Moyenne ou médiane ? La valeur aberrante » (4e, chapitre 4 « Statistique
 * descriptive », section `position`, processus 3 TRANSFÉRER).
 *
 * Une série brute (non rangée) en contexte : salaires d'une petite entreprise gérante comprise,
 * temps de trajet, prix de maisons d'un village, points d'une joueuse de basket, notes d'un élève,
 * délais de livraison. Selon le VERDICT (tiré au hasard AVANT la construction), la série contient
 * une valeur extrême (la médiane est plus représentative) ou non (contre-exemple : les deux
 * indicateurs se valent). Le récit est le même dans les deux cas : il ne trahit jamais le verdict.
 */

/** Contexte = variante du catalogue = `forme` du profil (type de série). */
export type ContexteAberrant = "salaires" | "trajet" | "immobilier" | "basket" | "notes" | "livraison";

/** Ce que l'élève doit DÉCIDER à l'écran c (jamais fixé par `forme`, jamais un cas particulier). */
export type Verdict = "mediane" | "les-deux";

/** Choix proposés à l'écran c : l'indicateur le plus représentatif. */
export type ChoixIndicateur = "moyenne" | "mediane" | "les-deux";

/** Justifications proposées (le même jeu de quatre, mélangé, quel que soit le verdict). */
export type Justification = "extreme" | "aucune" | "moyenne-toujours" | "mediane-toujours";

export interface ExerciceValeurAberrante {
  contexte: ContexteAberrant;
  verdict: Verdict;
  /** Valeurs dans l'ordre de l'énoncé (NON rangées). */
  valeurs: number[];
  /** Prénom du récit (trajet, basket, notes). */
  prenom: string;
  /** Ordre (mélangé) des quatre justifications à l'écran c. */
  ordreJustifications: Justification[];
}
