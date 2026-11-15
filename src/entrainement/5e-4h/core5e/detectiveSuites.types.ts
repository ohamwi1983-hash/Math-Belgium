import type { FractionQ } from "./suitesGeometriques.types";

/**
 * Couche core — « Détective d'erreurs : suites » (5gen49, 5e, chapitre 3 « Suites », section
 * `problemes-classiques`, processus 3 TRANSFÉRER). Même mécanique que 6gen88 / 6gen84 (et
 * gen81/gen91 en 4e) : un élève fictif a résolu un exercice du chapitre en 4 ou 5 lignes
 * numérotées ; UNE SEULE ligne est fausse et la suite de la copie en découle (copie cohérente avec
 * son erreur). L'élève trouve la ligne, nomme l'erreur, puis donne le résultat final corrigé.
 *
 * Notation du cours : rang 1 = u₁, uₙ = u₁ + (n − 1)r, uₙ = u₁·qⁿ⁻¹, de u_p à u_n il y a
 * n − p + 1 termes, S = N·(u_p + u_n)/2, S = u_p·(1 − q^N)/(1 − q), S∞ = u₁/(1 − q) seulement si
 * |q| < 1, q = 1 ± t/100, rang d'une année = année − année de rang 1 + 1, limite de P(n)/Q(n) en
 * divisant numérateur ET dénominateur par la plus haute puissance de n du dénominateur.
 *
 * VARIANTE = exercice support (jamais le type d'erreur) ; dans chaque variante, le type d'erreur
 * (et donc la ligne fausse) est un VERDICT tiré au hasard, équiprobable — jamais fixé par `forme`.
 */

export type VarianteDetectiveSuites = "arithmetique" | "geometrique" | "pourcentage" | "convergence";

/** Les sept erreurs de la fiche. */
export type TypeErreurSuites =
  /** uₙ = u₁ + n·r au lieu de u₁ + (n − 1)r. */
  | "rangFormule"
  /** n − p termes (ou rang = année − année₁) au lieu de n − p + 1. */
  | "nombreTermes"
  /** u₁·qⁿ au lieu de u₁·qⁿ⁻¹. */
  | "exposant"
  /** S∞ calculée alors que |q| ≥ 1 (condition lue « q < 1 »). */
  | "sommeInfinie"
  /** q = t/100 au lieu de 1 ± t/100. */
  | "taux"
  /** P(n)/Q(n) : numérateur et dénominateur divisés par des puissances différentes. */
  | "puissance"
  /** Raison géométrique inversée : u₁/u₂ au lieu de u₂/u₁. */
  | "raisonInversee";

/** Descriptions proposées à l'écran 2 (la bonne + 3 leurres, toujours faux pour la ligne visée). */
export type IdDescriptionSuites =
  | "rangFormule"
  | "nombreTermes"
  | "rangAnnee"
  | "exposant"
  | "sommeInfinie"
  | "taux"
  | "puissance"
  | "raisonInversee"
  // leurres
  | "formuleGeometrique"
  | "raisonRetranchee"
  | "premierTermeOublie"
  | "termesDernierRang"
  | "termesSansExtremites"
  | "termesDiviserRaison"
  | "rangSansExtremites"
  | "rangAnneeBrute"
  | "rangDouble"
  | "exposantProduit"
  | "exposantAddition"
  | "exposantPlusUn"
  | "sommeFormulePlus"
  | "sommeFormuleQMoinsUn"
  | "sommeToujours"
  | "tauxEntier"
  | "tauxArithmetique"
  | "tauxSensInverse"
  | "puissanceN"
  | "puissanceVersUn"
  | "puissanceNumerateurSeul"
  | "raisonDifference"
  | "raisonProduit"
  | "raisonTaux";

/** Contexte d'une évolution en pourcentage (variante `pourcentage`). */
export interface ContextePourcentage {
  /** « une ville », « la chaîne vidéo d'Inès »… (sujet de la première phrase). */
  sujet: string;
  /** Ce que l'on mesure, avec article : « compte {u₁} habitants » → `verbe` + unité. */
  verbe: string;
  /** Unité au pluriel (« habitants », « € », « tonnes »). */
  unite: string;
  /** Grandeur demandée : « la population de la ville », « la valeur de la voiture »… */
  grandeur: string;
  /** Sujet de l'évolution : « Sa population », « Sa valeur »… */
  evolution: string;
  /** Sens possibles. */
  sens: ("hausse" | "baisse")[];
}

export interface ExerciceArithmetique {
  variante: "arithmetique";
  type: "rangFormule" | "nombreTermes";
  u1: number;
  r: number;
  /** Premier et dernier rangs de la somme u_p + … + u_m. */
  p: number;
  m: number;
}

export interface ExerciceGeometrique {
  variante: "geometrique";
  type: "raisonInversee" | "exposant" | "nombreTermes";
  u1: number;
  q: FractionQ;
  p: number;
  m: number;
}

export interface ExercicePourcentage {
  variante: "pourcentage";
  type: "taux" | "nombreTermes" | "exposant";
  /** Indice dans `CONTEXTES_POURCENTAGE`. */
  contexte: number;
  /** `exact` : faisable sans calculatrice (q = 1,5 ; 1,25 ; 1,2 ; 0,75 ; 0,8 ; 0,5) ; `calcul` :
   * pourcentage quelconque, résultat arrondi à l'unité. Tiré INDÉPENDAMMENT du type d'erreur. */
  mode: "exact" | "calcul";
  u1: number;
  /** Pourcentage d'évolution (positif : hausse, négatif : baisse), par exemple 4 ou −25. */
  t: number;
  annee1: number;
  /** Rang de l'année demandée. */
  rang: number;
}

export interface ExerciceSommeInfinie {
  variante: "convergence";
  support: "sommeInfinie";
  type: "raisonInversee" | "sommeInfinie";
  u1: number;
  q: FractionQ;
}

export interface ExerciceLimite {
  variante: "convergence";
  support: "limite";
  type: "puissance";
  /** Coefficients de P et Q, du degré le plus haut au terme constant (coefficient dominant ≠ 0). */
  P: number[];
  Q: number[];
}

export type DonneesDetectiveSuites = ExerciceArithmetique | ExerciceGeometrique | ExercicePourcentage | ExerciceSommeInfinie | ExerciceLimite;

export type ExerciceDetectiveSuites = DonneesDetectiveSuites & {
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (tiré à la génération : le QR code
   * rouvre le même ordre). */
  options: IdDescriptionSuites[];
};

/** Résultat final corrigé (écran 3). */
export type ReponseDetectiveSuites =
  | { genre: "nombre"; valeur: number; latex: string; /** tolérance absolue (exact : 1e-9) */ tolerance: number; exacte: boolean }
  | { genre: "nexistePas" }
  | { genre: "infini"; signe: 1 | -1 };
