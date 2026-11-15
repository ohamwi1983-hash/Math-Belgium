/**
 * Couche core — « Détective d'erreurs : statistique » (gen112, 4e, chapitre 4 « Statistique
 * descriptive », section `revision`, processus 3 TRANSFÉRER). Même mécanique que gen91 et 5gen49 :
 * un élève fictif a résolu un exercice du chapitre en 4 à 6 lignes numérotées ; UNE SEULE ligne est
 * fausse et la suite de la copie en découle (copie cohérente avec son erreur). L'élève trouve la
 * ligne, nomme l'erreur, puis donne le résultat final corrigé.
 *
 * Notation du chapitre : xᵢ, nᵢ, n = Σnᵢ, x̄ = Σ(xᵢ·nᵢ)/n, effectifs cumulés, règle du seuil
 * (médiane : première valeur dont le rang — ou l'effectif cumulé — dépasse STRICTEMENT n/2 ; Q1 :
 * n/4 ; Q3 : 3n/4), V = Σ(xᵢ − x̄)²·nᵢ / n arrondie à 2 décimales, σ = √V arrondi au centième,
 * moyenne de deux groupes réunis = (n_A·x̄_A + n_B·x̄_B)/(n_A + n_B).
 *
 * VARIANTE = exercice support (jamais le type d'erreur) ; dans chaque variante, le type d'erreur
 * (et donc la ligne fausse) est un VERDICT tiré au hasard, équiprobable — jamais fixé par `forme`.
 */

export type VarianteDetectiveStatistique = "moyenne" | "position" | "dispersion" | "cumules" | "groupes";

/** Les sept erreurs de la fiche. */
export type TypeErreurStatistique =
  /** Médiane (et quartiles) lues sur la série NON rangée. */
  | "medianeNonTriee"
  /** Moyenne des valeurs distinctes, sans les effectifs : Σxᵢ / k. */
  | "moyenneNonPonderee"
  /** Mauvaise ligne d'effectif cumulé (celle de la valeur elle-même au lieu de celle d'avant). */
  | "cumulMalLu"
  /** Écart-type = variance (racine oubliée). */
  | "sansRacine"
  /** Q1 pris sur la valeur dont le rang (ou le cumulé) ATTEINT n/4 sans le dépasser. */
  | "q1MalPlace"
  /** Moyenne des deux moyennes au lieu de la moyenne pondérée par les effectifs. */
  | "moyenneDesMoyennes"
  /** Somme des carrés des écarts non divisée par l'effectif total n. */
  | "varianceSansN";

/** Descriptions proposées à l'écran 2 (la bonne + 3 leurres, toujours faux pour la ligne visée). */
export type IdDescriptionStatistique =
  | TypeErreurStatistique
  // leurres
  | "moyenneMilieu"
  | "moyenneExtremes"
  | "moyenneCumules"
  | "cumulDirect"
  | "cumulAdditionner"
  | "cumulDiviserK"
  | "medianeMoyenne"
  | "medianeDoublons"
  | "medianeRangSeuil"
  | "q1MoitieSuperieure"
  | "q1SeuilMoitie"
  | "q1MoitieMediane"
  | "nMoinsUn"
  | "ecartMoitie"
  | "ecartCarre"
  | "sansCarre"
  | "diviserK"
  | "sommeMoyennes"
  | "ponderationInversee"
  | "plusGrandeMoyenne";

/** Tableau xᵢ | nᵢ : valeurs distinctes croissantes, effectifs strictement positifs. */
export interface TableauStat {
  valeurs: number[];
  effectifs: number[];
}

interface Base {
  /** Indice dans `CONTEXTES` (moteur). */
  contexte: number;
}

export interface ExerciceMoyenne extends Base {
  variante: "moyenne";
  type: "moyenneNonPonderee" | "cumulMalLu";
  tableau: TableauStat;
}

export interface ExercicePosition extends Base {
  variante: "position";
  type: "medianeNonTriee" | "q1MalPlace";
  /** Série brute, dans l'ordre du relevé (n = 12 ou 16). */
  serie: number[];
}

export interface ExerciceDispersion extends Base {
  variante: "dispersion";
  type: "moyenneNonPonderee" | "varianceSansN" | "sansRacine";
  tableau: TableauStat;
}

export interface ExerciceCumules extends Base {
  variante: "cumules";
  type: "q1MalPlace" | "cumulMalLu";
  tableau: TableauStat;
}

export interface ExerciceGroupes extends Base {
  variante: "groupes";
  type: "moyenneNonPonderee" | "moyenneDesMoyennes";
  /** Groupe A, détaillé par son tableau. */
  tableau: TableauStat;
  /** Groupe B, résumé par son effectif et sa moyenne. */
  nB: number;
  moyenneB: number;
}

export type DonneesDetectiveStatistique = ExerciceMoyenne | ExercicePosition | ExerciceDispersion | ExerciceCumules | ExerciceGroupes;

export type ExerciceDetectiveStatistique = DonneesDetectiveStatistique & {
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (tiré à la génération : le QR code
   * rouvre le même ordre). */
  options: IdDescriptionStatistique[];
};

/** Résultat final (écran 3) : une valeur, exacte ou arrondie au centième (écart-type). */
export interface ReponseDetectiveStatistique {
  valeur: number;
  /** Tolérance absolue (exact : 1e-9 ; écart-type arrondi au centième : 0,01). */
  tolerance: number;
}
