/**
 * Couche core (5e) — contrat pour 5gen33 ("Contexte économique"), chapitre "Dérivées et
 * applications". 3 sous-générateurs STRUCTURELLEMENT DISJOINTS, jamais mélangés dans un même
 * exercice :
 *   - famille "A" — coût marginal : approximation discrète vs dérivée, coût total polynomial
 *     degré 2 OU 3, sous-cas "extremum existe / n'existe pas" tiré indépendamment du degré.
 *   - famille "B" — bénéfice maximum via égalité des marginales, prix affine × coût cubique,
 *     construite "à l'envers" à partir des 2 racines désirées de Cm(x)=Rm(x).
 *   - famille "bonus" (fréquence rare) — greffée sur le CONTEXTE de la famille A (coût total
 *     cubique), résolution par dichotomie de l'équation réduite P(q)=q·C'_T(q)-C_T(q)=0
 *     (équivalente à C_m(q)=C_M(q), coût marginal = coût moyen).
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

export interface ExtremumCoutTotal {
  position: number;
  nature: "max" | "min";
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
  /** Sous-cas tiré INDÉPENDAMMENT du degré — degré 2 : toujours true (C'_T linéaire, une seule
   * racine toujours). Degré 3 : dépend du signe de Δ=4b²-12ac. */
  extremumExiste: boolean;
  /** [] si !extremumExiste ; longueur 1 (degré 2, ou degré 3 à racine double — jamais généré
   * délibérément) ou 2 (degré 3, Δ>0) sinon. Positions/natures JAMAIS filtrées par signe — la
   * consigne ne restreint pas au domaine q>0 pour ce sous-cas (contrairement à la famille B). */
  extrema: ExtremumCoutTotal[];
}

// ============================================================================
// Famille B — bénéfice maximum via égalité des marginales.
// ============================================================================

export interface ExerciceContexteEconomiqueB {
  famille: "B";
  /** p(x) = m x + k (prix). */
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
  /** B(xOpt) = R_T(xOpt) - C_T(xOpt), exact (coefficients et xOpt entiers par construction). */
  beneficeMax: number;
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
