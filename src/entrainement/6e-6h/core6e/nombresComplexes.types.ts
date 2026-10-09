/**
 * Couche core (6e) — contrat pour `6gen34` ("Nombres complexes : opérations de base et puissances
 * de i", chapitre 7 — "Nombres complexes", PREMIER générateur de ce chapitre — zéro infrastructure
 * chapitre 7 avant ce fichier). 7 familles (A à G), tirage ÉQUIPROBABLE de la famille puis, pour la
 * famille B, d'un sous-type au sein de la famille (voir `generateurs6e/nombresComplexes/index.ts`).
 *
 * ============================================================================
 * **CE FICHIER EST SPÉCIFIQUE À 6gen34 — PAS un module chapitre-7 partagé**
 * ============================================================================
 * Contrairement à `moteur6e/expressionComplexe.ts`/`moteur6e/verificationComplexes.ts` (LA
 * fondation vraiment transversale au chapitre 7, voir leurs en-têtes — 6gen35 à 6gen42 en
 * dépendront directement), ce fichier ne modélise QUE les 7 familles A-G de 6gen34 : un futur
 * générateur du chapitre 7 (équations complexes, forme trigonométrique, Moivre...) aura vraisemblablement
 * besoin d'un contrat différent (racines multiples, module/argument...) et créera son propre fichier
 * `core6e/xxx.types.ts`, jamais une extension de celui-ci.
 *
 * ============================================================================
 * **Représentation** : entiers exacts, jamais de closure
 * ============================================================================
 * Contrairement à `calculPrimitives.types.ts` (fonctions réelles continues, need d'une closure
 * évaluable `(x:number)=>number`), un exercice de ce générateur est une suite de VALEURS COMPLEXES
 * STATIQUES (résultat d'une opération arithmétique une fois pour toutes à la génération) — chaque
 * variante stocke donc les paramètres entiers de génération BRUTS (jamais recalculés depuis un
 * flottant, cohérent avec le principe "fraction irréductible, jamais de décimal" — CLAUDE.md) PLUS
 * la ou les valeurs `ValeurComplexe` cibles déjà calculées, une par écran. `ui6e/
 * formatNombresComplexes.ts` reconstruit tout affichage LaTeX (y compris une fraction exacte pour
 * les familles C/D/E, seules à pouvoir produire un résultat non entier) DEPUIS ces paramètres bruts,
 * jamais depuis la valeur `ValeurComplexe` flottante (qui ne sert qu'à la vérification numérique
 * Couche B, tolérance serrée — voir `moteur6e/verificationComplexes.ts`).
 */

/** Un nombre complexe re+im·i, sous forme numérique pure — structurellement identique (mais
 * déclarée séparément, voir en-tête `moteur6e/expressionComplexe.ts`) au type `Complexe` exporté
 * par ce module partagé : TypeScript accepte l'un là où l'autre est attendu (typage structurel),
 * aucun import croisé nécessaire (`core6e/` ne dépend jamais de `moteur6e/`, CLAUDE.md). */
export interface ValeurComplexe {
  re: number;
  im: number;
}

// ============================================================================
// Famille A — Addition et soustraction.
// ============================================================================

export interface ExerciceFamilleA {
  famille: "A";
  a: number;
  b: number;
  c: number;
  d: number;
  operation: "+" | "-";
  resultat: ValeurComplexe;
}

// ============================================================================
// Famille B — Multiplication et puissances (3 sous-types, "cube" en 2 écrans).
// ============================================================================

export type SousTypeB = "produit" | "carre" | "cube";

export interface ExerciceFamilleB_Produit {
  famille: "B";
  sousType: "produit";
  a: number;
  b: number;
  c: number;
  d: number;
  resultat: ValeurComplexe;
}

export interface ExerciceFamilleB_Carre {
  famille: "B";
  sousType: "carre";
  a: number;
  b: number;
  resultat: ValeurComplexe;
}

/** 2 écrans : écran 1 = (a+bi)², écran 2 = écran1(correct)·(a+bi) = (a+bi)³. */
export interface ExerciceFamilleB_Cube {
  famille: "B";
  sousType: "cube";
  a: number;
  b: number;
  carre: ValeurComplexe;
  cube: ValeurComplexe;
}

export type ExerciceFamilleB = ExerciceFamilleB_Produit | ExerciceFamilleB_Carre | ExerciceFamilleB_Cube;

// ============================================================================
// Famille C — Division par conjugué (2 écrans).
// ============================================================================

export interface ExerciceFamilleC {
  famille: "C";
  a: number;
  b: number;
  c: number;
  d: number;
  /** Écran 1 — numérateur développé (a+bi)(c-di) = (ac+bd)+(bc-ad)i, TOUJOURS entier exact
   * (a,b,c,d entiers). */
  numerateurDeveloppe: ValeurComplexe;
  /** Écran 1 — dénominateur développé (c+di)(c-di) = c²+d², TOUJOURS entier exact et strictement
   * positif ((c,d)≠(0,0) garanti par la génération). */
  denominateurDeveloppe: number;
  /** Écran 2 — forme finale a+bi = numerateurDeveloppe/denominateurDeveloppe, PEUT être une
   * fraction non entière (voir en-tête de fichier — `ui6e/formatNombresComplexes.ts` reconstruit
   * la fraction exacte depuis `a,b,c,d`, jamais depuis ce flottant). */
  resultat: ValeurComplexe;
}

// ============================================================================
// Famille D — Division par i (cas particulier, écran unique).
// ============================================================================

/** (a+bi)/(ki), k∈{1,2,3}. */
export interface ExerciceFamilleD {
  famille: "D";
  a: number;
  b: number;
  k: number;
  resultat: ValeurComplexe;
}

// ============================================================================
// Famille E — Combiner 2 fractions à dénominateurs différents (2 écrans).
// ============================================================================

export interface ExerciceFamilleE {
  famille: "E";
  a1: number;
  b1: number;
  c1: number;
  d1: number;
  a2: number;
  b2: number;
  c2: number;
  d2: number;
  /** Écran 1 — chaque fraction séparément mise sous forme a+bi. */
  fraction1: ValeurComplexe;
  fraction2: ValeurComplexe;
  /** Écran 2 — somme des 2 formes CORRECTES de l'écran 1. */
  resultat: ValeurComplexe;
}

// ============================================================================
// Famille F — Simplifier le quotient interne avant de mettre au carré (2 écrans, piège central).
// ============================================================================

/** [(numRe+numIm·i)/(c+di)]² — construite À L'ENVERS depuis `quotientSimplifie` (voir
 * `generateurs6e/nombresComplexes/familleF.ts`) : `numRe+numIm·i` est calculé comme
 * `quotientSimplifie·(c+di)`, garantissant algébriquement que le quotient interne (numérateur/
 * dénominateur, AVANT mise au carré) se simplifie EXACTEMENT en `quotientSimplifie` — jamais
 * l'inverse (tirer numRe/numIm/c/d librement et espérer une simplification propre). */
export interface ExerciceFamilleF {
  famille: "F";
  c: number;
  d: number;
  numRe: number;
  numIm: number;
  /** Écran 1 — quotient interne (numRe+numIm·i)/(c+di), simplifié PAR CONSTRUCTION. */
  quotientSimplifie: ValeurComplexe;
  /** Écran 2 — quotientSimplifie², à partir du résultat CORRECT de l'écran 1. */
  resultat: ValeurComplexe;
}

// ============================================================================
// Famille G — Puissances de i (2 écrans).
// ============================================================================

export interface ExerciceFamilleG {
  famille: "G";
  /** Exposant tel que donné dans l'énoncé (peut être négatif). */
  n: number;
  /** Écran 1 — reste de n modulo 4, TOUJOURS ramené dans {0,1,2,3} (modulo mathématique, jamais le
   * `%` JavaScript qui rendrait un résultat négatif pour n<0) — voir en-tête
   * `generateurs6e/nombresComplexes/familleG.ts` pour la preuve que ce même reste s'applique
   * indifféremment aux exposants positifs ET négatifs (période 4 de i, dans les deux sens). */
  reste: number;
  /** Écran 2 — i^n, valeur du cycle {i^0=1, i^1=i, i^2=-1, i^3=-i} correspondant à `reste`. */
  resultat: ValeurComplexe;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceNombresComplexes = ExerciceFamilleA | ExerciceFamilleB | ExerciceFamilleC | ExerciceFamilleD | ExerciceFamilleE | ExerciceFamilleF | ExerciceFamilleG;

export type FamilleNombresComplexes = ExerciceNombresComplexes["famille"];

export type GenerateurExerciceNombresComplexes = () => ExerciceNombresComplexes;
