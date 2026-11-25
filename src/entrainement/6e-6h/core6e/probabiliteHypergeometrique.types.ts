/**
 * Couche A (6e) — types de `6gen47` « Probabilité hypergéométrique » (6e ch. 7, § 5). Refonte de
 * l'audit (lots B et C) : probabilités vérifiées EXACTEMENT (plus de tolérance de 0,01), contextes en
 * prose avec leurs nombres, famille B jamais dégénérée (a ∈ {1, 2} : avant, une seule couleur une fois
 * sur deux) avec des couleurs nommées, famille C où « aucun numéro bonus » n'est plus majoritaire.
 */

export type IdContexteHypergeoA = "cartes" | "examen" | "piecesDefectueuses" | "boulesColorees" | "loto";

export interface ContexteHypergeoA {
  id: IdContexteHypergeoA;
  /** Situation (texte), avec N, K et n. */
  phrase: string;
  /** Événement « k succès », écrit pour l'instance (« exactement 2 cœurs », « aucune pièce défectueuse »…). */
  evenement: string;
  labelPopulation: string;
  labelSucces: string;
  labelTirage: string;
}

export type SousTypeHypergeoA = "aucun" | "tous" | "exactement";

export interface ExerciceHypergeoA {
  famille: "A";
  sousType: SousTypeHypergeoA;
  contexte: ContexteHypergeoA;
  N: number;
  K: number;
  n: number;
  k: number;
  numerateurFacteur1: number; // C(K,k)
  numerateurFacteur2: number; // C(N-K,n-k)
  denominateur: number; // C(N,n)
  probabilite: number;
}

export type CouleurHypergeoB = "c1" | "c2";

export interface ExerciceHypergeoB {
  famille: "B";
  /** n1 boules rouges (c1), n2 bleues (c2) ; 3 tirages sans remise. */
  n1: number;
  n2: number;
  N: number;
  sequence: CouleurHypergeoB[];
  a: number;
  b: number;
  numerateurSequence: number;
  denominateurSequence: number;
  probabiliteSequence: number;
  numerateurComposition: number;
  denominateurComposition: number;
  probabiliteComposition: number;
  nombreArrangements: number;
}

export interface CategorieHypergeoC {
  N: number;
  K: number;
  n: number;
  k: number;
  numerateur: number;
  denominateur: number;
  probabilite: number;
}

export interface ExerciceHypergeoC {
  famille: "C";
  principal: CategorieHypergeoC;
  bonus: CategorieHypergeoC;
  numerateurCombine: number;
  denominateurCombine: number;
  probabiliteCombinee: number;
}

export type ExerciceProbabiliteHypergeometrique = ExerciceHypergeoA | ExerciceHypergeoB | ExerciceHypergeoC;

export type FamilleProbabiliteHypergeometrique = ExerciceProbabiliteHypergeometrique["famille"];
