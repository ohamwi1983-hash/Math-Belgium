/**
 * Couche core — « Signe des racines sans les calculer » (gen114, 4e, chapitre 2, section `resoudre`,
 * sous-section « Relations de Viète », processus 2 APPLIQUER). Rappel du cours : si P = c/a < 0, deux
 * racines de signes opposés (Δ forcément positif) ; si P > 0 et Δ > 0, même signe, celui de
 * S = −b/a ; si P > 0 et Δ < 0, aucune racine.
 *
 * Variantes :
 * - `signes` : écrans P → (Δ si P > 0) → (S si Δ > 0) → verdict : 2, 3 ou 4 écrans selon le verdict ;
 * - `racineEvidente` : racine évidente x₁ (a ± b + c = 0) → P → x₂ = P/x₁ → verdict.
 * Le VERDICT (signes opposés, deux positives, deux négatives, aucune racine) est tiré au hasard,
 * équiprobable dans la variante, AVANT les nombres — jamais fixé par `forme`.
 */

export type VarianteSigneRacines = "signes" | "racineEvidente";

export type VerdictSignes = "opposes" | "positives" | "negatives" | "aucune";

export type PhaseSigneRacines = "P" | "delta" | "S" | "x1" | "x2" | "verdict";

export interface ExerciceSigneRacines {
  variante: VarianteSigneRacines;
  verdict: VerdictSignes;
  a: number;
  b: number;
  c: number;
  /** Ordre d'affichage des 4 verdicts (tiré à la génération). */
  options: VerdictSignes[];
}
