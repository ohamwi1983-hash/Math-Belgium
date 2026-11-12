/**
 * Couche core (5e) — contrat pour 5gen33 ("Contexte économique"), chapitre "Dérivées et
 * applications". 3 sous-générateurs STRUCTURELLEMENT DISJOINTS, jamais mélangés dans un même
 * exercice. Tous les tirages sont RÉALISTES (audit 5e ch. 5, décision G) : coût fixe > 0, coût
 * total et coût marginal > 0 pour q ≥ 0, prix positif sur le domaine, bénéfice maximal > 0.
 *   - famille "A" — coût marginal : approximation discrète vs dérivée (écart absolu et en %), puis
 *     un minimum économique : coût MOYEN minimal (coût de degré 2) ou coût MARGINAL minimal (coût de
 *     degré 3). Plus aucun « extremum du coût total » (un coût total réaliste est croissant).
 *   - famille "B" — bénéfice maximum via égalité des marginales, prix p(x) = k − m·x (m > 0) ×
 *     coût cubique, construite "à l'envers" à partir des 2 racines désirées de C'_T(x) = R'_T(x).
 *   - famille "bonus" (fréquence rare) — greffée sur le CONTEXTE de la famille A (coût total
 *     cubique réaliste), résolution par dichotomie de l'équation réduite P(q)=q·C'_T(q)-C_T(q)=0
 *     (équivalente à C_m(q)=C_M(q), coût marginal = coût moyen : production qui minimise le coût
 *     moyen).
 *
 * Type pur, aucune logique — construction "à l'envers"/formules fermées en Couche A
 * (`generateurs5e/contexteEconomique/index.ts`).
 */

// ============================================================================
// Famille A — coût marginal.
// ============================================================================

export interface CoutTotalDegre2 {
  degre: 2;
  a: number;
  b: number;
  c: number;
}

export interface CoutTotalDegre3 {
  degre: 3;
  a: number;
  b: number;
  c: number;
  d: number;
}

export type CoutTotalA = CoutTotalDegre2 | CoutTotalDegre3;

/** Minimum économique demandé au dernier écran de la famille A : coût moyen minimal (coût de
 * degré 2 : q = √(c/a), C_M = 2√(ac) + b) ou coût marginal minimal (coût de degré 3 : q = −b/(3a),
 * C'_T(q) = c − b²/(3a)). `exact` : q et la valeur sont entiers (régime sans calculatrice). */
export interface MinimumEconomiqueA {
  grandeur: "coutMoyen" | "coutMarginal";
  q: number;
  valeur: number;
  exact: boolean;
}

export interface ExerciceContexteEconomiqueA {
  famille: "A";
  coutTotal: CoutTotalA;
  q0: number;
  /** C_T(q0+1) - C_T(q0), TOUJOURS exact (coefficients et q0 entiers). */
  cmDiscret: number;
  /** C'_T(q0), TOUJOURS exact. */
  cmDerivee: number;
  /** |cmDiscret - cmDerivee|, exact. */
  ecartAbsolu: number;
  /** ecartAbsolu / |cmDerivee| * 100 — PAS exact en général, seul champ de la famille A à
   * annoncer une précision décimale (voir CLAUDE.md, "Annonce de précision"). */
  ecartPourcent: number;
  /** Dernier écran : coût moyen minimal (degré 2) ou coût marginal minimal (degré 3). */
  minimum: MinimumEconomiqueA;
}

// ============================================================================
// Famille B — bénéfice maximum via égalité des marginales.
// ============================================================================

export interface ExerciceContexteEconomiqueB {
  famille: "B";
  /** p(x) = m x + k (prix), m < 0 et k > 0 : prix décroissant, positif sur le domaine. */
  m: number;
  k: number;
  /** C_T(x) = a x³ + b x² + c x + d (coût), a > 0 (garantit que x_opt, racine positive de
   * Cm=Rm, est bien un MAXIMUM de B — voir `generateurs5e/contexteEconomique/index.ts` pour la
   * dérivation complète). */
  a: number;
  b: number;
  c: number;
  d: number;
  /** Racine positive retenue de Cm(x)=Rm(x) — où le bénéfice est maximal. */
  xOpt: number;
  /** Racine négative de la même équation — à rejeter explicitement (production négative
   * impossible). */
  xNeg: number;
  /** B(xOpt) = R_T(xOpt) - C_T(xOpt), exact (coefficients et xOpt entiers par construction), > 0. */
  beneficeMax: number;
  /** Points test entiers de part et d'autre de xOpt (0 < avant < xOpt < apres), pour le signe de
   * B' (valeurs de B' demandées à l'élève, audit 5e ch. 5, décision B). */
  pointTestAvant: number;
  pointTestApres: number;
}

// ============================================================================
// Bonus (fréquence rare) — dichotomie sur P(q) = q·C'_T(q) - C_T(q), greffée sur le contexte A.
// ============================================================================

export interface IterationDichotomie {
  gauche: number;
  droite: number;
  /** (gauche+droite)/2 — TOUJOURS une décimale exacte (dénominateur puissance de 2). */
  milieu: number;
  /** Signe de P(milieu). */
  signeMilieu: 1 | -1;
  /** Lequel des 2 sous-intervalles contient la racine (à conserver pour l'itération suivante). */
  garderCote: "gauche" | "droite";
}

export interface ExerciceContexteEconomiqueBonus {
  famille: "bonus";
  coutTotal: CoutTotalDegre3;
  /** Intervalle de départ donné à l'élève — signes de P opposés aux 2 bornes, vérifié à la
   * génération. */
  borneGauche: number;
  borneDroite: number;
  /** Racine "vraie" de P(q)=0 (haute précision, calculée une fois à la génération par
   * dichotomie interne poussée à convergence) — vérité terrain pour l'écran final, JAMAIS
   * recalculée depuis les réponses de l'élève aux itérations affichées. */
  racineApprochee: number;
  /** Exactement NB_ITERATIONS_DICHOTOMIE (4) itérations, PRÉ-CALCULÉES à la génération — vérité
   * terrain pour chaque écran d'itération, jamais recalculée depuis la saisie élève à l'écran
   * précédent (même convention que "bloc état actuel" ailleurs sur la plateforme). */
  iterations: IterationDichotomie[];
  /** Tolérance RÉELLEMENT codée pour le champ final (demi-largeur de l'intervalle après la
   * dernière itération affichée — garantit qu'une réponse fidèle aux 4 itérations montrées est
   * toujours acceptée), et donc littéralement le texte annoncé à l'écran final. */
  toleranceFinale: number;
}

export type ExerciceContexteEconomique = ExerciceContexteEconomiqueA | ExerciceContexteEconomiqueB | ExerciceContexteEconomiqueBonus;

export type GenerateurExerciceContexteEconomique = () => ExerciceContexteEconomique;

export const NB_ITERATIONS_DICHOTOMIE = 4;
