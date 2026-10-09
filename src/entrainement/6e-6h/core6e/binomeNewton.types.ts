/**
 * Couche core (6e) — contrat pour `6gen45` ("Binôme de Newton"), chapitre "Analyse combinatoire".
 * 3 familles (A, B, C), tirage ÉQUIPROBABLE de la famille (voir
 * `generateurs6e/binomeNewton/index.ts`).
 *
 * **Convention transversale à ce contrat** (identique à `denombrementFondamental.types.ts`,
 * 6gen43) : chaque exercice porte déjà, PRÉ-CALCULÉES par la Couche A (jamais recalculées côté
 * Couche B — `moteur6e/` n'importe jamais `generateurs6e/`, voir CLAUDE.md), toutes les valeurs
 * numériques correctes attendues à chaque écran. La Couche B
 * (`moteur6e/verificationBinomeNewton.ts`) se contente de comparer la saisie élève à ces valeurs —
 * jamais de logique combinatoire dans `moteur6e/`.
 *
 * **Décomposition en champs — choix de conception documenté (voir `docs/historique-6e.md`)** :
 * chaque terme `k` du développement `(ax+b)ⁿ = Σ C(n,k)(ax)^{n-k}b^k` porte tous les nombres
 * nécessaires pour CHAQUE écran (jamais recalculés) : `coefficientBinomial=C(n,k)`,
 * `exposantX=n-k`, `bPuissanceK=b^k`, `coefficientFinal=C(n,k)·a^{n-k}·b^k` (le coefficient
 * numérique final du monôme `coefficientFinal·x^{exposantX}`).
 */

/** Un terme du développement de `(ax+b)ⁿ`, `k`∈[0,n] — voir en-tête de fichier. */
export interface TermeBinome {
  k: number;
  coefficientBinomial: number;
  exposantX: number;
  bPuissanceK: number;
  coefficientFinal: number;
}

// ============================================================================
// Famille A — Développement complet de (ax+b)ⁿ (3 écrans).
// ============================================================================

/** Écran 1 → liste des `n+1` coefficients binomiaux `C(n,k)` (structure, PAS encore les
 * puissances de `a`/`b` — voir en-tête "décomposition en champs"). Écran 2 → liste des `n+1`
 * coefficients FINAUX calculés (signe propre à chaque terme — PIÈGE central de la famille, voir
 * mission). Écran 3 → 1 champ texte libre, le polynôme final assemblé (ordre décroissant des
 * puissances de x — déjà l'ordre naturel de `termes`, k=0 donnant l'exposant le plus élevé). */
export interface ExerciceBinomeA {
  famille: "A";
  a: number;
  b: number;
  n: number;
  termes: TermeBinome[];
}

// ============================================================================
// Famille B — Terme spécifique sans développement complet (2-3 écrans).
// ============================================================================

export type SousTypeBinomeB = "rang" | "puissance";

/** `sousType="rang"` : `k` donné directement (écran "trouver k" SAUTÉ). `sousType="puissance"` :
 * `p` (l'exposant de x visé) donné, `k` À RETROUVER tel que `n-k=p` — `p` n'est présent QUE pour
 * ce sous-type (`undefined` sinon). Écran "trouver k" (si `puissance`) → `[k]`. Écran "poser" →
 * `[coefficientBinomial, bPuissanceK]` (structure, `a^{n-k}` et `x^{n-k}` restent implicites —
 * cohérent avec la famille A). Écran "calculer" → `[coefficientFinal]` (coefficient seul,
 * jamais le terme complet avec x — décision de conception, voir mission "selon la consigne" et
 * `docs/historique-6e.md`). */
export interface ExerciceBinomeB {
  famille: "B";
  a: number;
  b: number;
  n: number;
  sousType: SousTypeBinomeB;
  p?: number;
  k: number;
  coefficientBinomial: number;
  exposantX: number;
  bPuissanceK: number;
  coefficientFinal: number;
}

// ============================================================================
// Famille C — Approximation décimale via développement binomial (3 écrans).
// ============================================================================

/** Terme du développement de `(1+ε)ⁿ = Σ C(n,k)·εᵏ` (base `1` élevée à toute puissance vaut `1`,
 * omise du contrat — seul `εᵏ` reste pertinent). */
export interface TermeBinomeC {
  k: number;
  coefficientBinomial: number;
  epsilonPuissanceK: number;
  valeurTerme: number;
}

/** `epsilon` décimal petit (positif ou négatif), `base=1+epsilon` (arrondi 2 décimales pour
 * l'affichage — évite tout artefact flottant du type `0.1+1=1.0999999999999999`). Écran 1 → liste
 * des `n+1` coefficients binomiaux (même structure que famille A écran 1). Écran 2 → liste des
 * `n+1` valeurs de terme `C(n,k)·εᵏ`. Écran 3 → 1 champ, la somme exacte `valeurFinale`. */
export interface ExerciceBinomeC {
  famille: "C";
  epsilon: number;
  n: number;
  base: number;
  termes: TermeBinomeC[];
  valeurFinale: number;
}

export type ExerciceBinomeNewton = ExerciceBinomeA | ExerciceBinomeB | ExerciceBinomeC;

export type FamilleBinomeNewton = ExerciceBinomeNewton["famille"];
