/**
 * Couche core (6e) — contrat pour `6gen51` ("Loi normale", PREMIER générateur du nouveau chapitre
 * "Variables aléatoires et lois de probabilités"). 5 familles (A à E), tirage ÉQUIPROBABLE de la
 * famille — voir `generateurs6e/loiNormale/index.ts`.
 *
 * Deux axes organisent les 5 familles : **centrée réduite (Z) vs générale N(μ,σ) (X)** (pont :
 * standardisation `z=(x-μ)/σ`) et **sens direct (probabilité depuis une borne) vs sens inverse
 * (borne depuis une probabilité)**. Famille E (règle empirique 68-95-99,7) est un cas à part,
 * volontairement INDÉPENDANT de la table Φ — voir en-tête `generateurs6e/loiNormale/familleE.ts`.
 *
 * Aucun champ ne stocke de valeur DÉRIVABLE (bornes affichées famille E, Φ(k)/Φ(zB) familles C/D) —
 * toujours recalculée depuis μ/σ/k (ou p/k) au moment de l'affichage/la vérification, jamais figée
 * à la génération (convention CLAUDE.md, "vérification par cohérence interne").
 */

// ============================================================================
// Famille A — Centrée réduite, sens direct (2 écrans).
// ============================================================================

export type SousTypeLoiNormaleA = "inferieur" | "superieur" | "intervalle";

export interface ExerciceLoiNormaleA_Borne {
  famille: "A";
  sousType: "inferieur" | "superieur";
  z: number;
}
export interface ExerciceLoiNormaleA_Intervalle {
  famille: "A";
  sousType: "intervalle";
  z1: number;
  z2: number;
}
export type ExerciceLoiNormaleA = ExerciceLoiNormaleA_Borne | ExerciceLoiNormaleA_Intervalle;

// ============================================================================
// Famille B — Générale N(μ,σ), sens direct + estimation d'effectif (2-3 écrans).
// ============================================================================

export type SousTypeLoiNormaleB = "inferieur" | "superieur" | "intervalle";

export interface ExerciceLoiNormaleB_Borne {
  famille: "B";
  sousType: "inferieur" | "superieur";
  mu: number;
  sigma: number;
  x: number;
  population?: number;
}
export interface ExerciceLoiNormaleB_Intervalle {
  famille: "B";
  sousType: "intervalle";
  mu: number;
  sigma: number;
  x1: number;
  x2: number;
  population?: number;
}
export type ExerciceLoiNormaleB = ExerciceLoiNormaleB_Borne | ExerciceLoiNormaleB_Intervalle;

// ============================================================================
// Famille C — Centrée réduite, sens inverse (2 écrans).
// ============================================================================

export type SousTypeLoiNormaleC = "cumulee" | "symetrique" | "encadree";

export interface ExerciceLoiNormaleC_Cumulee {
  famille: "C";
  sousType: "cumulee";
  p: number;
}
export interface ExerciceLoiNormaleC_Symetrique {
  famille: "C";
  sousType: "symetrique";
  p: number;
}
/** `k` connu (donnée), `Φ(k)` toujours RECALCULÉE depuis `k` (jamais stockée) — voir en-tête de
 * fichier. */
export interface ExerciceLoiNormaleC_Encadree {
  famille: "C";
  sousType: "encadree";
  p: number;
  k: number;
}
export type ExerciceLoiNormaleC = ExerciceLoiNormaleC_Cumulee | ExerciceLoiNormaleC_Symetrique | ExerciceLoiNormaleC_Encadree;

// ============================================================================
// Famille D — Générale, sens inverse (3 écrans). Mirroir structurel de la famille C, avec μ,σ.
// ============================================================================

export type SousTypeLoiNormaleD = "cumulee" | "symetrique" | "encadree";

export interface ExerciceLoiNormaleD_Cumulee {
  famille: "D";
  sousType: "cumulee";
  mu: number;
  sigma: number;
  p: number;
}
export interface ExerciceLoiNormaleD_Symetrique {
  famille: "D";
  sousType: "symetrique";
  mu: number;
  sigma: number;
  p: number;
}
/** `b` connu (donnée, en unités de X — analogue au `k` de la famille C). */
export interface ExerciceLoiNormaleD_Encadree {
  famille: "D";
  sousType: "encadree";
  mu: number;
  sigma: number;
  p: number;
  b: number;
}
export type ExerciceLoiNormaleD = ExerciceLoiNormaleD_Cumulee | ExerciceLoiNormaleD_Symetrique | ExerciceLoiNormaleD_Encadree;

// ============================================================================
// Famille E — Règle empirique 68-95-99,7 depuis un graphique (3 écrans, indépendante de Φ).
// ============================================================================

export type CoteDemandeE = "superieur" | "inferieur";

export interface ExerciceLoiNormaleE {
  famille: "E";
  mu: number;
  sigma: number;
  k: 1 | 2 | 3;
  /** `true` : la question porte sur UN SEUL côté (piège central — voir en-tête `familleE.ts`) ;
   * `false` : question symétrique classique "en dehors de l'intervalle". */
  unCote: boolean;
  /** Présent uniquement si `unCote` — quel côté est demandé (narratif seulement, la probabilité
   * est la même des deux côtés par symétrie). */
  coteDemande?: CoteDemandeE;
  population?: number;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceLoiNormale = ExerciceLoiNormaleA | ExerciceLoiNormaleB | ExerciceLoiNormaleC | ExerciceLoiNormaleD | ExerciceLoiNormaleE;

export type FamilleLoiNormale = ExerciceLoiNormale["famille"];
