/**
 * Couche core (6e) — contrat pour `6gen12` ("Exponentielles : problèmes", chapitre 2). 7 familles
 * STRUCTURELLEMENT DISJOINTES (union discriminée par `famille`, jamais un seul type à champs
 * `| null` partagés — même principe que `equationsExponentielles.types.ts`, 6gen9), chacune tirée
 * de façon ÉQUIPROBABLE (voir `generateurs6e/exponentiellesProblemes/index.ts`).
 *
 * **Convention arrondie** (première du chapitre, voir CLAUDE.md/le prompt de 6gen12) : la plupart
 * des champs numériques stockent la valeur EXACTE calculée en interne (jamais arrondie) — c'est
 * `moteur6e/verificationExponentiellesProblemes.ts` qui applique une tolérance large à la
 * comparaison, jamais ce fichier. Les champs `*Affiche` (ex. `v2Affiche`, `aAffiche`) sont les SEULES
 * valeurs arrondies pour AFFICHAGE à l'élève (l'énoncé donne toujours des nombres "ronds") ; la
 * valeur exacte sous-jacente reste la référence de correction.
 *
 * **Chaque famille référence un `contexteId`** — résolu côté `ui6e/formatExponentiellesProblemes.ts`
 * via les bassins de contextes de `generateurs6e/exponentiellesProblemes/contextes.ts` (jamais
 * stocké en dur ici, pour ne jamais dupliquer le texte français entre génération et affichage).
 */

// ============================================================================
// Famille A — Évaluer ou résoudre Q(t)=Q0·r^t (2 écrans, 2 sous-types).
// ============================================================================

export type SousTypeExpoProbA = "evaluer" | "doublement";

/** Sous-type "évaluer" — Q0 et le nombre de périodes n sont donnés, Q(n) est à calculer. */
export interface ExerciceExpoProbA_Evaluer {
  famille: "A";
  sousType: "evaluer";
  contexteId: string;
  Q0: number;
  /** Pourcentage énoncé (toujours positif, 2 à 10) — `croissance` décide du signe dans `r`. */
  p: number;
  croissance: boolean;
  /** `1+p/100` si croissance, `1-p/100` sinon. */
  r: number;
  n: number;
  /** Q0·r^n, valeur EXACTE (jamais arrondie ici). */
  valeurFinale: number;
}

/** Sous-type "doublement/fraction" — un temps de référence T (état à 100 %) est donné ; la
 * question porte sur le moment où une fraction 1/2^k de cet état était atteinte. Modèle retenu :
 * reculer d'une période (jour, heure...) divise par 2, donc l'instant cherché est `t=T-k`. */
export interface ExerciceExpoProbA_Doublement {
  famille: "A";
  sousType: "doublement";
  contexteId: string;
  T: number;
  k: number;
  /** T-k, solution de l'écran 2. */
  t: number;
}

export type ExerciceExpoProbA = ExerciceExpoProbA_Evaluer | ExerciceExpoProbA_Doublement;

// ============================================================================
// Famille B — Modèle complémentaire, asymptote-objectif (4 écrans).
// ============================================================================

export interface ExerciceExpoProbB {
  famille: "B";
  contexteId: string;
  Q0: number;
  p: number;
  /** `1-p/100` — taux multiplicateur du RESTE (toujours décroissant, jamais stocké 2 fois). */
  q: number;
  n: number;
  /** Écart au but visé (Q0-complément(t)) dont on cherche le temps d'atteinte, écran 4. */
  toleranceSeuil: number;
  /** complément(n) = Q0·(1-q^n), valeur EXACTE. */
  complementN: number;
  /** t tel que complément(t)=Q0-toleranceSeuil, valeur EXACTE — peut être négatif/non fini si
   * `toleranceSeuil` dépasse `Q0` (jamais généré : voir `familles/B.ts`, construction garantissant
   * `0 < toleranceSeuil < Q0`). */
  tSeuil: number;
}

// ============================================================================
// Famille C — Modèle à 2 points, taux inconnu (3 écrans).
// ============================================================================

export interface ExerciceExpoProbC {
  famille: "C";
  contexteId: string;
  t1: number;
  t2: number;
  v1: number;
  /** Taux EXACT choisi à la génération ("génération par construction") — la réponse attendue de
   * l'écran 1, jamais recalculée depuis `v2Affiche` arrondi. */
  r: number;
  /** v1·r^(t2-t1), valeur EXACTE. */
  v2: number;
  /** v2 arrondi — seule valeur numérique montrée à l'élève dans l'énoncé (spec : "arrondi à
   * l'affichage"). */
  v2Affiche: number;
  /** v1/r^t1, valeur EXACTE — réponse de l'écran 2. */
  Q0: number;
  /** 1 à 3 temps demandés à l'écran 3 (add-as-needed), triés croissant. */
  tempsDemandes: number[];
  /** Q0·r^t pour chaque temps de `tempsDemandes`, même ordre, valeurs EXACTES. */
  valeursDemandees: number[];
}

// ============================================================================
// Famille D — Modèle à asymptote non nulle, 3 points (4 écrans).
// ============================================================================

export interface ExerciceExpoProbD {
  famille: "D";
  contexteId: string;
  /** Valeur de stabilisation — INCONNUE de l'élève au départ, jamais donnée dans l'énoncé. */
  L: number;
  /** Écart initial signé (positif=approche par le haut, négatif=par le bas). */
  C: number;
  r: number;
  d: number;
  /** a=T(0)=L+C, b=T(d), c=T(2d) — valeurs EXACTES (jamais arrondies ici). */
  a: number;
  b: number;
  c: number;
  /** Mêmes 3 points ARRONDIS — seules valeurs montrées à l'élève. */
  aAffiche: number;
  bAffiche: number;
  cAffiche: number;
  /** r^d, valeur EXACTE — réponse attendue de l'écran 1. */
  rapport: number;
  /** Temps supplémentaire évalué à l'écran 4 (au-delà de 2d). */
  tSuppl: number;
  /** T(tSuppl), valeur EXACTE. */
  valeurSuppl: number;
}

// ============================================================================
// Famille E — Optimisation puissance×exponentielle (3 écrans).
// ============================================================================

export interface ExerciceExpoProbE {
  famille: "E";
  contexteId: string;
  n: number;
  a: number;
  k: number;
  /** Temps du maximum, n/a (t=0 est un minimum trivial, jamais la bonne réponse). */
  tMax: number;
  /** f(tMax), valeur EXACTE. */
  fMax: number;
}

// ============================================================================
// Famille F — Modèle de saturation donné, coûts/revenus (4 écrans).
// ============================================================================

export interface ExerciceExpoProbF {
  famille: "F";
  contexteId: string;
  k: number;
  N: number;
  g: number;
  F: number;
  V: number;
  n1: number;
  n2: number;
  /** p(n1) = 1-e^(-k·n1), proportion EXACTE dans [0,1]. */
  pN1: number;
  /** p(n2) = 1-e^(-k·n2), proportion EXACTE — RECALCULÉE, jamais réutilisation de `pN1`. */
  pN2: number;
  /** p(n2)·N, valeur EXACTE — nombre de personnes touchées à n2. */
  personnesN2: number;
  /** g·personnesN2 - (F+V·n2), valeur EXACTE — bénéfice net à n2. */
  beneficeN2: number;
}

// ============================================================================
// Famille G — Modèle décroissant avec seuil, décision (3 écrans).
// ============================================================================

export interface ExerciceExpoProbG {
  famille: "G";
  contexteId: string;
  c: number;
  k: number;
  a: number;
  /** Seuil critique — S=c+e^(k-a·tSeuilCible) arrondi à 1 décimale (`sAffiche`), garanti > c par
   * construction (une exponentielle est toujours strictement positive). */
  sAffiche: number;
  /** Temps seuil EXACT recalculé depuis `sAffiche` — réponse attendue de l'écran 2, jamais la
   * valeur cible utilisée pour construire `sAffiche` (qui a pu bouger avec l'arrondi). */
  tSeuil: number;
  /** Durée à comparer au temps seuil — atteignable ⟺ `duree >= tSeuil` (grandeur décroissante :
   * le seuil est franchi puis dépassé, jamais retrouvé). */
  duree: number;
  /** 2 temps distincts évalués à l'écran 1. */
  tEval1: number;
  tEval2: number;
  /** f(tEval1), f(tEval2), valeurs EXACTES. */
  fEval1: number;
  fEval2: number;
}

export type ExerciceExponentiellesProblemes = ExerciceExpoProbA | ExerciceExpoProbB | ExerciceExpoProbC | ExerciceExpoProbD | ExerciceExpoProbE | ExerciceExpoProbF | ExerciceExpoProbG;

export type FamilleExponentiellesProblemes = ExerciceExponentiellesProblemes["famille"];

export type GenerateurExerciceExponentiellesProblemes = () => ExerciceExponentiellesProblemes;
