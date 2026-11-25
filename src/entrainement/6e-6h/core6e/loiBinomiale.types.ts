/**
 * Types de `6gen50` « Loi binomiale » (6e ch. 8, § 2) — refonte de l'audit (lots B et C ; décision 3
 * de l'utilisateur : 6gen48 au ch. 7 garde « exactement / au moins / au plus », 6gen50 se recentre sur
 * la loi complète, E, V, σ et le diagramme).
 * - A : reconnaître un schéma de Bernoulli — contextes binomiaux ET non binomiaux (verdict tiré
 *   d'abord, 50 / 50), puis n et p, ou la condition qui échoue.
 * - B : loi complète de 𝓑(n ; p), diagramme en barres à reconnaître, E(X), V(X), σ(X).
 * - C : trouver le plus petit n tel que P(au moins un succès) dépasse un seuil (logarithme).
 */

export type ConditionEchouee = "nombre" | "independance" | "issues";

export interface ExerciceLoiBinomialeA {
  famille: "A";
  /** Situation en prose (X y est défini). */
  texte: string;
  binomiale: boolean;
  /** Paramètres (binomiale seulement). */
  n: number;
  /** p exacte : numérateur / dénominateur (0,2 → 1/5 ; 1/4 ; 1/6). */
  pNum: number;
  pDen: number;
  /** Condition qui échoue (non binomiale seulement). */
  condition: ConditionEchouee | null;
}

export interface ExerciceLoiBinomialeB {
  famille: "B";
  texte: string;
  /** Ce que X compte, pour les phrases (« de graines qui germent »). */
  succes: string;
  n: number;
  /** p en dixièmes (0,1 … 0,9, jamais 0,5 : le diagramme miroir serait identique). */
  p: number;
  /** Ordre des trois diagrammes proposés : "juste", "miroir" (1 − p), "autre" (p = 0,5). */
  ordreDiagrammes: ("juste" | "miroir" | "autre")[];
}

export interface ExerciceLoiBinomialeC {
  famille: "C";
  texte: string;
  /** Question posée (« au moins une graine germe »). */
  evenement: string;
  p: number;
  seuil: number;
  valeurN: number;
}

export type ExerciceLoiBinomiale = ExerciceLoiBinomialeA | ExerciceLoiBinomialeB | ExerciceLoiBinomialeC;

export type FamilleLoiBinomiale = ExerciceLoiBinomiale["famille"];
