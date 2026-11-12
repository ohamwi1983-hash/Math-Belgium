import type { ContexteFamilleC as ContexteBayesNumerique, ExerciceFamilleC as ExerciceBayesNumerique } from "./independanceBayes.types";
import type { ExerciceFamilleCSpecial as ExerciceDeMelange } from "./tiragesArbres.types";

/**
 * Couche core (6e) — contrat pour `6gen33` ("Probabilités : problèmes", chapitre 6 de 6e, générateur
 * de clôture du chapitre — après `6gen30`/`6gen31`/`6gen32`). Tirage équiprobable d'1 famille parmi
 * 6 (A, B, C, E, F, G), puis d'un contexte au sein de la famille (voir
 * `generateurs6e/probabilitesProblemes/index.ts`).
 *
 * Audit 6e ch. 6 (décision F, recentrage partiel) : la probabilité géométrique (ancienne famille D),
 * le Bayes paramétrique (E-paramétrique), le cadre financier et les dérangements (doublon de 6gen31)
 * ont été RETIRÉS — hors du cours du chapitre. Les lettres des familles restantes sont conservées.
 *
 * Réutilisations (Couche core ↔ Couche core) :
 * - Famille E (Bayes en problème, données mélangées) : `ExerciceFamilleC` de
 *   `core6e/independanceBayes.types.ts` (6gen32) comme `base`.
 * - Famille G (mélange d'objets) : `ExerciceFamilleCSpecial` de `core6e/tiragesArbres.types.ts`
 *   (6gen31, dé truqué à une face spéciale, 6 faces) comme `base`.
 * Toute probabilité saisie est vérifiée par `diagnostiquerProbabilite` (`moteur6e/
 * verificationProbabilites.ts`, décision A) : forme exacte, ou arrondi correct au centième (au
 * millième sous 0,1) ; 4 décimales au minimum pour une fiabilité et pour les facteurs (365−k)/365.
 */

// ============================================================================
// Famille A — Paradoxe des anniversaires.
// ============================================================================

/** n personnes, n∈{4,...,8} — 365 jours (années bissextiles ignorées, spec). */
export interface ExerciceFamilleA {
  famille: "A";
  n: number;
}

// ============================================================================
// Famille B — Épreuves répétées (nombre de chemins compté dans l'arbre, décision G).
// ============================================================================

export interface ContexteFamilleB {
  id: string;
  texte: string;
  /** Verbe/état du succès, singulier, déjà accordé (ex. "réussit son tir") — jamais reconstruit
   * mécaniquement (même piège que `ContextePannes`/`ContexteFamilleC` de 6gen32, voir leur en-tête). */
  labelSucces: string;
}

/** Écran 3 — 2 variantes : « au moins k succès » (somme sur les nombres de succès), ou complément
 * de « tous identiques » (ni tout succès, ni tout échec). */
export type DemandeEcran3FamilleB = "auMoinsK" | "unDeChaqueResultat";

export interface ExerciceFamilleB {
  famille: "B";
  contexte: ContexteFamilleB;
  /** n∈{3,4,5} — épreuves identiques indépendantes (spec). */
  n: number;
  /** Probabilité de succès à CHAQUE épreuve, 0<p<1. */
  p: number;
  /** k∈{1,...,n-1} — nombre de succès demandé aux écrans 1/2 (et pour la variante "auMoinsK" de
   * l'écran 3, jamais 0 ni n : déjà des cas triviaux). */
  k: number;
  demandeEcran3: DemandeEcran3FamilleB;
}

// ============================================================================
// Famille C — Indépendants à probabilités différentes.
// ============================================================================

export interface ContexteFamilleC {
  id: string;
  texte: string;
  /** 3 libellés courts NUMÉROTÉS 1 à 3 (ex. "Machine 1", "Feu 2") — la saisie de l'écran 1 se fait
   * par numéros. Réutilisés en KaTeX (`P(\\text{...})`), toujours entourés de `\\text{}`. */
  labelElements: [string, string, string];
  /** Nom des éléments au pluriel (« machines », « feux »). */
  nomPluriel: string;
  /** Événement étudié, verbe accordé au singulier et au pluriel (« tombe en panne » / « tombent en
   * panne », « est au vert » / « sont au vert ») — jamais le mot « succès » pour une panne. */
  evenementSingulier: string;
  evenementPluriel: string;
}

export interface ExerciceFamilleC {
  famille: "C";
  contexte: ContexteFamilleC;
  /** p1,p2,p3 — probabilités DISTINCTES de l'événement étudié pour chaque élément. */
  p: [number, number, number];
  /** Nombre d'éléments concernés par l'événement, k∈{1,2}. */
  k: number;
}

// ============================================================================
// Famille E — Bayes en problème (données présentées mélangées).
// ============================================================================

export interface ExerciceFamilleEMixte {
  famille: "E";
  sousType: "mixte";
  /** Réutilise TEL QUEL le contrat `6gen32` (`p`=P(c1), `q1`=P(E|c1), `q2`=P(E|c2)) — voir en-tête
   * de fichier. */
  base: ExerciceBayesNumerique;
  /** Permutation de [0,1,2] — ordre dans lequel les 3 données (P(c1), P(E|c1), P(E|c2)) sont
   * PRÉSENTÉES à l'écran 1 (mélangées), l'élève devant les réaffecter au bon symbole avant de
   * construire l'arbre (spec : "le premier écran doit identifier correctement le sens de chaque
   * donnée"). */
  ordreAffichage: [number, number, number];
}

export type ExerciceFamilleE = ExerciceFamilleEMixte;

// ============================================================================
// Famille F — Fiabilité de circuits.
// ============================================================================

export type ConfigurationFamilleF = "serie" | "parallele" | "mixte";

/** Écran 3 — 2 variantes, toutes deux sur une configuration ALTERNATIVE (mêmes composants) : en
 * calculer la fiabilité, ou juger une affirmation chiffrée à son sujet (vrai/faux, un seul essai). */
export type DemandeEcran3FamilleF = "comparerValeur" | "verifierAffirmation";

export interface ContexteFamilleF {
  id: string;
  texte: string;
  labelComposants: [string, string, string];
}

export interface ExerciceFamilleF {
  famille: "F";
  contexte: ContexteFamilleF;
  /** p1,p2,p3 — probabilités de FONCTIONNEMENT (jamais de panne) des 3 composants, indépendantes. */
  p: [number, number, number];
  configuration: ConfigurationFamilleF;
  /** Composant SEUL en série (les 2 autres en parallèle entre eux) — présent SEULEMENT si
   * `configuration==="mixte"`, index dans `p`. */
  positionMixte?: 0 | 1 | 2;
  demandeEcran3: DemandeEcran3FamilleF;
  /** Configuration ALTERNATIVE de l'écran 3 (mêmes composants, agencement différent). */
  configurationAlternative: ConfigurationFamilleF;
  positionMixteAlternative?: 0 | 1 | 2;
  /** Valeur affirmée (arrondie à 4 décimales) pour la fiabilité de la configuration alternative —
   * présente SEULEMENT si `demandeEcran3==="verifierAffirmation"`. Vraie ssi c'est l'arrondi correct
   * à 4 décimales ; fausse = valeur obtenue en confondant série et parallèle. */
  affirmationValeur?: number;
}

// ============================================================================
// Famille G — Mélange d'objets (probabilités totales).
// ============================================================================

/** Réutilise `6gen31` famille C sous-type "special" (dé truqué à une face spéciale)
 * comme `base` (3 écrans repris TELS QUELS), PUIS ajoute une couche de probabilités totales : cet
 * objet (le dé truqué) est choisi au hasard avec probabilité `poidsObjet1` parmi 2 objets, l'AUTRE
 * objet ayant sa propre probabilité (DONNÉE, pas à recalculer) pour le MÊME événement composé — écran
 * 4 : combiner via la formule des probabilités totales. */
export interface ExerciceFamilleGMelange {
  famille: "G";
  sousType: "melangeObjets";
  base: ExerciceDeMelange;
  contexteMelange: { texte: string; labelObjet1: string; labelObjet2: string };
  /** P(choisir l'objet 1), 0<poidsObjet1<1. */
  poidsObjet1: number;
  /** P(événement composé de `base` écran 3 | objet 2) — DONNÉE directement, distincte de la valeur
   * de l'objet 1 (jamais recalculée depuis un second dé complet : hors scope, l'énoncé la donne). */
  probabiliteAutreObjet: number;
}

export type ExerciceFamilleG = ExerciceFamilleGMelange;

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceProbabilitesProblemes = ExerciceFamilleA | ExerciceFamilleB | ExerciceFamilleC | ExerciceFamilleE | ExerciceFamilleF | ExerciceFamilleG;

export type FamilleProbabilitesProblemes = ExerciceProbabilitesProblemes["famille"];

export type GenerateurExerciceProbabilitesProblemes = () => ExerciceProbabilitesProblemes;

// Réexports pratiques (types réutilisés tels quels, voir en-tête) — pour que
// `generateurs6e/probabilitesProblemes/*` n'ait jamais à importer directement
// `independanceBayes.types`/`tiragesArbres.types` en plus de CE fichier.
export type { ContexteBayesNumerique, ExerciceBayesNumerique, ExerciceDeMelange };
