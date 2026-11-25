import { phiTable } from "./tablePhi";

/**
 * Couche core — `6gen120` « Loi normale : retrouver μ ou σ » (6e ch. 8, § 6, processus 3 TRANSFÉRER).
 * X ∼ 𝒩(μ ; σ) en contexte ; une proportion connue (« 10,56 % mesurent plus de 182 cm ») donne z par
 * la table À L'ENVERS (proportion = valeur exacte d'une case : un seul z possible), puis la relation
 * x = μ + zσ donne le paramètre inconnu :
 * - `sigma` : μ connu → σ = (x₀ − μ) / z ;
 * - `mu` : σ connu → μ = x₀ − zσ ;
 * - `systeme` : deux proportions → μ + z₁σ = x₁ et μ + z₂σ = x₂, d'où σ puis μ.
 * Piège : le signe de z (borne sous la moyenne, proportion « plus de » supérieure à 50 %…).
 */

export type VarianteNP = "sigma" | "mu" | "systeme";
export type PhaseNP = "z" | "sigma" | "mu";

export interface DonneeNP {
  /** z en centièmes (signé) : x = μ + zσ. */
  zc: number;
  /** « inf » : P(X ≤ x) donnée ; « sup » : P(X ≥ x) donnée. */
  sens: "inf" | "sup";
}

export interface ExerciceNP {
  variante: VarianteNP;
  ctx: number;
  mu: number;
  sigma: number;
  donnees: DonneeNP[];
}

export const phases = (e: ExerciceNP): PhaseNP[] => (e.variante === "sigma" ? ["z", "sigma"] : e.variante === "mu" ? ["z", "mu"] : ["z", "sigma", "mu"]);

export const zDe = (d: DonneeNP) => d.zc / 100;
export const xDe = (e: ExerciceNP, d: DonneeNP) => Math.round((e.mu + (d.zc * e.sigma) / 100) * 10) / 10;
/** Proportion donnée (quatre décimales, valeur exacte d'une case de la table ou son complément). */
export const proportion = (d: DonneeNP) => {
  const phi = phiTable(zDe(d));
  return Math.round((d.sens === "inf" ? phi : 1 - phi) * 1e4) / 1e4;
};
/** Valeur de Φ à chercher dans la table (z ≥ 0 : Φ(z) ; z < 0 : Φ(−z)). */
export const valeurTable = (d: DonneeNP) => phiTable(Math.abs(zDe(d)));
