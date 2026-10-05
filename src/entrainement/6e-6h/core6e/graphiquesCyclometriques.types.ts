import type { Arcfonction } from "./cyclometrique.types";
import type { EnsembleReelGuide } from "./ensembleReel.types";

/**
 * Couche core (6e) — contrat pour `6gen5` ("Apparier graphiques et expressions de fonctions
 * cyclométriques"). 6 familles STRUCTURELLEMENT DISJOINTES (union discriminée par `famille`).
 *
 * **REFONTE — un seul écran par tirage, toutes familles confondues** (remplace l'ancienne séquence
 * "calcul (C-F) → sélection (A-F)" à 1 ou 2 écrans) : chaque exercice porte désormais, EN PLUS du
 * QCM graphique (`candidats`/`indexCorrect`, inchangé), un bloc `proprietes` — les 6 propriétés
 * mathématiques RÉELLES de f (ordonnée à l'origine, domaine, image, parité, maximum, minimum),
 * calculées UNE SEULE FOIS à la génération (Couche A, `generateurs6e/graphiquesCyclometriques/
 * proprietes.ts`) à partir des coefficients tirés — JAMAIS câblées en dur par famille (voir le
 * script de vérification numérique associé, `proprietes.test.ts`), jamais recalculées côté moteur
 * (`src/moteur6e/` n'importe jamais `src/generateurs6e/`). `maximum`/`minimum` ne portent que
 * l'EXISTENCE et la VALEUR y de l'extremum (jamais sa position x) : la position choisie par
 * l'élève est vérifiée par COHÉRENCE INTERNE côté `moteur6e/` (ré-évaluation de f en ce point,
 * jamais une comparaison à une position figée) — un extremum peut être atteint en plusieurs points
 * (ex. famille C/F, fonctions paires), toute position valide doit être acceptée.
 *
 * Vérification TOLÉRANTE (jamais la comparaison structurelle exacte 1e-6 de `EnsembleReelGuide`,
 * 6gen1/6gen3) : contrairement à ces domaines toujours rationnels par construction, certains
 * domaines/images de ce générateur sont génériquement IRRATIONNELS (arcsin/arccos d'une valeur
 * quelconque) — `moteur6e/verificationGraphiquesCyclometriques.ts` compare `domf`/`imf` à une
 * tolérance plus généreuse (0.02, cohérente avec l'ancien écran "calcul") plutôt que la tolérance
 * 1e-6 de `verifierEnsembleReelGuide`. Le composant de saisie `EnsembleReelGuideBuilder` (guidage,
 * jamais de LaTeX libre à parser) reste néanmoins réutilisé tel quel.
 *
 * `candidats`/`indexCorrect` portent le QCM graphique : 4 candidats déjà MÉLANGÉS à la génération
 * (`indexCorrect` pointe vers celui qui est mathématiquement correct, jamais toujours en position
 * 0) — chaque candidat est une STRUCTURE DE DONNÉES PURE (jamais une closure) ; une fonction
 * d'évaluation `evaluerX(candidat, x): number | null` (Couche présentation, `ui6e/`) réimplémente
 * la vraie fonction ET les 3 distracteurs comme de VRAIES fonctions renvoyables (jamais une astuce
 * de rendu déconnectée des données) — voir l'en-tête de `ui6e/formatGraphiquesCyclometriques.ts`
 * pour le détail de construction de chaque distracteur.
 */

/** Existence + valeur d'une caractéristique ponctuelle de f (ordonnée à l'origine) — `valeur` est
 * `null` ssi `existe===false`. */
export interface OrdonneeOrigineCyclo {
  existe: boolean;
  valeur: number | null;
}

/** Existence + valeur y d'un extremum de f — JAMAIS de position x ici (voir en-tête de fichier :
 * vérifiée par cohérence interne côté moteur, une position n'est pas toujours unique). `valeur` est
 * `null` ssi `existe===false`. */
export interface ExtremumCyclo {
  existe: boolean;
  valeur: number | null;
}

export type ParticulariteParite = "paire" | "impaire" | "aucune";

/** Les 6 propriétés mathématiques réelles de f, calculées une seule fois à la génération. */
export interface ProprietesFonctionCyclo {
  ordonnee: OrdonneeOrigineCyclo;
  domf: EnsembleReelGuide;
  imf: EnsembleReelGuide;
  parite: ParticulariteParite;
  maximum: ExtremumCyclo;
  minimum: ExtremumCyclo;
}

export interface CandidatA {
  m: number;
  n: number;
  k: number;
  c: number;
  arcfonction: "arcsin" | "arccos";
}

export interface ExerciceGraphiqueA {
  famille: "A";
  reel: CandidatA;
  proprietes: ProprietesFonctionCyclo;
  candidats: CandidatA[];
  indexCorrect: number;
}

export interface CandidatB {
  m: number;
  n: number;
  k: number;
  c: number;
}

export interface ExerciceGraphiqueB {
  famille: "B";
  reel: CandidatB;
  proprietes: ProprietesFonctionCyclo;
  candidats: CandidatB[];
  indexCorrect: number;
}

export interface CandidatC {
  a: number;
  b: number;
  arcfonction: Arcfonction;
  /** `true` UNIQUEMENT pour le distracteur "domaine incorrect" (arcsin/arccos) — trace
   * `arcfonction(a·x+b)` (argument LINÉAIRE, confond `x²≤k` avec `x≤k`) au lieu de `a·x²+b`. */
  argumentLineaire: boolean;
  /** `true` UNIQUEMENT pour le distracteur "domaine incorrect" spécifique à arctan — clippe
   * artificiellement le tracé à `[-1;1]`, comme si arctan avait, à tort, un domaine restreint. */
  domaineTraceForce: boolean;
  /** Décalage vertical constant appliqué au rendu — `0` pour toute candidate sauf le distracteur
   * "mauvaise valeur au sommet" (domaine et forme corrects, sommet décalé). */
  decalageAffichage: number;
}

export interface ExerciceGraphiqueC {
  famille: "C";
  reel: CandidatC;
  proprietes: ProprietesFonctionCyclo;
  /** Bornes RÉELLES du domaine — `null` (les deux) pour arctan (domaine ℝ). */
  domaineInf: number | null;
  domaineSup: number | null;
  candidats: CandidatC[];
  indexCorrect: number;
}

export interface CandidatD {
  k: number;
  p: number;
  c: number;
  /** `true` UNIQUEMENT pour le distracteur "domaine continu" — trace `arctan(k·(x-p))` (produit,
   * jamais de singularité) au lieu de `arctan(k/(x-p))`. */
  continu: boolean;
}

export interface ExerciceGraphiqueD {
  famille: "D";
  reel: CandidatD;
  proprietes: ProprietesFonctionCyclo;
  valeurExclue: number;
  candidats: CandidatD[];
  indexCorrect: number;
}

export interface CandidatE {
  k: number;
  c: number;
  arcfonction: "arcsin" | "arccos";
  /** `true` UNIQUEMENT pour le distracteur "une seule contrainte appliquée" — le radicande
   * négatif est CLAMPÉ à 0 plutôt que d'exclure le point, domaine affiché = `[-1;1]` complet. */
  ignorerContrainteRacine: boolean;
  /** Décalage vertical constant — `0` sauf pour le distracteur "mauvaise valeur à l'extrémité". */
  decalageAffichage: number;
}

export interface ExerciceGraphiqueE {
  famille: "E";
  reel: CandidatE;
  proprietes: ProprietesFonctionCyclo;
  domaineInf: number;
  domaineSup: number;
  candidats: CandidatE[];
  indexCorrect: number;
}

export interface CandidatF {
  m: number;
  n: number;
  c: number;
  arcfonction: "arcsin" | "arccos";
  /** `false` UNIQUEMENT pour le distracteur "toujours monotone" — pas de mise au carré. */
  carre: boolean;
}

export interface ExerciceGraphiqueF {
  famille: "F";
  reel: CandidatF;
  proprietes: ProprietesFonctionCyclo;
  positionExtremum: number;
  candidats: CandidatF[];
  indexCorrect: number;
}

export type ExerciceGraphiquesCyclometriques =
  | ExerciceGraphiqueA
  | ExerciceGraphiqueB
  | ExerciceGraphiqueC
  | ExerciceGraphiqueD
  | ExerciceGraphiqueE
  | ExerciceGraphiqueF;

export type FamilleGraphiquesCyclometriques = ExerciceGraphiquesCyclometriques["famille"];
