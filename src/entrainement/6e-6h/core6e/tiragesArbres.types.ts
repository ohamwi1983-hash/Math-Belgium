/**
 * Couche core (6e) — contrat pour `6gen31` ("Tirages, arbres et dénombrement", chapitre 8
 * "Probabilités", DEUXIÈME générateur de ce chapitre, construit sur l'infrastructure fondée par
 * `6gen30` — voir `moteur6e/verificationProbabilites.ts` pour le contrat de réutilisation exact
 * (`diagnostiquerValeur`, réponse fraction/décimal). 3 familles (A, B, C), tirage ÉQUIPROBABLE de
 * la famille (spec : "Tirage aléatoire d'1 famille parmi 3 (A, B, C, équiprobable)"), chaque
 * famille tirant ensuite son propre contexte/sous-type en interne (voir
 * `generateurs6e/tiragesArbres/{familleA,familleB,familleC}.ts`).
 *
 * ============================================================================
 * Toutes les valeurs numériques générées restent des ENTIERS exacts ou des `FractionExacte`
 * (numérateur/dénominateur entiers, PAS nécessairement déjà réduite — même convention que
 * `core6e/probabilitesEnsembles.types.ts`, réduite seulement à l'affichage/la vérification, jamais
 * stockée réduite ni stockée en flottant — CLAUDE.md, "fraction irréductible, jamais de décimal").
 * ============================================================================
 */

// ============================================================================
// Famille A — Tirages avec/sans remise dans une urne à 2 couleurs.
// ============================================================================

export interface ExerciceFamilleA {
  famille: "A";
  /** Effectif de la couleur 1, 4 ≤ n1 ≤ 7. */
  n1: number;
  /** Effectif de la couleur 2, 4 ≤ n2 ≤ 7. */
  n2: number;
  labelCouleur1: string;
  labelCouleur2: string;
  /** Nombre de tirages successifs, k ∈ {2,3}. */
  k: number;
  avecRemise: boolean;
  /** Pour l'écran 3 ("exactement m boules de couleur 1") — TOUJOURS 0 < m < k (jamais m=0 ni m=k,
   * déjà couverts par l'écran 2 "toutes même couleur"). */
  m: number;
}

// ============================================================================
// Famille B — Permutations et dérangements.
// ============================================================================

export type ContexteFamilleB = "lettres" | "chansons";

/** Écran 1 — position UNE fixée, ou DEUX positions fixées simultanément (spec : "P(une position
 * donnée fixée), ou P(deux positions données fixées simultanément)"). */
export type DemandeEcran1FamilleB = "une" | "deux";

export interface ExerciceFamilleB {
  famille: "B";
  /** n ∈ {3,4,5} — nombre d'éléments (lettres/enveloppes ou chansons/positions). */
  n: number;
  contexte: ContexteFamilleB;
  demandeEcran1: DemandeEcran1FamilleB;
  /** Position(s) fixée(s) présentée(s) à l'écran 1 — longueur 1 si `demandeEcran1==="une"`,
   * longueur 2 (distinctes) si `"deux"`. Purement narratif : la VALEUR de la probabilité ne dépend
   * que de `n` (symétrie des positions), jamais de laquelle est choisie. */
  positionsEcran1: number[];
  /** k pour l'écran 3 ("exactement k positions correctes") — TOUJOURS 1 ≤ k ≤ n-2 (jamais n-1,
   * structurellement impossible : spec). */
  k: number;
}

// ============================================================================
// Famille C — Distributions non uniformes, dé truqué.
// ============================================================================

/** Fraction exacte, PAS nécessairement réduite au stockage (voir en-tête de fichier). */
export interface FractionExacte {
  num: number;
  den: number;
}

/** Sous-type (1) — une face `faceSpeciale` a une probabilité FIXÉE `p0` (donnée numérique connue),
 * les 5 autres faces sont équiprobables entre elles (probabilité `p` chacune, INCONNUE — c'est elle
 * qui est résolue à l'écran 2). `p0` et `p` liées par construction : `p0 + 5·p = 1` exactement (voir
 * `generateurs6e/tiragesArbres/familleC.ts`, `genererFamilleCSpecial`). */
export interface ExerciceFamilleCSpecial {
  famille: "C";
  sousType: "special";
  /** Face 1..6 dont la probabilité `p0` est directement donnée par l'énoncé. */
  faceSpeciale: number;
  p0: FractionExacte;
  /** Probabilité INCONNUE, commune aux 5 autres faces — résolue à l'écran 2. */
  p: FractionExacte;
  /** Face (≠ `faceSpeciale`) utilisée à l'écran 3 pour former la probabilité composée
   * P(faceSpeciale ∪ autreFace) = p0 + p. */
  autreFace: number;
}

/** Sous-type (2) — les 3 faces paires sont équiprobables entre elles (probabilité `p` chacune), les
 * 3 faces impaires équiprobables entre elles (probabilité `q` chacune), reliées par `p = r·q`
 * (r ∈ {2,3}, DONNÉ par l'énoncé) — les 2 inconnues `p`,`q` sont résolues à l'écran 2. */
export interface ExerciceFamilleCParite {
  famille: "C";
  sousType: "parite";
  r: 2 | 3;
  p: FractionExacte;
  q: FractionExacte;
  /** Quelle probabilité composée l'écran 3 demande — "pair"/"impair" (les 2 cas nommés par la
   * spec), ou une probabilité sur un sous-ensemble spécifique de faces (`sousEnsemble`, alors
   * non-`undefined`). */
  ecran3Cible: "pair" | "impair" | "sousEnsemble";
  /** Faces du sous-ensemble (2 ou 3 faces distinctes de 1..6) — présent SEULEMENT si
   * `ecran3Cible==="sousEnsemble"`. */
  sousEnsemble?: number[];
}

export type ExerciceFamilleC = ExerciceFamilleCSpecial | ExerciceFamilleCParite;

export type ExerciceTiragesArbres = ExerciceFamilleA | ExerciceFamilleB | ExerciceFamilleC;

export type FamilleTiragesArbres = ExerciceTiragesArbres["famille"];

export type GenerateurExerciceTiragesArbres = () => ExerciceTiragesArbres;
