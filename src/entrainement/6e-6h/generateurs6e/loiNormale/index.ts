import type { ExerciceLoiNormale } from "../../core6e/loiNormale.types";
import { construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleD, construireFamilleE } from "./familles";

export { construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleD, construireFamilleE } from "./familles";

/**
 * `6gen51` « Loi normale » (6e ch. 8, § 6, Appliquer). Les 14 identifiants d'origine gardent leur
 * place (codes `?code=` inchangés) ; leur contenu suit la refonte : « symétrique » = P(0 ≤ Z ≤ t),
 * « encadrée » = intervalle centré P(−t ≤ Z ≤ t) ; « cumulée » contient désormais les cibles négatives
 * (symétrie). Deux variantes ajoutées EN FIN : « ≥ » en sens inverse (C et D).
 */

export type IdVarianteLoiNormale =
  | "A_inferieur"
  | "A_superieur"
  | "A_intervalle"
  | "B_inferieur"
  | "B_superieur"
  | "B_intervalle"
  | "C_cumulee"
  | "C_symetrique"
  | "C_encadree"
  | "D_cumulee"
  | "D_symetrique"
  | "D_encadree"
  | "E_deuxCotes"
  | "E_unCote"
  | "C_superieure"
  | "D_superieure";

export const CATALOGUE_VARIANTES: { id: IdVarianteLoiNormale; label: string }[] = [
  { id: "A_inferieur", label: "A — Z ∼ 𝒩(0 ; 1) : P(Z ≤ z)" },
  { id: "A_superieur", label: "A — Z ∼ 𝒩(0 ; 1) : P(Z ≥ z)" },
  { id: "A_intervalle", label: "A — Z ∼ 𝒩(0 ; 1) : P(z₁ ≤ Z ≤ z₂)" },
  { id: "B_inferieur", label: "B — X ∼ 𝒩(μ ; σ) : P(X ≤ x)" },
  { id: "B_superieur", label: "B — X ∼ 𝒩(μ ; σ) : P(X ≥ x)" },
  { id: "B_intervalle", label: "B — X ∼ 𝒩(μ ; σ) : P(x₁ ≤ X ≤ x₂)" },
  { id: "C_cumulee", label: "C — Sens inverse : P(Z ≤ t) = p (avec symétrie si p < 0,5)" },
  { id: "C_symetrique", label: "C — Sens inverse : P(0 ≤ Z ≤ t) = p" },
  { id: "C_encadree", label: "C — Sens inverse : P(−t ≤ Z ≤ t) = p" },
  { id: "D_cumulee", label: "D — Sens inverse en contexte : P(X ≤ a) = p" },
  { id: "D_symetrique", label: "D — Sens inverse en contexte : P(μ ≤ X ≤ a) = p" },
  { id: "D_encadree", label: "D — Sens inverse en contexte : intervalle centré sur μ" },
  { id: "E_deuxCotes", label: "E — Règle empirique : hors de l'intervalle (deux côtés)" },
  { id: "E_unCote", label: "E — Règle empirique : d'un seul côté" },
  { id: "C_superieure", label: "C — Sens inverse : P(Z ≥ t) = p (avec symétrie si p > 0,5)" },
  { id: "D_superieure", label: "D — Sens inverse en contexte : P(X ≥ a) = p" },
];

export function construireAvecVarianteId(id: IdVarianteLoiNormale | string): ExerciceLoiNormale {
  switch (id) {
    case "A_inferieur":
      return construireFamilleA("inferieur");
    case "A_superieur":
      return construireFamilleA("superieur");
    case "A_intervalle":
      return construireFamilleA("intervalle");
    case "B_inferieur":
      return construireFamilleB("inferieur");
    case "B_superieur":
      return construireFamilleB("superieur");
    case "B_intervalle":
      return construireFamilleB("intervalle");
    case "C_cumulee":
      return construireFamilleC("inferieur");
    case "C_symetrique":
      return construireFamilleC("depuisZero");
    case "C_encadree":
      return construireFamilleC("centre");
    case "C_superieure":
      return construireFamilleC("superieur");
    case "D_cumulee":
      return construireFamilleD("inferieur");
    case "D_symetrique":
      return construireFamilleD("depuisZero");
    case "D_encadree":
      return construireFamilleD("centre");
    case "D_superieure":
      return construireFamilleD("superieur");
    case "E_deuxCotes":
      return construireFamilleE(false);
    case "E_unCote":
      return construireFamilleE(true);
    default:
      return genererExerciceLoiNormale();
  }
}

/** Tirage libre : une famille au hasard (à parts égales), puis sa forme. */
export function genererExerciceLoiNormale(): ExerciceLoiNormale {
  const f = Math.floor(Math.random() * 5);
  return [construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleD, construireFamilleE][f]();
}
