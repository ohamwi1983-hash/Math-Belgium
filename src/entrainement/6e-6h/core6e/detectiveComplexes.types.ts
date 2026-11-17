import type { FragmentConsigne } from "../../export/genererFeuilleExercices";

/**
 * Couche core — « Détective d'erreurs : nombres complexes » (6gen99, 6e, chapitre 5 « Nombres
 * complexes », section `problemesavances`, processus 3 TRANSFÉRER). Même mécanique que 6gen88 /
 * 6gen84 / 5gen49 : un élève fictif a résolu un exercice du chapitre en 4 ou 5 lignes numérotées ;
 * UNE SEULE ligne est fausse et la suite de la copie en découle (copie cohérente avec son erreur).
 * L'élève trouve la ligne, nomme l'erreur, puis donne le résultat corrigé.
 *
 * Notation du cours : i (i² = −1), z = a + bi, z̄, |z| = √(a² + b²), arg z = arctan(b/a) corrigé de
 * ±π si a < 0, z = r(cos θ + i sin θ) = re^{iθ}, Moivre |zⁿ| = |z|ⁿ et arg zⁿ = n·arg z (à 2π
 * près), racines n-ièmes z_k = ⁿ√r · e^{i(θ + 2kπ)/n}, arguments en radians.
 *
 * VARIANTE = exercice support (jamais le type d'erreur). Dans chaque variante, le TYPE D'ERREUR
 * (donc la ligne fausse) est un VERDICT tiré au hasard, équiprobable, avant les nombres — jamais
 * fixé par `forme`, jamais lié à `calcul` (toutes les instances sont exactes).
 */

export type VarianteDetectiveComplexes = "formeTrigo" | "quotient" | "puissance" | "moivre" | "racines" | "moduleSomme" | "racineProduit";

/** Les dix-huit erreurs (trois par support, une pour « racineProduit » ; « quadrant » sert deux supports). */
export type TypeErreurComplexes =
  /** |z| = a² + b² (racine carrée oubliée). */
  | "racineOubliee"
  /** Angle de référence arctan(a/b) au lieu de arctan(b/a). */
  | "rapportInverse"
  /** arg = arctan(b/a) sans correction de quadrant alors que a < 0. */
  | "quadrant"
  /** Quotient : numérateur multiplié par c + di au lieu du conjugué c − di. */
  | "sansConjugue"
  /** (c + di)(c − di) = c² − d² (i² oublié). */
  | "denominateur"
  /** Développement du numérateur : i² = 1. */
  | "numerateurI2"
  /** (a + bi)² = a² + (bi)², double produit oublié. */
  | "doubleProduit"
  /** (bi)² = +b² (i² = 1). */
  | "carreI2"
  /** (P + Qi)(a + bi) = Pa + Qb·i² (produits croisés oubliés). */
  | "termeATerme"
  /** Moivre appliqué à l'argument mais pas au module (rⁿ oublié). */
  | "moduleOublie"
  /** nθ réduit en retirant π au lieu de 2π. */
  | "reductionPi"
  /** cos Θ et sin Θ échangés dans la forme algébrique. */
  | "cosSin"
  /** Module des racines : |w|/n au lieu de ⁿ√|w|. */
  | "moduleDivise"
  /** Racines n-ièmes : pas de 2π au lieu de 2π/n. */
  | "pas2pi"
  /** |z| = √(a² + (bi)²) = √(a² − b²). */
  | "carreBi"
  /** √(c² + d²) = |c| + |d|. */
  | "sommeRacines"
  /** |z + w| = |z| + |w|. */
  | "inegaliteTriangulaire"
  /** √(ab) = √a·√b appliquée à deux nombres négatifs (« démonstration » de n = −n). */
  | "racineNegatifs";

/** Descriptions de l'écran 2 : la bonne (id = type d'erreur) + 3 leurres propres à la même ligne. */
export type IdDescriptionComplexes = TypeErreurComplexes | `${TypeErreurComplexes}_leurre${1 | 2 | 3}`;

export interface ExerciceFormeTrigo {
  variante: "formeTrigo";
  type: "racineOubliee" | "rapportInverse" | "quadrant";
  /** Direction (0 à 3) : 2π/3, 5π/6, −2π/3, −5π/6 (toujours a < 0, |a| ≠ |b|). */
  dir: number;
  /** z = k·(direction de module 2) : |z| = 2k. */
  k: number;
}

export interface ExerciceQuotient {
  variante: "quotient";
  type: "sansConjugue" | "denominateur" | "numerateurI2";
  /** Dénominateur c + di (c, d non nuls, |c| ≠ |d|). */
  c: number;
  d: number;
  /** Quotient attendu x + yi (entier de Gauss, x et y non nuls). */
  x: number;
  y: number;
}

export interface ExercicePuissance {
  variante: "puissance";
  type: "doubleProduit" | "carreI2" | "termeATerme";
  /** z = a + bi (a, b non nuls, |a| ≠ |b|) ; on calcule z³ en passant par z². */
  a: number;
  b: number;
}

export interface ExerciceMoivre {
  variante: "moivre";
  type: "moduleOublie" | "reductionPi" | "cosSin";
  /** Direction (0 à 7) : √3 ± i, 1 ± i√3, −1 ± i√3, −√3 ± i (module 2). */
  dir: number;
  /** Exposant : |n·arg z| > π (une réduction d'un tour, 2π, est toujours nécessaire). */
  n: number;
  /** z = k·direction : |z| = 2k (|zⁿ| ≤ 1 296). */
  k: 1 | 2 | 3;
}

export interface ExerciceRacines {
  variante: "racines";
  type: "quadrant" | "moduleDivise" | "pas2pi";
  /** Direction de w (0 à 5) : ±2π/3, ±3π/4, ±5π/6 (toujours a < 0). */
  dir: number;
  /** Indice des racines (3 ou 4) et module R = |w| (puissance n-ième parfaite). */
  n: 3 | 4;
  R: number;
}

export interface ExerciceModuleSomme {
  variante: "moduleSomme";
  type: "carreBi" | "sommeRacines" | "inegaliteTriangulaire";
  /** z = a + bi (|a| > |b|) et w = c + di, parties non nulles, z + w sans partie nulle. */
  a: number;
  b: number;
  c: number;
  d: number;
}

/**
 * « Démonstration » de n = −n (demande de l'utilisateur : la copie « 1 = −1 »). Six lignes « n = … » ;
 * la ligne fausse est TOUJOURS celle qui passe de √((−n)·(−n)) à √(−n)·√(−n) (règle √(ab) = √a·√b
 * appliquée à deux négatifs), mais sa POSITION (2, 3 ou 4) est tirée au hasard, équiprobable : c'est
 * le verdict de l'étape a), jamais fixé par `forme`. n = 1 et position 3 : la copie de l'utilisateur
 * (1 = √1 ; √((−1)(−1)) ; √(−1)·√(−1) ; i·i ; i² ; −1).
 */
export interface ExerciceRacineProduit {
  variante: "racineProduit";
  type: "racineNegatifs";
  /** n de 1 à 20 (√(−n) écrit avec i : 2i, i√5, 2i√3…). */
  n: number;
  /** Numéro (1 à 6) de la ligne fausse. */
  position: 2 | 3 | 4;
}

export type DonneesDetectiveComplexes = ExerciceFormeTrigo | ExerciceQuotient | ExercicePuissance | ExerciceMoivre | ExerciceRacines | ExerciceModuleSomme | ExerciceRacineProduit;

export type ExerciceDetectiveComplexes = DonneesDetectiveComplexes & {
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (tiré à la génération : le QR code
   * rouvre le même ordre). */
  options: IdDescriptionComplexes[];
};

/** Un champ de l'écran 3 (valeur attendue OU valeur de la copie, selon l'appel). */
export type ChampDetectiveComplexes =
  | {
      genre: "reel";
      /** LaTeX avant le champ (`|z| =`, `\arg z =`, `\theta_0 =`). */
      prefixe: string;
      valeur: number;
      latex: string;
      /** Angle en radians : comparé à 2kπ près. */
      angle: boolean;
      /** Champs comparés comme un ENSEMBLE (arguments des racines n-ièmes, ordre libre). */
      ensemble: boolean;
      /** Valeur non décimale (√, π, fraction non décimale) : une valeur décimale approchée est
       * refusée sans tentative. */
      exacteNonDecimale: boolean;
    }
  | {
      genre: "complexe";
      prefixe: string;
      re: number;
      im: number;
      latex: string;
    };

export type { FragmentConsigne };
