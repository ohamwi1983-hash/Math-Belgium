import type { ContexteFamilleC as ContexteBayesNumerique, ExerciceFamilleC as ExerciceBayesNumerique } from "./independanceBayes.types";
import type { ContexteFamilleB as ContexteDerangements, ExerciceFamilleB as ExerciceDerangements, ExerciceFamilleCSpecial as ExerciceDeMelange } from "./tiragesArbres.types";

/**
 * Couche core (6e) — contrat pour `6gen33` ("Probabilités : problèmes", chapitre 8 "Probabilités",
 * générateur de CLÔTURE du chapitre — après `6gen30`/`6gen31`/`6gen32`). Tirage ÉQUIPROBABLE d'1
 * famille parmi 7 (A à G), puis d'un contexte/sous-type au sein de la famille (voir
 * `generateurs6e/probabilitesProblemes/index.ts`).
 *
 * ============================================================================
 * **RÉUTILISATION EXPLICITE (Couche core ↔ Couche core, libre)**
 * ============================================================================
 * - Famille E, sous-type "mixte" : réutilise TEL QUEL le contrat `ExerciceFamilleC`/`ContexteFamilleC`
 *   de `core6e/independanceBayes.types.ts` (6gen32) comme `base` — mêmes champs `p`/`q1`/`q2`/
 *   `contexte`/`demandeEcran3`, jamais réimplémenté.
 * - Famille G, sous-type "derangements" : réutilise TEL QUEL le contrat `ExerciceFamilleB`/
 *   `ContexteFamilleB` de `core6e/tiragesArbres.types.ts` (6gen31, n∈{3,4,5}) comme `base`, avec
 *   `n=4` fixé (spec : "aucune adaptation nécessaire, juste une instance de plus").
 * - Famille G, sous-type "melangeObjets" : réutilise TEL QUEL `ExerciceFamilleCSpecial` de
 *   `core6e/tiragesArbres.types.ts` (6gen31, dé truqué "special") comme `base`.
 * Toutes les probabilités NOUVELLES à ce générateur sont stockées en `number` décimal (même
 * convention que `core6e/independanceBayes.types.ts` : donnée de départ directement décimale dans la
 * spec, jamais un dénominateur commun naturel) — vérifiées à tolérance 0,01 par `diagnostiquerValeur`
 * (`moteur6e/verificationProbabilites.ts`, chapitre 8), SAUF famille A (tolérance resserrée, voir
 * `generateurs6e/probabilitesProblemes/familleA.ts`, en-tête).
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
// Famille B — Loi binomiale.
// ============================================================================

export interface ContexteFamilleB {
  id: string;
  texte: string;
  /** Verbe/état du succès, singulier, déjà accordé (ex. "réussit son tir") — jamais reconstruit
   * mécaniquement (même piège que `ContextePannes`/`ContexteFamilleC` de 6gen32, voir leur en-tête). */
  labelSucces: string;
}

/** Écran 3 — 2 variantes (spec) : somme des queues de la binomiale, ou complément à "tous
 * identiques" (ni tout succès, ni tout échec). */
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
  /** 3 libellés courts (ex. "Machine 1", "Feu A") — jamais des phrases complètes, réutilisés en
   * KaTeX (`P(\\text{...})`) donc toujours entourés de `\\text{}` côté `ui6e/formatProbabilitesProblemes.ts`. */
  labelElements: [string, string, string];
}

export interface ExerciceFamilleC {
  famille: "C";
  contexte: ContexteFamilleC;
  /** p1,p2,p3 — probabilités de "succès" DISTINCTES (jamais de loi binomiale applicable, spec). */
  p: [number, number, number];
  /** Nombre de succès demandé, k∈{0,1,2,3}. */
  k: number;
}

// ============================================================================
// Famille D — Probabilité géométrique (zones concentriques).
// ============================================================================

export interface ContexteFamilleD {
  id: string;
  texte: string;
  /** Libellés des 3 zones (disque interne, anneau2, anneau3), courts, entourés de `\\text{}` en
   * KaTeX (même convention que `labelElements` ci-dessus). */
  labelZones: [string, string, string];
}

export interface ExerciceFamilleD {
  famille: "D";
  contexte: ContexteFamilleD;
  /** Rayons entiers, r1<r2<r3 (le disque interne a pour rayon r1, l'anneau2 est bordé par r1/r2, etc). */
  r: [number, number, number];
  /** Indices (0=disque interne,1=anneau2,2=anneau3) des zones dont l'aire est SOMMÉE au numérateur
   * de la probabilité demandée à l'écran 2 — toujours des indices CONTIGUS depuis 0 (ex. [0], [0,1]) :
   * une probabilité géométrique concentrique naturelle est toujours "dans le disque de rayon ≤ rᵢ",
   * jamais une zone isolée non contiguë au centre. */
  zoneCible: number[];
}

// ============================================================================
// Famille E — Bayes numérique (données mixtes) et Bayes paramétrique.
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

export interface ExerciceFamilleEParametrique {
  famille: "E";
  sousType: "parametrique";
  contexte: { texte: string };
  /** P(test positif | malade) — DONNÉ numériquement, 0<a<1. */
  a: number;
  /** P(test positif | non malade) — DONNÉ numériquement, 0<b<1, b≠a. */
  b: number;
  /** Seuil de l'inéquation P(x)>seuil demandée à l'écran 3, 0<seuil<1. */
  seuil: number;
}

export type ExerciceFamilleE = ExerciceFamilleEMixte | ExerciceFamilleEParametrique;

// ============================================================================
// Famille F — Fiabilité de circuits.
// ============================================================================

export type ConfigurationFamilleF = "serie" | "parallele" | "mixte";

/** Écran 3 — 2 variantes (spec) : comparer à une configuration alternative (valeur numérique), ou
 * juger une affirmation donnée (vrai/faux). */
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
  /** Configuration ALTERNATIVE comparée à l'écran 3 (mêmes composants, position/agencement
   * différent) — présente SEULEMENT si `demandeEcran3==="comparerValeur"`. */
  configurationAlternative?: ConfigurationFamilleF;
  positionMixteAlternative?: 0 | 1 | 2;
  /** Valeur affirmée à juger (vrai/faux) — présente SEULEMENT si
   * `demandeEcran3==="verifierAffirmation"`. */
  affirmationValeur?: number;
}

// ============================================================================
// Famille G — Réutilisations étendues (3 sous-types).
// ============================================================================

/** Sous-type 1 — réutilise INTÉGRALEMENT `6gen31` famille B (dérangements), n=4 fixé (spec :
 * "aucune adaptation nécessaire, juste une instance de plus dans la même famille") — 4 écrans repris
 * TELS QUELS (positions fixées / tout correct / exactement k correctes / aucune correcte). */
export interface ExerciceFamilleGDerangements {
  famille: "G";
  sousType: "derangements";
  base: ExerciceDerangements;
}

/** Sous-type 2 — réutilise `6gen31` famille C sous-type "special" (dé truqué à une face spéciale)
 * comme `base` (3 écrans repris TELS QUELS), PUIS ajoute une couche de probabilités totales : cet
 * objet (le dé truqué) est choisi au hasard avec probabilité `poidsObjet1` parmi 2 objets, l'AUTRE
 * objet ayant sa propre probabilité (DONNÉE, pas à recalculer) pour le MÊME événement composé — écran
 * 4 : combiner via la formule des probabilités totales. */
export interface ExerciceFamilleGMelange {
  famille: "G";
  sousType: "melangeObjets";
  base: ExerciceDeMelange;
  contexteMelange: { texte: string; labelObjet1: string; labelObjet2: string; labelEvenement: string };
  /** P(choisir l'objet 1), 0<poidsObjet1<1. */
  poidsObjet1: number;
  /** P(événement composé de `base` écran 3 | objet 2) — DONNÉE directement, distincte de la valeur
   * de l'objet 1 (jamais recalculée depuis un second dé complet : hors scope, l'énoncé la donne). */
  probabiliteAutreObjet: number;
}

/** Sous-type 3 — cadre financier, 3 écrans (spec). */
export interface CategorieFinanciere {
  id: string;
  label: string;
  /** Proportion de la population dans cette catégorie, 0<proportion<1, somme des catégories = 1. */
  proportion: number;
  /** Taux de "succès" (ex. taux de vente d'une extension de garantie) dans cette catégorie, 0<taux<1. */
  taux: number;
}

export interface ExerciceFamilleGFinancier {
  famille: "G";
  sousType: "financier";
  contexte: { texte: string; libelleValeur: string };
  /** 2 ou 3 catégories, proportions sommant exactement à 1. */
  categories: CategorieFinanciere[];
  /** Valeur unitaire d'un "succès" (ex. commission en €). */
  valeurUnitaire: number;
  nombreTotalIndividus: number;
}

export type ExerciceFamilleG = ExerciceFamilleGDerangements | ExerciceFamilleGMelange | ExerciceFamilleGFinancier;

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceProbabilitesProblemes = ExerciceFamilleA | ExerciceFamilleB | ExerciceFamilleC | ExerciceFamilleD | ExerciceFamilleE | ExerciceFamilleF | ExerciceFamilleG;

export type FamilleProbabilitesProblemes = ExerciceProbabilitesProblemes["famille"];

export type GenerateurExerciceProbabilitesProblemes = () => ExerciceProbabilitesProblemes;

// Réexports pratiques (types réutilisés tels quels, voir en-tête) — pour que
// `generateurs6e/probabilitesProblemes/*` n'ait jamais à importer directement
// `independanceBayes.types`/`tiragesArbres.types` en plus de CE fichier.
export type { ContexteBayesNumerique, ContexteDerangements, ExerciceBayesNumerique, ExerciceDeMelange, ExerciceDerangements };
