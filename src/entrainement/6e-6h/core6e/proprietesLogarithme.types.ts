/**
 * Couche core (6e) — contrat pour `6gen13` ("Propriétés du logarithme", chapitre 3 — "Fonctions
 * logarithmes"). UNE SEULE famille : 2 écrans FIXES quel que soit le type de question — `type`
 * (produit/quotient/puissance/racine/composé) ne change QUE la formule utilisée, jamais le nombre
 * d'écrans (contrairement à `exponentiellesProblemes.types.ts`, 6gen12, qui dispatche par famille
 * avec 2 à 4 écrans chacune).
 *
 * `m = log_a(M)` et `n = log_a(N)` — décimaux arrondis à 3 décimales, tirés dans [1,000 ; 9,999],
 * LES SEULES valeurs qui comptent pour le calcul (la base `a` n'est jamais résolue, jamais
 * numériquement évaluable — `m`/`n` sont donc traités comme 2 VARIABLES LIBRES INDÉPENDANTES côté
 * vérification, voir `moteur6e/verificationProprietesLogarithme.ts`). `M`/`N` sont des entiers
 * d'AFFICHAGE (2 à 999) — leur valeur réelle est SANS AUCUNE incidence sur la correction, seule
 * leur présence symbolique dans l'expression affichée compte (voir
 * `generateurs6e/proprietesLogarithme/index.ts`).
 */

export type TypeProprieteLog = "produit" | "quotient" | "puissance" | "racine" | "compose";

/** Le type "composé" (2 propriétés) a 2 réalisations concrètes possibles (spec : "log_a(ᵏ√(M/N))
 * ... ou log_a(M^p·N), etc.") — UNE SEULE catégorie côté tirage/dev-selector (`CATALOGUE_VARIANTES`
 * n'a que 5 entrées, jamais 6), le sous-type est tiré à l'intérieur. */
export type SousTypeCompose = "racineQuotient" | "puissanceProduit";

/** Exposant/indice de racine — toujours dans {2,3,4} (spec explicite pour puissance ET racine). */
export type ExposantLog = 2 | 3 | 4;

interface ExerciceProprieteLogBase {
  m: number;
  n: number;
  M: number;
  N: number;
}

export interface ExerciceProprieteLogProduit extends ExerciceProprieteLogBase {
  type: "produit";
}
export interface ExerciceProprieteLogQuotient extends ExerciceProprieteLogBase {
  type: "quotient";
}
export interface ExerciceProprieteLogPuissance extends ExerciceProprieteLogBase {
  type: "puissance";
  p: ExposantLog;
}
export interface ExerciceProprieteLogRacine extends ExerciceProprieteLogBase {
  type: "racine";
  k: ExposantLog;
}
export interface ExerciceProprieteLogComposeRacineQuotient extends ExerciceProprieteLogBase {
  type: "compose";
  sousType: "racineQuotient";
  k: ExposantLog;
}
export interface ExerciceProprieteLogComposePuissanceProduit extends ExerciceProprieteLogBase {
  type: "compose";
  sousType: "puissanceProduit";
  p: ExposantLog;
}

export type ExerciceProprieteLogarithme =
  | ExerciceProprieteLogProduit
  | ExerciceProprieteLogQuotient
  | ExerciceProprieteLogPuissance
  | ExerciceProprieteLogRacine
  | ExerciceProprieteLogComposeRacineQuotient
  | ExerciceProprieteLogComposePuissanceProduit;

export type GenerateurExerciceProprietesLogarithme = () => ExerciceProprieteLogarithme;
