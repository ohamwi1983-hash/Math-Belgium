/**
 * Types de `6gen53` « Loi de Poisson » (6e ch. 8, § 8) — refonte de l'audit (lots B et C).
 * - A : approximation binomiale → Poisson. Verdict « approximable ? » tiré d'abord (50 / 50 ; s'il
 *   échoue, UNE condition échoue, tirée au tiers), puis λ = np et P(X = k).
 * - B : λ ajusté à l'échelle (λ ≤ 15 : calcul possible à la calculatrice), puis une probabilité
 *   (exactement, au plus, au moins, entre), contextes dans les conditions du cours, X toujours défini.
 */

export type ConditionPoisson = "n" | "p" | "np";

export interface ExerciceLoiPoissonA {
  famille: "A";
  /** Situation (n, p et X dans le texte). */
  texte: string;
  n: number;
  /** p en centièmes. */
  pCentiemes: number;
  k: number;
  approximable: boolean;
  condition: ConditionPoisson | null;
}

export type TypeQuestionPoissonB = "exactement" | "entreAetB" | "auPlus" | "auMoins";

export interface ExerciceLoiPoissonB {
  famille: "B";
  /** Taux de référence, échelle de l'énoncé et définition de X, en prose. */
  texte: string;
  /** Ce que compte X (« le nombre d'articles défectueux du lot »). */
  definitionX: string;
  lambda: number;
  /** Calcul de λ à partir du taux (KaTeX), pour l'explication. */
  calculLambda: string;
  typeQuestion: TypeQuestionPoissonB;
  k: number;
  /** Borne haute pour « entre a et b » (k = a), sinon null. */
  kHaut: number | null;
}

export type ExerciceLoiPoisson = ExerciceLoiPoissonA | ExerciceLoiPoissonB;

export type FamilleLoiPoisson = ExerciceLoiPoisson["famille"];
