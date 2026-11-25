import type { ExerciceExtensionsBinomialeNormaleBayes } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import { construireFamilleA, construireFamilleD, construireFamilleF } from "./familles";

export { construireFamilleA, construireFamilleD, construireFamilleF } from "./familles";

/**
 * `6gen52` (6e ch. 8, § 7, Transférer). Les variantes B (binomiale), C (loi normale inverse) et E (loi
 * uniforme) sont RETIRÉES (décision 3 de l'utilisateur) mais gardées à leur place (`retiree: true`,
 * jamais montrées ni tirées) : les codes `?code=` de A, D et F gardent leur variante ; un ancien code
 * d'une variante retirée rouvre un tirage libre.
 */

export type IdVarianteExtensionsBinomialeNormaleBayes =
  | "A_compose"
  | "A_direct"
  | "B_exactement"
  | "B_auMoins"
  | "B_auPlus"
  | "B_aucun"
  | "B_tous"
  | "C_cumulee"
  | "C_symetrique"
  | "C_encadree"
  | "D_bayes3"
  | "E_uniforme"
  | "F_reconstruire";

export const CATALOGUE_VARIANTES: { id: IdVarianteExtensionsBinomialeNormaleBayes; label: string; retiree?: boolean }[] = [
  { id: "A_compose", label: "A — Épreuve composée, puis trouver n" },
  { id: "A_direct", label: "A — Épreuve simple, puis trouver n" },
  { id: "B_exactement", label: "B — (retirée : voir 6gen50)", retiree: true },
  { id: "B_auMoins", label: "B — (retirée : voir 6gen50)", retiree: true },
  { id: "B_auPlus", label: "B — (retirée : voir 6gen50)", retiree: true },
  { id: "B_aucun", label: "B — (retirée : voir 6gen50)", retiree: true },
  { id: "B_tous", label: "B — (retirée : voir 6gen50)", retiree: true },
  { id: "C_cumulee", label: "C — (retirée : voir 6gen51)", retiree: true },
  { id: "C_symetrique", label: "C — (retirée : voir 6gen51)", retiree: true },
  { id: "C_encadree", label: "C — (retirée : voir 6gen51)", retiree: true },
  { id: "D_bayes3", label: "D — Théorème de Bayes à trois catégories" },
  { id: "E_uniforme", label: "E — (retirée : voir 6gen115)", retiree: true },
  { id: "F_reconstruire", label: "F — Loi reconstruite, espérance et total attendu" },
];

export function construireAvecVarianteId(id: IdVarianteExtensionsBinomialeNormaleBayes | string): ExerciceExtensionsBinomialeNormaleBayes {
  switch (id) {
    case "A_compose":
      return construireFamilleA("compose");
    case "A_direct":
      return construireFamilleA("direct");
    case "D_bayes3":
      return construireFamilleD();
    case "F_reconstruire":
      return construireFamilleF();
    default:
      return genererExerciceExtensionsBinomialeNormaleBayes();
  }
}

/** Tirage libre : une variante non retirée au hasard, à parts égales. */
export function genererExerciceExtensionsBinomialeNormaleBayes(): ExerciceExtensionsBinomialeNormaleBayes {
  const actives = CATALOGUE_VARIANTES.filter((v) => !v.retiree);
  return construireAvecVarianteId(actives[Math.floor(Math.random() * actives.length)].id);
}
