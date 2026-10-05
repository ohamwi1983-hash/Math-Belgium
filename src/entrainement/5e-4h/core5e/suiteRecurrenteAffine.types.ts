// Contrat core — 5gen19 "Suite récurrente affine et régime permanent". Nouvelle famille de suite
// (récurrence u_(n+1)=a×u_n+b, ni arithmétique ni géométrique) — contexte dosage/dilution.
// `regime` distingue le cas usuel (|a|<1, convergence vers un régime permanent L=b/(1-a)) du cas
// rare (|a|≥1, piège riche — pas de régime permanent, la suite diverge).
import type { FractionQ } from "./suitesGeometriques.types";

export type RegimeSuiteRecurrenteAffine = "convergent" | "divergent";

export interface ExerciceSuiteRecurrenteAffine {
  /** `a=1∓pct/100` (pct entier) — `FractionQ` (jamais `number`) : affiché en fraction irréductible,
   * jamais en décimal développé (`prompt-chapitre-suites-audit-formatage.md`, même bug que
   * 5gen15/16). */
  a: FractionQ;
  b: number;
  u1: number;
  regime: RegimeSuiteRecurrenteAffine;
  /** Régime permanent L=b/(1-a) — `null` ssi `regime==="divergent"` (n'existe pas). `FractionQ`
   * pour la même raison que `a`. */
  L: FractionQ | null;
  u2: FractionQ;
  u3: FractionQ;
  u4: FractionQ;
  phraseEnonce: string;
  variableGrandeur: string;
}

export type GenerateurExerciceSuiteRecurrenteAffine = () => ExerciceSuiteRecurrenteAffine;
