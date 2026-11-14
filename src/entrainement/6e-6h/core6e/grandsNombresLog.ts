/**
 * Couche A (6e) — types et calculs purs de `6gen92` « Grands nombres et logarithme décimal »
 * (chapitre 3 de 6e, section « propriétés », processus 3 TRANSFÉRER). Le logarithme décimal
 * (`log` = `log₁₀`) pour manipuler des nombres trop grands pour la calculatrice :
 * - `chiffres` : nombre de chiffres de aⁿ = partie entière de n·log(a), plus 1 ;
 * - `comparer` : comparer aⁿ et bᵐ par n·log(a) et m·log(b) (sous-cas `logs`, à la calculatrice) ou
 *   en les écrivant avec un même exposant (sous-cas `exact`, sans calculatrice : 2³⁰⁰ = 8¹⁰⁰,
 *   3²⁰⁰ = 9¹⁰⁰) ;
 * - `premier-chiffre` : aⁿ = 10^f × 10^E (E partie entière, f partie décimale de n·log(a)) ;
 * - `temps` : un ordinateur fait 10^p opérations par seconde, un algorithme 2ⁿ opérations — durée
 *   pour un n donné (`duree`) ou plus grand n traitable en une durée donnée (`taille`).
 *
 * Ces fonctions sont la SOURCE UNIQUE des valeurs : générateur, vérification, textes et corrigé
 * papier les appellent toutes.
 */

export type IdVarianteGrandsNombres = "chiffres" | "comparer" | "premier-chiffre" | "temps";

export interface ExerciceChiffres {
  variante: "chiffres";
  a: number;
  n: number;
  /** Contexte « nombre premier de Mersenne 2ⁿ − 1 » (a = 2) : année de la découverte ; `null` pour
   * une puissance quelconque. */
  mersenne: { annee: number } | null;
}

export interface ExerciceComparer {
  variante: "comparer";
  /** `logs` : n·log(a) et m·log(b) à la calculatrice ; `exact` : même exposant k, sans calculatrice. */
  sousCas: "logs" | "exact";
  /** Premier nombre aⁿ, second nombre bᵐ (ordre d'affichage, verdict tiré AVANT la construction). */
  a: number;
  n: number;
  b: number;
  m: number;
  /** Sous-cas exact : exposant commun k (aⁿ = A^k, bᵐ = B^k) ; `null` sinon. */
  k: number | null;
  /** Ordre d'affichage des deux verdicts (indices canoniques : 0 = « aⁿ > bᵐ », 1 = « aⁿ < bᵐ »). */
  ordreVerdict: number[];
}

export interface ExercicePremierChiffre {
  variante: "premier-chiffre";
  a: number;
  n: number;
}

/** Durées proposées pour la question « plus grand n traitable ». */
export type IdDuree = "minute" | "heure" | "jour" | "semaine" | "mois" | "an" | "decennie" | "siecle" | "millenaire";

export const DUREES: Record<IdDuree, { libelle: string; secondes: number; calculLatex: string }> = {
  minute: { libelle: "une minute", secondes: 60, calculLatex: "60" },
  heure: { libelle: "une heure", secondes: 3600, calculLatex: "60\\times 60=3600" },
  jour: { libelle: "un jour", secondes: 86400, calculLatex: "24\\times 3600=86\\,400" },
  semaine: { libelle: "une semaine", secondes: 604800, calculLatex: "7\\times 86\\,400=604\\,800" },
  mois: { libelle: "un mois (30 jours)", secondes: 2592000, calculLatex: "30\\times 86\\,400=2\\,592\\,000" },
  an: { libelle: "un an (365 jours)", secondes: 31536000, calculLatex: "365\\times 86\\,400=31\\,536\\,000" },
  decennie: { libelle: "dix ans (de 365 jours)", secondes: 315360000, calculLatex: "10\\times 31\\,536\\,000=315\\,360\\,000" },
  siecle: { libelle: "un siècle (100 ans de 365 jours)", secondes: 3153600000, calculLatex: "100\\times 31\\,536\\,000=3\\,153\\,600\\,000" },
  millenaire: { libelle: "mille ans (de 365 jours)", secondes: 31536000000, calculLatex: "1000\\times 31\\,536\\,000=31\\,536\\,000\\,000" },
};

/** Secondes dans une année de 365 jours (précision annoncée dans les consignes). */
export const SECONDES_PAR_AN = 31536000;

export interface ExerciceTempsDuree {
  variante: "temps";
  sousCas: "duree";
  /** L'ordinateur fait 10^p opérations par seconde. */
  p: 9 | 12;
  /** Taille du problème : l'algorithme fait 2ⁿ opérations. */
  n: number;
}

export interface ExerciceTempsTaille {
  variante: "temps";
  sousCas: "taille";
  p: 9 | 12;
  duree: IdDuree;
}

export type ExerciceTemps = ExerciceTempsDuree | ExerciceTempsTaille;

export type ExerciceGrandsNombres = ExerciceChiffres | ExerciceComparer | ExercicePremierChiffre | ExerciceTemps;

// ============================================================================
// Calculs.
// ============================================================================

/** log(aⁿ) = n·log(a). */
export function logPuissance(a: number, n: number): number {
  return n * Math.log10(a);
}

/** Partie entière d'un réel positif. */
export function partieEntiere(x: number): number {
  return Math.floor(x + 1e-12);
}

/** Écriture scientifique d'un nombre de logarithme décimal L : N = m × 10^E, 1 ≤ m < 10. */
export function ecritureScientifique(L: number): { m: number; E: number; f: number } {
  const E = partieEntiere(L);
  const f = L - E;
  return { m: Math.pow(10, f), E, f };
}

/** Nombre de chiffres de l'écriture décimale d'un entier N ≥ 1 de logarithme L. */
export function nombreChiffres(L: number): number {
  return partieEntiere(L) + 1;
}

/** Comparer : logarithmes décimaux des deux nombres. */
export function logsComparer(e: ExerciceComparer): [number, number] {
  return [logPuissance(e.a, e.n), logPuissance(e.b, e.m)];
}

/** Vrai si le premier nombre (aⁿ) est le plus grand. */
export function premierEstPlusGrand(e: ExerciceComparer): boolean {
  const [l1, l2] = logsComparer(e);
  return l1 > l2;
}

/** Sous-cas exact : bases A et B telles que aⁿ = A^k et bᵐ = B^k. */
export function basesCommunes(e: ExerciceComparer): [number, number] {
  const k = e.k ?? 1;
  return [Math.round(Math.pow(e.a, e.n / k)), Math.round(Math.pow(e.b, e.m / k))];
}

/** Temps (durée) : log du nombre d'opérations, de la durée en secondes, de la durée en années. */
export function logsDuree(e: ExerciceTempsDuree): { operations: number; secondes: number; annees: number } {
  const operations = logPuissance(2, e.n);
  const secondes = operations - e.p;
  return { operations, secondes, annees: secondes - Math.log10(SECONDES_PAR_AN) };
}

/** Temps (taille) : nombre d'opérations disponibles N = 10^p × durée, borne log(N)/log(2), plus grand n. */
export function donneesTaille(e: ExerciceTempsTaille): { logN: number; borne: number; nMax: number } {
  const logN = e.p + Math.log10(DUREES[e.duree].secondes);
  const borne = logN / Math.log10(2);
  return { logN, borne, nMax: partieEntiere(borne) };
}

/** Âge de l'Univers en années (ordre de grandeur cité dans le corrigé). */
export const AGE_UNIVERS_ANNEES = 1.38e10;
