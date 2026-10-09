import type { ExerciceBinomialeA, TypeQuestionBinomialeA } from "./binomialeSequenceOrdonnee.types";

/**
 * Couche core (6e) — contrat pour `6gen50` ("Loi binomiale"), chapitre "Variables aléatoires et
 * lois de probabilités". 3 familles, tirage ÉQUIPROBABLE — voir `generateurs6e/loiBinomiale/
 * index.ts`.
 *
 * **Famille A — Justifier qu'une variable suit une loi binomiale (2 écrans FIXES)** : contrairement
 * à `6gen48` famille A (qui DONNE `n`/`p` directement dans le bloc de données), ici `n`/`p` sont
 * ENCORE À IDENTIFIER par l'élève à l'écran 1 — ils restent donc EMBARQUÉS dans la phrase narrative
 * du contexte (`ContexteLoiBinomialeA.texteTemplate(n,p)`), jamais affichés comme donnée brute avant
 * confirmation. Une fois confirmés, ils réapparaissent (bloc "état actuel") à l'écran 2.
 *
 * **Famille B — Calculs directs, RÉUTILISE INTÉGRALEMENT `6gen48` famille A** (voir en-tête
 * `generateurs6e/binomialeSequenceOrdonnee/familleA.ts`, section "CONTRAT DE RÉUTILISATION —
 * `6gen50`") : `ExerciceLoiBinomialeB` étend `ExerciceBinomialeA` (moins son propre discriminant
 * `famille`) plutôt que de dupliquer `n`/`p`/`k`/`typeQuestion`/`strategie`/`termesACalculer`/
 * `valeursTermes`/`resultatFinal` — ces champs sont produits tels quels par
 * `construireAvecTypeQuestion` de `6gen48`, seul `contexte` (banque PROPRE à `6gen50`, voir
 * `generateurs6e/loiBinomiale/contextes.ts`) et `esperance` (nouveau, `n·p`) sont ajoutés/remplacés
 * ici. Écran supplémentaire (`Esperance`) : valeur de E(X) + interprétation QCM.
 *
 * **Famille C — Trouver n via logarithme, "au moins 1 succès" (3 écrans FIXES)** — SCOPE LIMITÉ
 * (spec) aux inversions "au moins 1 succès" ; les variantes "au moins k" (k>1) nécessiteraient une
 * résolution numérique/itérative, explicitement HORS SCOPE. `valeurN` — nombre minimal d'épreuves
 * CORRECT (arrondi au nombre entier supérieur), PRÉ-CALCULÉ par la Couche A
 * (`generateurs6e/loiBinomiale/familleC.ts::calculerNMinimalC`), jamais recalculé côté Couche B
 * (`moteur6e/` n'importe jamais `generateurs6e/` — CLAUDE.md).
 */

// ============================================================================
// Famille A — Justifier qu'une variable suit une loi binomiale.
// ============================================================================

export interface ContexteLoiBinomialeA {
  id: string;
  /** Phrase narrative qui EMBARQUE `n` et `p` en toutes lettres (contrairement à `6gen48`, où le
   * contexte ne mentionne JAMAIS `n`/`p`/`k`) — l'élève doit pouvoir les EXTRAIRE de cette phrase à
   * l'écran 1. `p` déjà formaté en pourcentage entier lisible (voir `formatPourcentageMot`,
   * `generateurs6e/loiBinomiale/contextes.ts`). */
  texteTemplate: (n: number, p: number) => string;
  /** Description de l'événement "succès" pour ce contexte (ex. "la facture reste impayée"),
   * réutilisée dans le libellé de la 3e condition de Bernoulli à l'écran 2 (« Chaque épreuve n'a que
   * 2 issues possibles : [labelSucces] ou non. »). */
  labelSucces: string;
}

export interface ExerciceLoiBinomialeA {
  famille: "A";
  contexte: ContexteLoiBinomialeA;
  n: number;
  p: number;
}

// ============================================================================
// Famille B — Calculs directs (référence à 6gen48).
// ============================================================================

/** `contexte` PROPRE à `6gen50` (banque distincte de celle de `6gen48`, mais MÊME FORME
 * `{id,texte,labelSucces}` — voir `ContexteBinomialeA`, réutilisée telle quelle). */
export interface ExerciceLoiBinomialeB extends Omit<ExerciceBinomialeA, "famille"> {
  famille: "B";
  /** `n·p` — moyenne théorique du nombre de succès. */
  esperance: number;
}

// ============================================================================
// Famille C — Trouver n via logarithme, "au moins 1 succès".
// ============================================================================

export interface ContexteLoiBinomialeC {
  id: string;
  /** Texte narratif générique (ne mentionne jamais `p`/`seuil`/`n` — valeurs dans le bloc données,
   * mirroir `ContexteBinomialeB` de `6gen48`). */
  texte: string;
}

export interface ExerciceLoiBinomialeC {
  famille: "C";
  contexte: ContexteLoiBinomialeC;
  p: number;
  seuil: number;
  /** Nombre minimal d'épreuves CORRECT (entier, arrondi au supérieur) — voir en-tête de fichier. */
  valeurN: number;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceLoiBinomiale = ExerciceLoiBinomialeA | ExerciceLoiBinomialeB | ExerciceLoiBinomialeC;
export type FamilleLoiBinomiale = ExerciceLoiBinomiale["famille"];

export type { TypeQuestionBinomialeA };
